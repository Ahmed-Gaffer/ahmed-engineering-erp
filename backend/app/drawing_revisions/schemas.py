from datetime import date
from pydantic import BaseModel, field_validator


class DrawingRevisionCreate(BaseModel):
    drawing_id: int
    revision_number: int
    description: str | None = None
    file_path: str | None = None
    approved_by: str | None = None
    approved_date: date | None = None
    status: str = "submitted"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"submitted", "under_review", "approved", "rejected"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class DrawingRevisionUpdate(BaseModel):
    drawing_id: int | None = None
    revision_number: int | None = None
    description: str | None = None
    file_path: str | None = None
    approved_by: str | None = None
    approved_date: date | None = None
    status: str | None = None
