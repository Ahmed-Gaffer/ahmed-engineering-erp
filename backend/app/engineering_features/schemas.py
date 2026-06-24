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
    overall_execution_rate: Decimal = Decimal("0")
    overall_financial_progress: Decimal = Decimal("0")
    total_remaining_value: Decimal = Decimal("0")
    projects_active: int = 0
    projects_completed: int = 0
    projects_planning: int = 0
    top_projects: List[dict] = []


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
    total_amount: Decimal
    retention_amount: Decimal
    advance_recovery: Decimal
    net_amount: Decimal
    details: List[IPCDetailResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IPCHeaderUpdate(BaseModel):
    ipc_number: Optional[str] = None
    ipc_period: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_amount: Optional[Decimal] = None
    retention_amount: Optional[Decimal] = None
    net_amount: Optional[Decimal] = None


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


class ScheduleUpdate(BaseModel):
    task_name: Optional[str] = None
    parent_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: Optional[int] = None
    progress_percent: Optional[Decimal] = None
    status: Optional[str] = None
    responsible: Optional[str] = None
