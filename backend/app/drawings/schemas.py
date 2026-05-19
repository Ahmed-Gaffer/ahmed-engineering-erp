from pydantic import BaseModel, field_validator


class DrawingCreate(BaseModel):
    project_id: int
    drawing_number: str
    title: str
    discipline: str
    scale: str | None = None
    phase_id: int | None = None
    status: str = "under_review"
    current_revision: int = 0
    file_path: str | None = None
    created_by: str | None = None

    @field_validator("discipline")
    @classmethod
    def validate_discipline(cls, v: str) -> str:
        allowed = {"معماري", "إنشائي", "كهرباء", "ميكانيكا", "صحي", "شبكات"}
        if v not in allowed:
            raise ValueError("Invalid discipline")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"under_review", "approved", "rejected", "superseded", "as_built"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class DrawingUpdate(BaseModel):
    project_id: int | None = None
    drawing_number: str | None = None
    title: str | None = None
    discipline: str | None = None
    scale: str | None = None
    phase_id: int | None = None
    status: str | None = None
    current_revision: int | None = None
    file_path: str | None = None
    created_by: str | None = None
