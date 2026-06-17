from datetime import date
from pydantic import BaseModel, field_validator


class ProjectCreate(BaseModel):
    code: str
    name: str
    location: str | None = None
    project_type: str
    contractor_id: int | None = None
    start_date: date | None = None
    end_date_planned: date | None = None
    end_date_actual: date | None = None
    status: str = "planned"
    budget_estimated: float | None = None
    budget_actual: float | None = None
    client_name: str | None = None
    consultant_name: str | None = None
    project_manager: str | None = None
    notes: str | None = None

    @field_validator("project_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"مباني", "طرق", "بنية تحتية", "صيانة"}
        if v not in allowed:
            raise ValueError("Type must be مباني/طرق/بنية تحتية/صيانة")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"planned", "in_progress", "completed", "on_hold", "cancelled"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class ProjectUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    location: str | None = None
    project_type: str | None = None
    contractor_id: int | None = None
    start_date: date | None = None
    end_date_planned: date | None = None
    end_date_actual: date | None = None
    status: str | None = None
    budget_estimated: float | None = None
    budget_actual: float | None = None
    client_name: str | None = None
    consultant_name: str | None = None
    project_manager: str | None = None
    notes: str | None = None
