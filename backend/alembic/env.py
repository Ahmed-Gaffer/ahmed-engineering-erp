import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.core.base import Base
from app.auth.models import User, TokenBlacklist
from app.contractors.models import Contractor
from app.projects.models import Project
from app.phases.models import ProjectPhase
from app.codes.models import ProjectCode
from app.work_orders.models import WorkOrder
from app.work_order_items.models import WorkOrderItem
from app.drawings.models import Drawing
from app.drawing_revisions.models import DrawingRevision
from app.documents.models import Document
from app.payment_certificates.models import PaymentCertificate
from app.engineering_features.models import (
    BOQItem, Contract, IPCHeader, IPCDetail,
    DailyReport, Subcontractor, Schedule, EngDocument
)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())
