"""add macro_interpretations table

Stores one AI-generated reading of /macro/market-dashboard per day.
The frontend reads the latest two rows to render today + yesterday side-by-side.

Revision ID: de16d50927b8
Revises: 20260417_0100
Create Date: 2026-05-01 10:34:17.915916+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "de16d50927b8"
down_revision: Union[str, None] = "20260417_0100"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    schema = "macro" if _is_postgres() else None

    op.create_table(
        "macro_interpretations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("as_of_date", sa.Date(), nullable=False),
        sa.Column("dashboard_snapshot", sa.JSON(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False, server_default="openai"),
        sa.Column("model", sa.String(length=100), nullable=False, server_default="deepseek-v3.2"),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("source_tag", sa.String(length=50), nullable=True),
        sa.UniqueConstraint("as_of_date", name="uq_macro_interpretation_date"),
        schema=schema,
    )
    op.create_index(
        "idx_macro_interp_date",
        "macro_interpretations",
        ["as_of_date"],
        schema=schema,
    )


def downgrade() -> None:
    schema = "macro" if _is_postgres() else None
    op.drop_index("idx_macro_interp_date", table_name="macro_interpretations", schema=schema)
    op.drop_table("macro_interpretations", schema=schema)
