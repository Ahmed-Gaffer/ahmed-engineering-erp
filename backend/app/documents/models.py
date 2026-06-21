from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    doc_number: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50))
    direction: Mapped[str] = mapped_column(String(20))
    related_party: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issue_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")

    project = relationship("Project", back_populates="documents")
