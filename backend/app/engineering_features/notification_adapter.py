from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.notifications.models import Notification
from app.workflow.engine import log_action


def _build_title(entity_type: str, action: str) -> str:
    name = entity_type.replace("_", " ").title()
    action_label = action.replace("_", " ").title()
    return f"{name} {action_label}"


async def handle_engineering_event(event: dict) -> None:
    payload = event.get("payload", {})
    entity_type = payload.get("entity_type", "")
    entity_id = payload.get("entity_id")
    action = payload.get("action", "")
    from_status = payload.get("from_status")
    to_status = payload.get("to_status")
    actor_id = payload.get("actor_id")
    actor_name = payload.get("actor_name", "")
    assigned_to = payload.get("assigned_to")
    comment = payload.get("comment", "")
    user_id = payload.get("user_id")
    link = payload.get("link", "")

    if not user_id:
        return

    title = _build_title(entity_type, action)

    async with async_session() as db:
        notif = Notification(user_id=user_id, title=title, message=comment or None, type="info", link=link or None)
        db.add(notif)
        await db.flush()
        await log_action(db, entity_type, entity_id, action, from_status, to_status, actor_id, actor_name, assigned_to, comment)
        await db.commit()
