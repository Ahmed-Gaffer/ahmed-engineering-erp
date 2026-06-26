from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class ProjectCode(Base, TimestampMixin):
    __tablename__ = "project_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    code: Mapped[str] = mapped_column(String(100))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("project_codes.id", ondelete="SET NULL"), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255))
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    unit_price: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    total_quantity: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    type: Mapped[str] = mapped_column(String(20), default="item")

    project = relationship("Project", back_populates="codes")
    parent = relationship("ProjectCode", remote_side="ProjectCode.id", backref="children")
