from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class ProjectSummary(BaseModel):
    id: int
    code: str
    name: str
    status: str
    contract_value: Decimal = Decimal("0")
    progress_percent: Decimal = Decimal("0")
    total_ipc_paid: Decimal = Decimal("0")
    remaining_value: Decimal = Decimal("0")
    days_elapsed: int = 0
    days_remaining: int = 0


class DashboardSummary(BaseModel):
    total_projects: int = 0
    total_contract_value: Decimal = Decimal("0")
    total_boq_items: int = 0
    total_boq_value: Decimal = Decimal("0")
    total_ipc_count: int = 0
    total_ipc_amount: Decimal = Decimal("0")
    total_ipc_paid: Decimal = Decimal("0")
    total_ipc_approved: Decimal = Decimal("0")
    projects_by_status: List[dict] = []
    ipc_by_status: List[dict] = []
    recent_ipcs: List[dict] = []
    total_contracts: int = 0
    total_drawings: int = 0
    total_daily_reports: int = 0
    total_schedules: int = 0
    total_subcontractors: int = 0
    total_documents: int = 0
    total_variation_orders: int = 0
    total_vo_amount: Decimal = Decimal("0")
    total_rfis: int = 0
    overall_execution_rate: Decimal = Decimal("0")
    overall_financial_progress: Decimal = Decimal("0")
    total_remaining_value: Decimal = Decimal("0")
    projects_active: int = 0
    projects_completed: int = 0
    projects_planning: int = 0
    top_projects: List[dict] = []
    pending_approvals: int = 0
    unread_notifications: int = 0
    recent_activity: List[dict] = []


class ContractCreate(BaseModel):
    project_id: int
    contract_number: str
    contract_type: str = "main"
    party_a: str
    party_b: str
    sign_date: Optional[date] = None
    value: Decimal = Decimal("0")
    duration_months: int = 0
    retention_percent: Decimal = Decimal("5.00")
    advance_payment_percent: Decimal = Decimal("0")
    status: str = "draft"


class ContractUpdate(BaseModel):
    contract_number: Optional[str] = None
    value: Optional[Decimal] = None
    duration_months: Optional[int] = None
    status: Optional[str] = None


class ContractResponse(ContractCreate):
    id: int
    created_at: datetime
    updated_at: datetime


class BOQItemCreate(BaseModel):
    project_id: int
    item_code: str
    description: str
    unit: str
    quantity: Decimal = Decimal("0")
    unit_price: Decimal = Decimal("0")
    category: Optional[str] = None
    parent_id: Optional[int] = None
    is_group: bool = False


class BOQItemUpdate(BaseModel):
    item_code: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit_price: Optional[Decimal] = None
    category: Optional[str] = None
    parent_id: Optional[int] = None
    is_group: Optional[bool] = None


class BOQItemResponse(BOQItemCreate):
    id: int
    total_price: Decimal


class IPCDetailCreate(BaseModel):
    boq_item_id: int
    current_quantity: Decimal = Decimal("0")


class IPCDetailResponse(BaseModel):
    id: int
    boq_item_id: int
    previous_quantity: Decimal
    current_quantity: Decimal
    cumulative_quantity: Decimal
    percentage: Decimal
    amount: Decimal
    boq_item_code: Optional[str] = None
    boq_item_description: Optional[str] = None
    boq_item_unit: Optional[str] = None


class IPCHeaderCreate(BaseModel):
    project_id: int
    contract_id: int
    ipc_number: str
    ipc_period: int = 1
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    advance_recovery: Decimal = Decimal("0")
    materials_on_site: Decimal = Decimal("0")
    fines: Decimal = Decimal("0")
    insurance: Decimal = Decimal("0")
    other_deductions: Decimal = Decimal("0")
    details: List[IPCDetailCreate] = []


class IPCHeaderResponse(BaseModel):
    id: int
    project_id: int
    contract_id: int
    ipc_number: str
    ipc_period: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str
    total_works: Decimal
    materials_on_site: Decimal
    gross_amount: Decimal
    retention_percent: Decimal
    retention_amount: Decimal
    advance_recovery: Decimal
    fines: Decimal
    insurance: Decimal
    other_deductions: Decimal
    total_deductions: Decimal
    net_amount: Decimal
    previous_total: Decimal
    current_due: Decimal
    total_to_date: Decimal
    contract_ceiling: Decimal
    total_billed: Decimal
    details: List[IPCDetailResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IPCHeaderUpdate(BaseModel):
    ipc_number: Optional[str] = None
    ipc_period: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    advance_recovery: Optional[Decimal] = None
    materials_on_site: Optional[Decimal] = None
    fines: Optional[Decimal] = None
    insurance: Optional[Decimal] = None
    other_deductions: Optional[Decimal] = None


class DrawingCreate(BaseModel):
    project_id: int
    drawing_number: str
    title: str
    discipline: Optional[str] = None
    scale: Optional[str] = None
    status: str = "under_review"


class DailyReportCreate(BaseModel):
    project_id: int
    report_date: date
    weather: Optional[str] = None
    manpower_count: int = 0
    equipment_count: int = 0
    work_description: Optional[str] = None
    issues: Optional[str] = None
    created_by: Optional[str] = None


class SubcontractorCreate(BaseModel):
    project_id: int
    name: str
    trade: Optional[str] = None
    contract_value: Decimal = Decimal("0")
    status: str = "active"


class DailyReportUpdate(BaseModel):
    report_date: Optional[date] = None
    weather: Optional[str] = None
    manpower_count: Optional[int] = None
    equipment_count: Optional[int] = None
    work_description: Optional[str] = None
    issues: Optional[str] = None


class SubcontractorUpdate(BaseModel):
    name: Optional[str] = None
    trade: Optional[str] = None
    contract_value: Optional[Decimal] = None
    status: Optional[str] = None


class ScheduleCreate(BaseModel):
    project_id: int
    task_name: str
    parent_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: int = 0
    progress_percent: Decimal = Decimal("0")
    status: str = "not_started"
    responsible: Optional[str] = None
    task_type: str = "task"
    is_milestone: bool = False
    dependencies: Optional[str] = None
    baseline_start: Optional[date] = None
    baseline_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    critical: bool = False
    priority: str = "medium"
    notes: Optional[str] = None


class VariationOrderCreate(BaseModel):
    project_id: int
    contract_id: int
    vo_number: str
    title: str
    description: Optional[str] = None
    reason: Optional[str] = None
    amount_change: Decimal = Decimal("0")
    days_change: int = 0
    submitted_date: Optional[date] = None
    created_by: Optional[str] = None


class VariationOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    amount_change: Optional[Decimal] = None
    days_change: Optional[int] = None
    approved_amount: Optional[Decimal] = None
    approved_days: Optional[int] = None
    status: Optional[str] = None
    approved_date: Optional[date] = None


class VariationOrderResponse(VariationOrderCreate):
    id: int
    status: str
    approved_amount: Decimal
    approved_days: int
    approved_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VOBOQItemCreate(BaseModel):
    boq_item_id: int
    impact_type: str = "add"
    quantity_change: Decimal = Decimal("0")
    unit_price_change: Decimal = Decimal("0")
    description: str | None = None


class VOBOQItemResponse(VOBOQItemCreate):
    id: int
    vo_id: int
    boq_item_code: str | None = None
    boq_item_description: str | None = None
    model_config = {"from_attributes": True}


class VOScheduleImpactCreate(BaseModel):
    schedule_id: int
    days_change: int = 0
    description: str | None = None


class VOScheduleImpactResponse(VOScheduleImpactCreate):
    id: int
    vo_id: int
    task_name: str | None = None
    model_config = {"from_attributes": True}


class VOImpactSummary(BaseModel):
    vo_id: int
    vo_number: str
    title: str
    total_amount_change: Decimal
    total_days_change: int
    approved_amount: Decimal
    approved_days: int
    affected_boq_items: List[VOBOQItemResponse] = []
    affected_schedule_tasks: List[VOScheduleImpactResponse] = []


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: Optional[str] = None
    type: str = "info"
    link: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: Optional[str] = None
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class RFICreate(BaseModel):
    project_id: int
    rfi_number: str
    title: str
    question: str
    category: Optional[str] = None
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    created_by: Optional[str] = None


class RFIUpdate(BaseModel):
    title: Optional[str] = None
    question: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    response: Optional[str] = None
    responded_date: Optional[date] = None
    due_date: Optional[date] = None


class RFIResponse(RFICreate):
    id: int
    status: str
    response: Optional[str] = None
    responded_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MARCreate(BaseModel):
    project_id: int
    mar_number: str
    title: str
    specification_ref: str | None = None
    manufacturer: str | None = None
    material_type: str = "other"
    quantity_requested: Decimal = Decimal("0")
    unit: str = "unit"
    submitted_date: date | None = None
    required_date: date | None = None
    submitted_by: str | None = None
    remarks: str | None = None
    suppliers: str | None = None


class MARUpdate(BaseModel):
    title: str | None = None
    specification_ref: str | None = None
    manufacturer: str | None = None
    material_type: str | None = None
    quantity_requested: Decimal | None = None
    unit: str | None = None
    submitted_date: date | None = None
    required_date: date | None = None
    status: str | None = None
    submitted_by: str | None = None
    remarks: str | None = None
    rejection_reason: str | None = None
    suppliers: str | None = None


class MARResponse(MARCreate):
    id: int
    status: str
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class NCRCreate(BaseModel):
    project_id: int
    ncr_number: str
    title: str
    description: str | None = None
    location: str | None = None
    category: str = "other"
    severity: str = "minor"
    source: str = "inspection"
    identified_date: date | None = None
    identified_by: str | None = None
    corrective_action: str | None = None
    preventive_action: str | None = None


class NCRUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    category: str | None = None
    severity: str | None = None
    source: str | None = None
    identified_date: date | None = None
    identified_by: str | None = None
    corrective_action: str | None = None
    preventive_action: str | None = None
    status: str | None = None
    closed_date: date | None = None
    rejection_reason: str | None = None


class NCRResponse(NCRCreate):
    id: int
    status: str
    closed_date: date | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class EVMReport(BaseModel):
    project_id: int
    planned_value: Decimal = 0
    earned_value: Decimal = 0
    actual_cost: Decimal = 0
    schedule_variance: Decimal = 0
    cost_variance: Decimal = 0
    spi: Decimal = 0
    cpi: Decimal = 0
    estimate_at_completion: Decimal = 0
    estimate_to_complete: Decimal = 0
    variance_at_completion: Decimal = 0
    total_budget: Decimal = 0
    total_billed: Decimal = 0


class ProjectFinancialReport(BaseModel):
    project_id: int
    project_name: str = ""
    project_code: str = ""
    contract_value: Decimal = Decimal("0")
    boq_total: Decimal = Decimal("0")
    total_billed: Decimal = Decimal("0")
    total_paid: Decimal = Decimal("0")
    total_vo_amount: Decimal = Decimal("0")
    planned_value: Decimal = Decimal("0")
    earned_value: Decimal = Decimal("0")
    actual_cost: Decimal = Decimal("0")
    spi: Decimal = Decimal("0")
    cpi: Decimal = Decimal("0")
    remaining_budget: Decimal = Decimal("0")
    percent_spent: Decimal = Decimal("0")


class ProjectComparisonItem(BaseModel):
    id: int
    code: str = ""
    name: str = ""
    contract_value: Decimal = Decimal("0")
    total_billed: Decimal = Decimal("0")
    total_paid: Decimal = Decimal("0")
    execution_rate: Decimal = Decimal("0")
    financial_progress: Decimal = Decimal("0")


class ScheduleUpdate(BaseModel):
    task_name: Optional[str] = None
    parent_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: Optional[int] = None
    progress_percent: Optional[Decimal] = None
    status: Optional[str] = None
    responsible: Optional[str] = None
    task_type: Optional[str] = None
    is_milestone: Optional[bool] = None
    dependencies: Optional[str] = None
    baseline_start: Optional[date] = None
    baseline_end: Optional[date] = None
    actual_start: Optional[date] = None
    actual_end: Optional[date] = None
    critical: Optional[bool] = None
    priority: Optional[str] = None
    notes: Optional[str] = None


class SystemSettingCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None


class SystemSettingUpdate(BaseModel):
    value: str


class SystemSettingResponse(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class MeetingMinuteCreate(BaseModel):
    project_id: int
    meeting_title: str
    meeting_date: date
    meeting_type: str = "regular"
    location: str | None = None
    chairperson: str | None = None
    attendees: str | None = None
    agenda: str | None = None
    discussion: str | None = None
    decisions: str | None = None
    action_items: str | None = None
    next_meeting_date: date | None = None
    created_by: str | None = None


class MeetingMinuteUpdate(BaseModel):
    meeting_title: str | None = None
    meeting_date: date | None = None
    meeting_type: str | None = None
    location: str | None = None
    chairperson: str | None = None
    attendees: str | None = None
    agenda: str | None = None
    discussion: str | None = None
    decisions: str | None = None
    action_items: str | None = None
    next_meeting_date: date | None = None
    status: str | None = None


class MeetingMinuteResponse(MeetingMinuteCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    action: str
    resource: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
