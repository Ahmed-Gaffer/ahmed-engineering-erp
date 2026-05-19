from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class WorkOrderItem(Base, TimestampMixin):
    __tablename__ = "work_order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    work_order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id", ondelete="CASCADE"))
    item_code: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    unit_price: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    total_price: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    executed_quantity: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    work_order = relationship("WorkOrder", back_populates="items")
