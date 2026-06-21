from datetime import date
from pydantic import BaseModel, field_validator


class WorkOrderCreate(BaseModel):
    project_id: int
    wo_number: str
    title: str
    description: str | None = None
    contractor_id: int | None = None
    issue_date: date | None = None
    due_date: date | None = None
    priority: str = "medium"
    status: str = "issued"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"low", "medium", "high", "urgent"}
        if v not in allowed:
            raise ValueError("Invalid priority")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"issued", "under_execution", "completed", "closed", "cancelled"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class WorkOrderUpdate(BaseModel):
    project_id: int | None = None
    wo_number: str | None = None
    title: str | None = None
    description: str | None = None
    contractor_id: int | None = None
    issue_date: date | None = None
    due_date: date | None = None
    priority: str | None = None
    status: str | None = None
