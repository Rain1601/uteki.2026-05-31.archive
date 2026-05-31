"""Market Dashboard API — 宏观指标仪表盘端点"""

import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from uteki.common.cache import get_cache_service
from uteki.domains.auth.deps import get_current_user
from uteki.domains.macro.services.interpretation_service import (
    get_interpretation_service,
)
from uteki.domains.macro.services.market_dashboard_service import get_market_dashboard_service

logger = logging.getLogger(__name__)
router = APIRouter()

_TTL = 86400


def _today() -> str:
    return date.today().isoformat()


@router.get("/overview")
async def get_overview():
    """全量概览：3 类指标当前值 + 信号灯（无历史，快速）"""
    cache = get_cache_service()

    async def _fetch():
        try:
            service = get_market_dashboard_service()
            return await service.get_overview()
        except Exception as e:
            logger.error(f"Dashboard overview error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return await cache.get_or_set(
        f"uteki:dashboard:overview:{_today()}", _fetch, ttl=_TTL,
    )


@router.get("/valuation")
async def get_valuation_detail(
    limit: int = Query(52, ge=1, le=520, description="历史数据条数"),
):
    """估值详情 + 图表历史"""
    cache = get_cache_service()

    async def _fetch():
        try:
            service = get_market_dashboard_service()
            return await service.get_valuation_detail(limit=limit)
        except Exception as e:
            logger.error(f"Dashboard valuation error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return await cache.get_or_set(
        f"uteki:dashboard:valuation:{_today()}:{limit}", _fetch, ttl=_TTL,
    )


@router.get("/liquidity")
async def get_liquidity_detail(
    limit: int = Query(52, ge=1, le=520, description="历史数据条数"),
):
    """流动性详情 + 图表历史"""
    cache = get_cache_service()

    async def _fetch():
        try:
            service = get_market_dashboard_service()
            return await service.get_liquidity_detail(limit=limit)
        except Exception as e:
            logger.error(f"Dashboard liquidity error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return await cache.get_or_set(
        f"uteki:dashboard:liquidity:{_today()}:{limit}", _fetch, ttl=_TTL,
    )


@router.get("/flow")
async def get_flow_detail():
    """资金流向详情"""
    cache = get_cache_service()

    async def _fetch():
        try:
            service = get_market_dashboard_service()
            return await service.get_flow_detail()
        except Exception as e:
            logger.error(f"Dashboard flow error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))

    return await cache.get_or_set(
        f"uteki:dashboard:flow:{_today()}", _fetch, ttl=_TTL,
    )


# ── AI Interpretation ─────────────────────────────────────────────────────


def _interp_to_dict(row) -> dict | None:
    if row is None:
        return None
    return {
        "id": row.id,
        "as_of_date": row.as_of_date.isoformat() if row.as_of_date else None,
        "payload": row.payload or {},
        "dashboard_snapshot": row.dashboard_snapshot or {},
        "provider": row.provider,
        "model": row.model,
        "latency_ms": row.latency_ms,
        "source_tag": row.source_tag,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


@router.get("/interpretation")
async def get_interpretation():
    """最新的 AI 宏观解读 + 前一日对比。

    返回结构：
        { "today": {...} | null, "previous": {...} | null }

    `today` 是按 as_of_date desc 排序后的第一行；`previous` 是第二行（不一定
    严格 yesterday，但 UI 只关心「上一次」）。两个字段都可能为 null（首次
    部署时尚未生成）—— 前端要展示空态 + 引导。
    """
    try:
        service = get_interpretation_service()
        today, previous = await service.get_today_and_previous()
        return {
            "today": _interp_to_dict(today),
            "previous": _interp_to_dict(previous),
        }
    except Exception as e:
        logger.error(f"Interpretation read error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interpretation/generate")
async def trigger_interpretation(
    force: bool = Query(False, description="重新生成今日已存在的解读"),
    user: dict = Depends(get_current_user),
):
    """手动触发今日解读生成（dev / 调试 / 数据未到位时补救）。

    任意已登录用户可触发；scheduler 每天会自动跑一次。
    """
    try:
        service = get_interpretation_service()
        row = await service.generate_for_today(
            user_id=user.get("user_id"),
            force=force,
            source_tag="manual",
        )
        if row is None:
            raise HTTPException(status_code=502, detail="生成失败 - 检查 LLM 配置 / dashboard 数据可用性")
        return {"status": "ok", "interpretation": _interp_to_dict(row)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Interpretation generate error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
