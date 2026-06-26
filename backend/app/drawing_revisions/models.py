from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class DrawingRevision(Base, TimestampMixin):
    __tablename__ = "drawing_revisions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    drawing_id: Mapped[int] = mapped_column(ForeignKey("drawings.id", ondelete="CASCADE"))
    revision_number: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approved_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="submitted")

    drawing = relationship("Drawing", back_populates="revisions")
