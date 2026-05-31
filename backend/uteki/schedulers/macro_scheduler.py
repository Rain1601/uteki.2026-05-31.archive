"""Macro Scheduler — generates the daily AI interpretation of the
/macro/market-dashboard data.

Fires once a day at 22:00 UTC (≈ 6 PM ET, after US market close + ~30 min
of settled prints). The job is idempotent — generate_for_today() upserts by
as_of_date, so repeated firings just refresh the same row.
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from uteki.domains.macro.services.interpretation_service import (
    get_interpretation_service,
)

logger = logging.getLogger(__name__)


class MacroScheduler:
    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self._last_run: Optional[datetime] = None
        self._last_result: Optional[dict] = None

    def initialize(self):
        if self.scheduler is not None:
            logger.warning("Macro scheduler already initialized")
            return

        self.scheduler = AsyncIOScheduler(
            timezone="UTC",
            job_defaults={
                "coalesce": True,
                "max_instances": 1,
                "misfire_grace_time": 1800,
            },
        )

        # Daily at 22:00 UTC (≈ 5 PM CT / 6 PM ET / 30 min after NYSE close)
        self.scheduler.add_job(
            self._daily_interpretation_job,
            trigger=CronTrigger(hour=22, minute=0),
            id="macro_interpretation_daily",
            name="Macro Dashboard AI Interpretation (daily)",
            replace_existing=True,
        )

        logger.info("Macro scheduler initialized — daily reading at 22:00 UTC")

    def start(self):
        if self.scheduler is None:
            self.initialize()
        if self.scheduler and not self.scheduler.running:
            self.scheduler.start()
            logger.info("Macro scheduler started")

    def shutdown(self):
        if self.scheduler and self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            logger.info("Macro scheduler stopped")

    # ── Jobs ─────────────────────────────────────────────────────────────

    async def _daily_interpretation_job(self):
        self._last_run = datetime.utcnow()
        try:
            service = get_interpretation_service()
            row = await service.generate_for_today(
                user_id=None,  # scheduler context — adapter falls back to DB-resolved key
                force=True,
                source_tag="scheduler",
            )
            ok = row is not None
            self._last_result = {
                "ok": ok,
                "as_of_date": row.as_of_date.isoformat() if (row and row.as_of_date) else None,
                "latency_ms": row.latency_ms if row else None,
            }
            logger.info(f"[macro_scheduler] daily interpretation result: {self._last_result}")
        except Exception as e:
            logger.error(f"[macro_scheduler] daily job failed: {e}", exc_info=True)
            self._last_result = {"ok": False, "error": str(e)}

    # ── Manual trigger (for /admin button or one-off backfills) ──────────

    async def run_now(self) -> dict:
        await self._daily_interpretation_job()
        return self._last_result or {}


_scheduler: Optional[MacroScheduler] = None


def get_macro_scheduler() -> MacroScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = MacroScheduler()
    return _scheduler
