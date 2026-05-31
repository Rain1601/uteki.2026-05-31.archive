"""add notifications table

Revision ID: 20260531_0100
Revises: de16d50927b8
Create Date: 2026-05-31 11:20:00.000000+08:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260531_0100"
down_revision: Union[str, None] = "de16d50927b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    schema = "notification" if _is_postgres() else None

    if _is_postgres():
        op.execute("CREATE SCHEMA IF NOT EXISTS notification")

    op.create_table(
        "notifications",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("extra_data", sa.JSON(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
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
        sa.PrimaryKeyConstraint("id"),
        schema=schema,
    )
    op.create_index(
        "idx_notif_user_read",
        "notifications",
        ["user_id", "is_read"],
        schema=schema,
    )


def downgrade() -> None:
    schema = "notification" if _is_postgres() else None
    op.drop_index("idx_notif_user_read", table_name="notifications", schema=schema)
    op.drop_table("notifications", schema=schema)
