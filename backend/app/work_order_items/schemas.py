from pydantic import BaseModel, field_validator


class WorkOrderItemCreate(BaseModel):
    work_order_id: int
    item_code: str
    description: str | None = None
    unit: str | None = None
    quantity: float = 0
    unit_price: float = 0
    executed_quantity: float = 0
    status: str = "pending"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "partial", "done"}
        if v not in allowed:
            raise ValueError("Invalid status")
        return v


class WorkOrderItemUpdate(BaseModel):
    work_order_id: int | None = None
    item_code: str | None = None
    description: str | None = None
    unit: str | None = None
    quantity: float | None = None
    unit_price: float | None = None
    executed_quantity: float | None = None
    status: str | None = None
