from datetime import date
from pydantic import BaseModel, field_validator


class PaymentCertificateCreate(BaseModel):
    project_id: int
    certificate_number: str
    contractor_id: int | None = None
    period_from: date | None = None
    period_to: date | None = None
    issue_date: date | None = None
    previous_total: float = 0
    current_works: float = 0
    materials_on_site: float = 0
    insurance_percent: float = 0
    advance_repayment: float = 0
    fine_deductions: float = 0
    other_deductions: float = 0
    retention_percent: float = 0
    status: str = "under_review"
    payment_date: date | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"under_review", "approved", "paid", "rejected"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class PaymentCertificateUpdate(BaseModel):
    project_id: int | None = None
    certificate_number: str | None = None
    contractor_id: int | None = None
    period_from: date | None = None
    period_to: date | None = None
    issue_date: date | None = None
    previous_total: float | None = None
    current_works: float | None = None
    materials_on_site: float | None = None
    insurance_percent: float | None = None
    advance_repayment: float | None = None
    fine_deductions: float | None = None
    other_deductions: float | None = None
    retention_percent: float | None = None
    status: str | None = None
    payment_date: date | None = None
    notes: str | None = None
