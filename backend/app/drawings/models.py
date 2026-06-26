from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class Drawing(Base, TimestampMixin):
    __tablename__ = "drawings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    drawing_number: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    discipline: Mapped[str] = mapped_column(String(50))
    scale: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phase_id: Mapped[int | None] = mapped_column(ForeignKey("project_phases.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="under_review")
    current_revision: Mapped[int] = mapped_column(Integer, default=0)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

    project = relationship("Project", back_populates="drawings")
    revisions = relationship("DrawingRevision", back_populates="drawing", cascade="all, delete-orphan")
