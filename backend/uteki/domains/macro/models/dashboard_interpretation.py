"""Daily AI-generated interpretation of the macro market dashboard.

One row per day. The scheduler runs after US market close and writes:
  - a snapshot of the dashboard data we used as input
  - the LLM's structured interpretation (overview, per-category readings,
    key signals, day-over-day commentary)

The frontend reads the latest row + the previous-day row to render
"今日解读 · 昨日对比" on /macro/market-dashboard.
"""
from __future__ import annotations

from datetime import date as DateType
from typing import Any, Optional

from sqlalchemy import Date, Index, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from uteki.common.base import Base, TimestampMixin, UUIDMixin, get_table_args


class MacroInterpretation(Base, UUIDMixin, TimestampMixin):
    """One AI-generated reading of the dashboard, anchored to a date."""

    __tablename__ = "macro_interpretations"
    __table_args__ = get_table_args(
        UniqueConstraint("as_of_date", name="uq_macro_interpretation_date"),
        Index("idx_macro_interp_date", "as_of_date"),
        schema="macro",
    )

    # The trading date this interpretation describes (one row per date).
    as_of_date: Mapped[DateType] = mapped_column(Date, nullable=False)

    # Snapshot of the input we fed to the LLM (categories[], indicators, etc.).
    # Lets the frontend render tape-truth comparisons even if the live API
    # has since moved.
    dashboard_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    # The structured LLM output:
    #   {
    #     "overview": "...",
    #     "valuation_reading": "...",
    #     "liquidity_reading": "...",
    #     "flow_reading": "...",
    #     "key_signals": [
    #       {"category": "valuation", "indicator_id": "spy_pe",
    #        "level": "high", "comment": "..."},
    #       ...
    #     ],
    #     "vs_yesterday": "...",          // null on the very first run
    #     "watchpoints": ["...", "..."]
    #   }
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    # Provider/model that generated this reading
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="openai")
    model: Mapped[str] = mapped_column(String(100), nullable=False, default="deepseek-v3.2")

    # Latency for observability
    latency_ms: Mapped[Optional[int]] = mapped_column(default=None)

    # Free-form note (e.g. "manual trigger", "scheduler", "backfill")
    source_tag: Mapped[Optional[str]] = mapped_column(String(50), default=None)
