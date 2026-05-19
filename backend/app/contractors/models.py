from sqlalchemy import Date, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin


class Contractor(Base, TimestampMixin):
    __tablename__ = "contractors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    classification: Mapped[str] = mapped_column(String(10))
    specialties: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    commercial_register: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tax_card: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bank_account: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contract_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contract_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    contract_value: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    insurance_value: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    insurance_remaining: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    projects = relationship("Project", back_populates="contractor")
    work_orders = relationship("WorkOrder", back_populates="contractor")
    payment_certificates = relationship("PaymentCertificate", back_populates="contractor")
