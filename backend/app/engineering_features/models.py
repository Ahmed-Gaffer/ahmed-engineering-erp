from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Boolean
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

    total_works: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    materials_on_site: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    retention_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    retention_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    advance_recovery: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    fines: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    insurance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    other_deductions: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    previous_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    current_due: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_to_date: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    contract_ceiling: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_billed: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

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
    task_type: Mapped[str] = mapped_column(String(20), default="task")
    is_milestone: Mapped[bool] = mapped_column(Boolean, default=False)
    dependencies: Mapped[str | None] = mapped_column(Text, nullable=True)
    baseline_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    baseline_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    critical: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


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


class VariationOrder(Base, TimestampMixin):
    __tablename__ = "variation_orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    vo_number: Mapped[str] = mapped_column(String(100), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    reason: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    amount_change: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    days_change: Mapped[int] = mapped_column(Integer, default=0)
    approved_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    approved_days: Mapped[int] = mapped_column(Integer, default=0)
    submitted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    approved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class VOBOQItem(Base, TimestampMixin):
    __tablename__ = "vo_boq_items"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vo_id: Mapped[int] = mapped_column(ForeignKey("variation_orders.id"), index=True)
    boq_item_id: Mapped[int] = mapped_column(ForeignKey("boq_items.id"), index=True)
    impact_type: Mapped[str] = mapped_column(String(20), default="add")
    quantity_change: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    unit_price_change: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class VOScheduleImpact(Base, TimestampMixin):
    __tablename__ = "vo_schedule_impacts"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vo_id: Mapped[int] = mapped_column(ForeignKey("variation_orders.id"), index=True)
    schedule_id: Mapped[int] = mapped_column(ForeignKey("schedules.id"), index=True)
    days_change: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class RFI(Base, TimestampMixin):
    __tablename__ = "rfis"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    rfi_number: Mapped[str] = mapped_column(String(100), index=True)
    title: Mapped[str] = mapped_column(String(255))
    question: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open")
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    response: Mapped[str | None] = mapped_column(Text, nullable=True)
    responded_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)

class MaterialApprovalRequest(Base, TimestampMixin):
    __tablename__ = "material_approval_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    mar_number: Mapped[str] = mapped_column(String(50), index=True)
    title: Mapped[str] = mapped_column(String(255))
    specification_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    material_type: Mapped[str] = mapped_column(String(50), default="other")
    quantity_requested: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    unit: Mapped[str] = mapped_column(String(20), default="unit")
    submitted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    required_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    submitted_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    suppliers: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)


class NonConformanceReport(Base, TimestampMixin):
    __tablename__ = "non_conformance_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    ncr_number: Mapped[str] = mapped_column(String(50), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="other")
    severity: Mapped[str] = mapped_column(String(20), default="minor")
    source: Mapped[str] = mapped_column(String(50), default="inspection")
    identified_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    identified_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    corrective_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    preventive_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    closed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)


class MeetingMinute(Base, TimestampMixin):
    __tablename__ = "meeting_minutes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    meeting_title: Mapped[str] = mapped_column(String(255))
    meeting_date: Mapped[date] = mapped_column(Date)
    meeting_type: Mapped[str] = mapped_column(String(50), default="regular")
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    chairperson: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attendees: Mapped[str | None] = mapped_column(Text, nullable=True)
    agenda: Mapped[str | None] = mapped_column(Text, nullable=True)
    discussion: Mapped[str | None] = mapped_column(Text, nullable=True)
    decisions: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_items: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_meeting_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
