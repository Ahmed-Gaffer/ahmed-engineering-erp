from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class ProjectPhase(Base, TimestampMixin):
    __tablename__ = "project_phases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    start_date_planned: Mapped[str | None] = mapped_column(Date, nullable=True)
    start_date_actual: Mapped[str | None] = mapped_column(Date, nullable=True)
    end_date_planned: Mapped[str | None] = mapped_column(Date, nullable=True)
    end_date_actual: Mapped[str | None] = mapped_column(Date, nullable=True)
    progress_percentage: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    project = relationship("Project", back_populates="phases")
