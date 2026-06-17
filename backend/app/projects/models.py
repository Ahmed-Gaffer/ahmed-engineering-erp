from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    project_type: Mapped[str] = mapped_column(String(50))
    contractor_id: Mapped[int | None] = mapped_column(ForeignKey("contractors.id", ondelete="SET NULL"), nullable=True)
    start_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    end_date_planned: Mapped[str | None] = mapped_column(Date, nullable=True)
    end_date_actual: Mapped[str | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="planned")
    budget_estimated: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    budget_actual: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    client_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    consultant_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    project_manager: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    contractor = relationship("Contractor", back_populates="projects")
    phases = relationship("ProjectPhase", back_populates="project", cascade="all, delete-orphan")
    codes = relationship("ProjectCode", back_populates="project", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="project", cascade="all, delete-orphan")
    drawings = relationship("Drawing", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    payment_certificates = relationship("PaymentCertificate", back_populates="project", cascade="all, delete-orphan")
