from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Boolean, UniqueConstraint
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


class SubmittalRegister(Base, TimestampMixin):
    __tablename__ = "submittals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    submittal_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    submittal_type: Mapped[str] = mapped_column(String(50))
    specification_ref: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    required_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    resubmission_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)


class InspectionRequest(Base, TimestampMixin):
    __tablename__ = "inspection_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    inspection_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    inspection_type: Mapped[str] = mapped_column(String(50))
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="planned")
    inspector_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    inspection_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    findings: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrective_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[str | None] = mapped_column(Text, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class PunchListItem(Base, TimestampMixin):
    __tablename__ = "punch_list_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    item_number: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="general")
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open")
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    verified_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Transmittal(Base, TimestampMixin):
    __tablename__ = "transmittals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    transmittal_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    transmittal_type: Mapped[str] = mapped_column(String(50))
    direction: Mapped[str] = mapped_column(String(20))
    sender: Mapped[str] = mapped_column(String(255))
    recipient: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(255))
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    sent_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    received_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    acknowledged_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    attachments: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)


# ─── Phase 2: Classification + Multi-Branch ───


class CompanyBranch(Base, TimestampMixin):
    __tablename__ = "company_branches"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manager_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")


class ProjectCategory(Base, TimestampMixin):
    __tablename__ = "project_categories"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50))
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class ProjectCategoryLink(Base):
    __tablename__ = "project_category_links"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("project_categories.id"), index=True)


class CostCode(Base, TimestampMixin):
    __tablename__ = "cost_codes"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    code: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("cost_codes.id"), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    budget_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="active")


# ─── Phase 3: HSE Module ───


class SafetyIncident(Base, TimestampMixin):
    __tablename__ = "safety_incidents"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    incident_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    incident_type: Mapped[str] = mapped_column(String(50))
    severity: Mapped[str] = mapped_column(String(20), default="minor")
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    incident_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    reported_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    affected_person: Mapped[str | None] = mapped_column(String(255), nullable=True)
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    corrective_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    preventive_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="reported")
    closed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class SafetyObservation(Base, TimestampMixin):
    __tablename__ = "safety_observations"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    observation_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    observation_type: Mapped[str] = mapped_column(String(50))
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    observation_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    observed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    corrective_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class MaterialTest(Base, TimestampMixin):
    __tablename__ = "material_tests"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    test_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    test_type: Mapped[str] = mapped_column(String(50))
    sample_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sample_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sample_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    test_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    tested_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lab_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    certificate_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    standard_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    result_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    acceptance_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="requested")
    inspection_request_id: Mapped[int | None] = mapped_column(ForeignKey("inspection_requests.id"), nullable=True)
    ncr_id: Mapped[int | None] = mapped_column(ForeignKey("non_conformance_reports.id"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ITP(Base, TimestampMixin):
    __tablename__ = "itps"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    itp_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    prepared_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    itp_items: Mapped[List["ITPItem"]] = relationship("ITPItem", back_populates="itp", cascade="all, delete-orphan")


class ITPItem(Base, TimestampMixin):
    __tablename__ = "itp_items"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    itp_id: Mapped[int] = mapped_column(ForeignKey("itps.id"), index=True)
    section: Mapped[str | None] = mapped_column(String(100), nullable=True)
    activity_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    reference_standard: Mapped[str | None] = mapped_column(String(255), nullable=True)
    acceptance_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    hold_point: Mapped[bool] = mapped_column(Boolean, default=False)
    witness_point: Mapped[bool] = mapped_column(Boolean, default=False)
    inspection_frequency: Mapped[str | None] = mapped_column(String(100), nullable=True)
    responsible_party: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    itp: Mapped["ITP"] = relationship("ITP", back_populates="itp_items")
    verifications: Mapped[List["ITPVerification"]] = relationship("ITPVerification", back_populates="itp_item", cascade="all, delete-orphan")


class ITPVerification(Base):
    __tablename__ = "itp_verifications"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    itp_item_id: Mapped[int] = mapped_column(ForeignKey("itp_items.id"), index=True)
    inspection_request_id: Mapped[int | None] = mapped_column(ForeignKey("inspection_requests.id"), nullable=True)
    result: Mapped[str] = mapped_column(String(20), default="n_a")
    verified_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verified_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    itp_item: Mapped["ITPItem"] = relationship("ITPItem", back_populates="verifications")


class MethodStatement(Base, TimestampMixin):
    __tablename__ = "method_statements"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    ms_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    scope_of_work: Mapped[str] = mapped_column(Text)
    methodology: Mapped[str] = mapped_column(Text)
    resources_required: Mapped[str | None] = mapped_column(Text, nullable=True)
    risks_identified: Mapped[str | None] = mapped_column(Text, nullable=True)
    referenced_documents: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachments: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    prepared_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Specification(Base, TimestampMixin):
    __tablename__ = "specifications"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True, index=True)
    spec_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    division: Mapped[str] = mapped_column(String(50))
    section: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issuing_body: Mapped[str] = mapped_column(String(50))
    revision: Mapped[str | None] = mapped_column(String(50), nullable=True)
    effective_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    body: Mapped[str] = mapped_column(Text)
    keywords: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sections: Mapped[List["SpecSection"]] = relationship(back_populates="specification", cascade="all, delete-orphan")


class SpecSection(Base, TimestampMixin):
    __tablename__ = "spec_sections"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    specification_id: Mapped[int] = mapped_column(ForeignKey("specifications.id", ondelete="CASCADE"), index=True)
    section_number: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[str] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    specification: Mapped["Specification"] = relationship(back_populates="sections")


class PermitToWork(Base, TimestampMixin):
    __tablename__ = "permits_to_work"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    permit_number: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    permit_type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255))
    requested_by: Mapped[str] = mapped_column(String(255))
    requested_date: Mapped[date] = mapped_column(Date)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    valid_to: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    permit_issuer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    permit_holder: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gas_test_result: Mapped[str | None] = mapped_column(Text, nullable=True)
    gas_test_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    permit_receiver: Mapped[str | None] = mapped_column(String(255), nullable=True)
    safety_measures: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="requested")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)


class SurveyPoint(Base, TimestampMixin):
    __tablename__ = "survey_points"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    point_number: Mapped[str] = mapped_column(String(50))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    point_type: Mapped[str] = mapped_column(String(20), default="control")
    northing: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    easting: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    elevation: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    coordinate_system: Mapped[str | None] = mapped_column(String(50), nullable=True)
    benchmark_ref: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date_established: Mapped[date | None] = mapped_column(Date, nullable=True)
    established_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    readings: Mapped[List["SurveyReading"]] = relationship(back_populates="survey_point", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("project_id", "point_number", name="uq_survey_point_project"),)


class SurveyReading(Base, TimestampMixin):
    __tablename__ = "survey_readings"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    survey_point_id: Mapped[int] = mapped_column(ForeignKey("survey_points.id"), index=True)
    reading_date: Mapped[date] = mapped_column(Date)
    northing_reading: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    easting_reading: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    elevation_reading: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    equipment_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    operator: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    survey_point: Mapped["SurveyPoint"] = relationship(back_populates="readings")


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
