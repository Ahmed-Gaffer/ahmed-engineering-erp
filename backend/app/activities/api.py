from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import require_role
from app.core.audit import AuditLog
from app.auth.models import User

router = APIRouter(prefix="/api/activities", tags=["activities"])


@router.get("/")
async def list_activities(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=100),
    entity_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("admin", "engineer")),
):
    base = select(AuditLog)
    if entity_type:
        base = base.where(AuditLog.entity_type == entity_type)

    count_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = count_result.scalar() or 0

    query = select(
        AuditLog.id, AuditLog.user_id, AuditLog.action, AuditLog.entity_type,
        AuditLog.entity_id, AuditLog.details, AuditLog.created_at,
        User.username,
    ).join(User, AuditLog.user_id == User.id, isouter=True)

    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)

    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    items = [{
        "id": r.id, "user_id": r.user_id, "username": r.username or "system",
        "action": r.action, "entity_type": r.entity_type, "entity_id": r.entity_id,
        "details": r.details,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in rows]

    return {"items": items, "total": total, "page": page, "limit": limit}
