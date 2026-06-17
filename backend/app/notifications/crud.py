from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.notifications.models import Notification


class NotificationCRUD:
    async def list(self, db: AsyncSession, user_id: int, page: int = 1, limit: int = 50, unread_only: bool = False) -> dict:
        query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            query = query.where(Notification.is_read == False)
        query = query.order_by(Notification.created_at.desc()).offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        items = result.scalars().all()

        count_query = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            count_query = count_query.where(Notification.is_read == False)
        total = len(items)

        return {"items": [{"id": n.id, "title": n.title, "message": n.message, "notification_type": n.notification_type, "is_read": n.is_read, "link": n.link, "created_at": n.created_at.isoformat()} for n in items], "total": total, "page": page, "limit": limit, "pages": max(1, (total + limit - 1) // limit)}

    async def create(self, db: AsyncSession, user_id: int, title: str, message: str | None = None, notification_type: str = "info", link: str | None = None) -> Notification:
        obj = Notification(user_id=user_id, title=title, message=message, notification_type=notification_type, link=link)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    async def mark_read(self, db: AsyncSession, notification_id: int, user_id: int) -> bool:
        result = await db.execute(update(Notification).where(Notification.id == notification_id, Notification.user_id == user_id).values(is_read=True))
        await db.commit()
        return result.rowcount > 0

    async def mark_all_read(self, db: AsyncSession, user_id: int) -> int:
        result = await db.execute(update(Notification).where(Notification.user_id == user_id, Notification.is_read == False).values(is_read=True))
        await db.commit()
        return result.rowcount

    async def unread_count(self, db: AsyncSession, user_id: int) -> int:
        result = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.is_read == False))
        return len(result.scalars().all())

notification_crud = NotificationCRUD()
