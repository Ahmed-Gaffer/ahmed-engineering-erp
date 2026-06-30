from pydantic import BaseModel
from datetime import datetime


class ActivityResponse(BaseModel):
    id: int
    user_id: int
    username: str
    action: str
    entity_type: str | None = None
    entity_id: int | None = None
    details: str | None = None
    created_at: datetime | None = None


class ActivityListResponse(BaseModel):
    items: list[ActivityResponse]
    total: int
    page: int
    limit: int
