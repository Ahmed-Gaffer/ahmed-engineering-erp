from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import WorkflowLog
from .schemas import WorkflowActionCreate


async def log_action(
    db: AsyncSession,
    entity_type: str,
    entity_id: int,
    action: str,
    from_status: str | None = None,
    to_status: str | None = None,
    actor_id: int | None = None,
    actor_name: str | None = None,
    assigned_to: str | None = None,
    comment: str | None = None,
) -> WorkflowLog:
    log = WorkflowLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        from_status=from_status,
        to_status=to_status,
        actor_id=actor_id,
        actor_name=actor_name,
        assigned_to=assigned_to,
        comment=comment,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_timeline(
    db: AsyncSession,
    entity_type: str,
    entity_id: int,
) -> list[WorkflowLog]:
    result = await db.execute(
        select(WorkflowLog)
        .where(WorkflowLog.entity_type == entity_type, WorkflowLog.entity_id == entity_id)
        .order_by(WorkflowLog.created_at)
    )
    return result.scalars().all()


async def get_entity_logs(
    db: AsyncSession,
    entity_type: str,
    entity_id: int,
) -> list[WorkflowLog]:
    return await get_timeline(db, entity_type, entity_id)
