from datetime import date
from decimal import Decimal
from typing import List

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base, TimestampMixin


class Contract(Base, TimestampMixin):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    contract_number: Mapped[str] = mapped_column(String(100), index=True)
    contract_type: Mapped[str] = mapped_column(String(50), default="main")
    party_a: Mapped[str] = mapped_column(String(255))
    party_b: Mapped[str] = mapped_column(String(255))
    sign_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    duration_months: Mapped[int] = mapped_column(Integer, default=0)
    retention_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=5.00)
    advance_payment_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="draft")


class BOQItem(Base, TimestampMixin):
    __tablename__ = "boq_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    item_code: Mapped[str] = mapped_column(String(50), index=True)
    description: Mapped[str] = mapped_column(Text)
    unit: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    total_price: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("boq_items.id"), nullable=True)
    is_group: Mapped[bool] = mapped_column(Boolean, default=False)


class IPCHeader(Base, TimestampMixin):
    __tablename__ = "ipc_headers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    ipc_number: Mapped[str] = mapped_column(String(50), index=True)
    ipc_period: Mapped[int] = mapped_column(Integer, default=1)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    retention_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    advance_recovery: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)

    details: Mapped[List["IPCDetail"]] = relationship(back_populates="ipc_header", cascade="all, delete-orphan")


class IPCDetail(Base):
    __tablename__ = "ipc_details"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ipc_id: Mapped[int] = mapped_column(ForeignKey("ipc_headers.id"), index=True)
    boq_item_id: Mapped[int] = mapped_column(ForeignKey("boq_items.id"), index=True)
    previous_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    current_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    cumulative_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    boq_item_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    boq_item_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    boq_item_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)

    ipc_header: Mapped["IPCHeader"] = relationship(back_populates="details")


class DailyReport(Base, TimestampMixin):
    __tablename__ = "daily_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    report_date: Mapped[date] = mapped_column(Date)
    weather: Mapped[str | None] = mapped_column(String(50), nullable=True)
    manpower_count: Mapped[int] = mapped_column(Integer, default=0)
    equipment_count: Mapped[int] = mapped_column(Integer, default=0)
    work_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    issues: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Subcontractor(Base, TimestampMixin):
    __tablename__ = "subcontractors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    trade: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contract_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="active")


class Schedule(Base, TimestampMixin):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    task_name: Mapped[str] = mapped_column(String(255))
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("schedules.id"), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, default=0)
    progress_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="not_started")
    responsible: Mapped[str | None] = mapped_column(String(255), nullable=True)


class EngDocument(Base, TimestampMixin):
    __tablename__ = "eng_documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    doc_type: Mapped[str] = mapped_column(String(50), default="correspondence")
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
