from datetime import date
from pydantic import BaseModel, field_validator


class ContractorCreate(BaseModel):
    code: str
    name: str
    classification: str
    specialties: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    commercial_register: str | None = None
    tax_card: str | None = None
    bank_account: str | None = None
    contract_number: str | None = None
    contract_date: date | None = None
    contract_value: float | None = None
    insurance_value: float | None = None
    insurance_remaining: float | None = None
    status: str = "active"
    notes: str | None = None

    @field_validator("classification")
    @classmethod
    def validate_classification(cls, v: str) -> str:
        allowed = {"أ", "ب", "ج", "د"}
        if v not in allowed:
            raise ValueError("Classification must be أ/ب/ج/د")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "suspended", "blacklisted"}
        if v not in allowed:
            raise ValueError("Status must be active/suspended/blacklisted")
        return v


class ContractorUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    classification: str | None = None
    specialties: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    commercial_register: str | None = None
    tax_card: str | None = None
    bank_account: str | None = None
    contract_number: str | None = None
    contract_date: date | None = None
    contract_value: float | None = None
    insurance_value: float | None = None
    insurance_remaining: float | None = None
    status: str | None = None
    notes: str | None = None
