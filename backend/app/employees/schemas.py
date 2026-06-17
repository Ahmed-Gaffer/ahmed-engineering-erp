from datetime import date
from pydantic import BaseModel, field_validator


class EmployeeCreate(BaseModel):
    employee_code: str
    full_name: str
    position: str | None = None
    department: str | None = None
    email: str | None = None
    phone: str | None = None
    national_id: str | None = None
    passport_number: str | None = None
    hire_date: date | None = None
    salary: float | None = None
    status: str = "active"
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "inactive", "on_leave", "terminated"}
        if v not in allowed:
            raise ValueError("Status must be active/inactive/on_leave/terminated")
        return v


class EmployeeUpdate(BaseModel):
    employee_code: str | None = None
    full_name: str | None = None
    position: str | None = None
    department: str | None = None
    email: str | None = None
    phone: str | None = None
    national_id: str | None = None
    passport_number: str | None = None
    hire_date: date | None = None
    salary: float | None = None
    status: str | None = None
    notes: str | None = None
