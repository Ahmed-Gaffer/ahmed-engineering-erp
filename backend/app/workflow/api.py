from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.workflow.engine import log_action, get_timeline
from app.workflow.models import WorkflowLog
from app.workflow.schemas import WorkflowActionCreate, WorkflowLogResponse, WorkflowTimelineResponse

router = APIRouter(prefix="/api/workflow", tags=["Workflow"])


@router.get("/logs")
async def list_logs(
    entity_type: str = Query(...),
    entity_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    logs = await get_timeline(db, entity_type, entity_id)
    return logs


@router.get("/logs/recent", dependencies=[Depends(get_current_user)])
async def recent_logs(limit: int = Query(20, le=100), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkflowLog).order_by(WorkflowLog.created_at.desc()).limit(limit)
    )
    return result.scalars().all()


@router.post("/actions", dependencies=[Depends(require_role("admin", "engineer"))])
async def create_action(data: WorkflowActionCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    log = await log_action(
        db=db,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        action=data.action,
        from_status=None,
        to_status=None,
        actor_id=user.id,
        actor_name=user.name if hasattr(user, 'name') else None,
        assigned_to=data.assigned_to,
        comment=data.comment,
    )
    return log
