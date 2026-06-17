from datetime import date
from pydantic import BaseModel, field_validator


class DocumentCreate(BaseModel):
    project_id: int
    doc_number: str
    title: str
    type: str
    direction: str
    related_party: str | None = None
    issue_date: date | None = None
    file_path: str | None = None
    tags: str | None = None
    status: str = "draft"

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, v: str) -> str:
        allowed = {"incoming", "outgoing", "internal"}
        if v not in allowed:
            raise ValueError("Invalid direction")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"contract", "variation_order", "letter", "report", "permit", "protocol", "other"}
        if v not in allowed:
            raise ValueError("Invalid document type")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "final", "archived"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class DocumentUpdate(BaseModel):
    project_id: int | None = None
    doc_number: str | None = None
    title: str | None = None
    type: str | None = None
    direction: str | None = None
    related_party: str | None = None
    issue_date: date | None = None
    file_path: str | None = None
    tags: str | None = None
    status: str | None = None
