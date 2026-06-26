from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.notifications.crud import notification_crud
from app.notifications.schemas import NotificationCreate

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/")
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    user=Depends(require_role("admin", "engineer")),
):
    return await notification_crud.list(db, user_id=user.id, page=page, limit=limit, unread_only=unread_only)


@router.get("/unread-count")
async def unread_count(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    try:
        count = await notification_crud.unread_count(db, user_id=user.id)
        return {"count": count}
    except Exception:
        return {"count": 0}


@router.post("/")
async def create_notification(data: NotificationCreate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    obj = await notification_crud.create(db, user_id=user.id, title=data.title, message=data.message, type=data.type, link=data.link)
    return {"id": obj.id, "title": obj.title, "message": obj.message}


@router.put("/{id}/read")
async def mark_read(id: int, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    ok = await notification_crud.mark_read(db, id, user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"ok": True}


@router.put("/read-all")
async def mark_all_read(db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    count = await notification_crud.mark_all_read(db, user.id)
    return {"updated": count}
