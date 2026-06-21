from sqlalchemy import Date, String, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from app.core.base import Base, TimestampMixin


class Employee(Base, TimestampMixin):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    position: Mapped[str | None] = mapped_column(String(100))
    department: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    national_id: Mapped[str | None] = mapped_column(String(50))
    passport_number: Mapped[str | None] = mapped_column(String(50))
    hire_date: Mapped[str | None] = mapped_column(Date, nullable=True)
    salary: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
