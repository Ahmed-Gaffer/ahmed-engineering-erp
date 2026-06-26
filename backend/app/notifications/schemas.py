from pydantic import BaseModel


class NotificationCreate(BaseModel):
    title: str
    message: str | None = None
    type: str = "info"
    link: str | None = None
