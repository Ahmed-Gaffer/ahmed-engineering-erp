from pydantic import BaseModel, field_validator


class ProjectCodeCreate(BaseModel):
    project_id: int
    code: str
    parent_id: int | None = None
    level: int = 1
    title: str
    unit: str | None = None
    unit_price: float | None = None
    total_quantity: float | None = None
    type: str = "item"

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"item", "group"}
        if v not in allowed:
            raise ValueError("Type must be item or group")
        return v


class ProjectCodeUpdate(BaseModel):
    project_id: int | None = None
    code: str | None = None
    parent_id: int | None = None
    level: int | None = None
    title: str | None = None
    unit: str | None = None
    unit_price: float | None = None
    total_quantity: float | None = None
    type: str | None = None
