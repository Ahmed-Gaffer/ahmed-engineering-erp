from datetime import date
from pydantic import BaseModel, field_validator


class ProjectPhaseCreate(BaseModel):
    project_id: int
    name: str
    order_index: int = 0
    start_date_planned: date | None = None
    start_date_actual: date | None = None
    end_date_planned: date | None = None
    end_date_actual: date | None = None
    progress_percentage: float = 0
    status: str = "pending"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "in_progress", "completed", "delayed"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v

    @field_validator("progress_percentage")
    @classmethod
    def validate_progress(cls, v: float) -> float:
        if v < 0 or v > 100:
            raise ValueError("Progress must be 0-100")
        return v


class ProjectPhaseUpdate(BaseModel):
    project_id: int | None = None
    name: str | None = None
    order_index: int | None = None
    start_date_planned: date | None = None
    start_date_actual: date | None = None
    end_date_planned: date | None = None
    end_date_actual: date | None = None
    progress_percentage: float | None = None
    status: str | None = None
