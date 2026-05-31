"""LLM-driven interpretation of the macro market dashboard.

Pulls the same data /macro/market-dashboard fetches, packages it into a
compact prompt, asks an LLM for a structured reading, and persists it
keyed by date so the frontend can render today + yesterday side-by-side.

Designed to be safe to call from a scheduler (no user_id) and from an
authenticated API endpoint (with user_id).
"""
from __future__ import annotations

import json
import logging
import re
import time
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import select

from uteki.common.database import db_manager
from uteki.domains.agent.llm_adapter import (
    LLMAdapterFactory,
    LLMConfig,
    LLMMessage,
)
from uteki.domains.macro.models.dashboard_interpretation import MacroInterpretation
from uteki.domains.macro.services.market_dashboard_service import (
    get_market_dashboard_service,
)

logger = logging.getLogger(__name__)


_SYSTEM_PROMPT = """你是一位资深宏观策略分析师，每天为 utek.ai 用户撰写一份简短的市场宏观解读。

你看到的输入是 4 大类宏观信号：
- valuation: 估值（市场是否昂贵）
- liquidity: 流动性（钱多不多）
- flow: 资金流（VIX、收益率曲线、美元、BTC 等风险偏好信号）

每个类别下有多个 indicator，每个 indicator 带有 value、signal（green/yellow/red/neutral）。signal 已经由后端打好。

你需要输出一份 JSON，包含：
- overview: 一段 2-3 句的整体判断（普通投资者读得懂，必须基于数据，不能空话）
- valuation_reading: 估值层面的解读（1-2 句）
- liquidity_reading: 流动性层面的解读（1-2 句）
- flow_reading: 资金流层面的解读（1-2 句）
- key_signals: 数组，3-5 个最值得用户关注的指标，每条 {category, indicator_id, indicator_name, level: 'high'|'medium'|'low', comment: 1 句话解释为什么值得关注}
- vs_yesterday: 与昨日相比的变化（1-2 句，输入若没有昨日数据则填 null）
- watchpoints: 数组，2-4 条「未来需要观察的事项」，每条 1 句话

要求：
- 用中文
- 数据驱动，引用具体数字
- 避免「市场可能上涨」这类废话
- JSON 严格合法，不要 markdown 包裹"""


def _compact_categories(overview: dict[str, Any]) -> list[dict[str, Any]]:
    """Strip per-indicator history (we only want value + signal for the prompt)."""
    cats = overview.get("data", {}).get("categories", [])
    out = []
    for cat in cats:
        compact_indicators = []
        for ind in cat.get("indicators", []):
            compact_indicators.append({
                "id": ind.get("id"),
                "name": ind.get("name"),
                "value": ind.get("value"),
                "unit": ind.get("unit"),
                "change_pct": ind.get("change_pct"),
                "signal": ind.get("signal"),
            })
        out.append({
            "category": cat.get("category"),
            "signal": cat.get("signal"),
            "signal_label": cat.get("signal_label"),
            "indicators": compact_indicators,
        })
    return out


def _build_user_prompt(today_categories: list, yesterday_categories: Optional[list]) -> str:
    parts = [
        f"今日（{date.today().isoformat()}）宏观信号快照：",
        json.dumps(today_categories, ensure_ascii=False, indent=2),
    ]
    if yesterday_categories:
        parts += [
            "",
            "昨日同样字段（用于对比）：",
            json.dumps(yesterday_categories, ensure_ascii=False, indent=2),
        ]
    else:
        parts += ["", "（昨日无数据，vs_yesterday 字段返回 null）"]
    parts += ["", "请按系统提示输出 JSON。"]
    return "\n".join(parts)


def _extract_json(text: str) -> Optional[dict]:
    """Permissive JSON extraction — strips ```json fences if present."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            pass
    # Last resort: take from first { to last }
    if "{" in text and "}" in text:
        snippet = text[text.index("{"):text.rindex("}") + 1]
        try:
            return json.loads(snippet)
        except json.JSONDecodeError:
            pass
    return None


class MacroInterpretationService:
    """Generate / store / read daily dashboard interpretations."""

    def __init__(
        self,
        provider: str = "openai",
        model: str = "deepseek-v3.2",
    ):
        self.provider = provider
        self.model = model

    # ── Read ──────────────────────────────────────────────────────────────

    async def get_latest(self) -> Optional[MacroInterpretation]:
        async with db_manager.get_postgres_session() as session:
            result = await session.execute(
                select(MacroInterpretation).order_by(MacroInterpretation.as_of_date.desc()).limit(1)
            )
            return result.scalar_one_or_none()

    async def get_by_date(self, target_date: date) -> Optional[MacroInterpretation]:
        async with db_manager.get_postgres_session() as session:
            result = await session.execute(
                select(MacroInterpretation).where(MacroInterpretation.as_of_date == target_date)
            )
            return result.scalar_one_or_none()

    async def get_today_and_previous(self) -> tuple[Optional[MacroInterpretation], Optional[MacroInterpretation]]:
        """Return (latest, second-latest) — for today + yesterday display."""
        async with db_manager.get_postgres_session() as session:
            result = await session.execute(
                select(MacroInterpretation).order_by(MacroInterpretation.as_of_date.desc()).limit(2)
            )
            rows = list(result.scalars().all())
            today = rows[0] if rows else None
            previous = rows[1] if len(rows) > 1 else None
            return today, previous

    # ── Write ─────────────────────────────────────────────────────────────

    async def generate_for_today(
        self,
        user_id: Optional[str] = None,
        force: bool = False,
        source_tag: str = "manual",
    ) -> Optional[MacroInterpretation]:
        """Pull today's dashboard data + yesterday's snapshot, ask LLM,
        upsert by date.

        Returns None if generation fails.
        """
        today = date.today()
        existing = await self.get_by_date(today)
        if existing and not force:
            logger.info(f"[macro_interpretation] today's reading exists ({today}); skip (use force=True)")
            return existing

        # Pull current dashboard
        try:
            service = get_market_dashboard_service()
            overview = await service.get_overview()
        except Exception as e:
            logger.error(f"[macro_interpretation] dashboard fetch failed: {e}", exc_info=True)
            return None

        today_categories = _compact_categories(overview)

        # Pull yesterday's snapshot from DB (if exists)
        previous = await self.get_by_date(today - timedelta(days=1))
        yesterday_categories = None
        if previous and isinstance(previous.dashboard_snapshot, dict):
            yesterday_categories = previous.dashboard_snapshot.get("categories")

        # Call LLM
        try:
            adapter = await LLMAdapterFactory.create_unified_for_user(
                user_id=user_id,
                model=self.model,
                config=LLMConfig(temperature=0.4, max_tokens=2048),
            )
        except Exception as e:
            logger.error(f"[macro_interpretation] LLM adapter init failed: {e}", exc_info=True)
            return None

        messages = [
            LLMMessage(role="system", content=_SYSTEM_PROMPT),
            LLMMessage(role="user", content=_build_user_prompt(today_categories, yesterday_categories)),
        ]
        t0 = time.time()
        raw = ""
        try:
            async for chunk in adapter.chat(messages, stream=False):
                raw += chunk
        except Exception as e:
            logger.error(f"[macro_interpretation] LLM call failed: {e}", exc_info=True)
            return None
        latency_ms = int((time.time() - t0) * 1000)

        parsed = _extract_json(raw)
        if not parsed:
            logger.error(f"[macro_interpretation] failed to parse LLM JSON; raw[:300]={raw[:300]!r}")
            return None

        # Upsert
        async with db_manager.get_postgres_session() as session:
            obj = await session.execute(
                select(MacroInterpretation).where(MacroInterpretation.as_of_date == today)
            )
            row = obj.scalar_one_or_none()
            if row is None:
                row = MacroInterpretation(
                    as_of_date=today,
                    dashboard_snapshot={"categories": today_categories},
                    payload=parsed,
                    provider=self.provider,
                    model=self.model,
                    latency_ms=latency_ms,
                    source_tag=source_tag,
                )
                session.add(row)
            else:
                row.dashboard_snapshot = {"categories": today_categories}
                row.payload = parsed
                row.provider = self.provider
                row.model = self.model
                row.latency_ms = latency_ms
                row.source_tag = source_tag
                row.updated_at = datetime.now(timezone.utc)
            await session.commit()
            await session.refresh(row)
            logger.info(
                f"[macro_interpretation] generated for {today} "
                f"({self.provider}/{self.model}, {latency_ms}ms)"
            )
            return row


_service: Optional[MacroInterpretationService] = None


def get_interpretation_service() -> MacroInterpretationService:
    global _service
    if _service is None:
        _service = MacroInterpretationService()
    return _service
