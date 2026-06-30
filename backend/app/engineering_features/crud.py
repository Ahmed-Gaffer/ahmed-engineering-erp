from app.core.crud import GenericCRUD
from .models import (
    Contract, BOQItem, IPCHeader, IPCDetail, DailyReport, Subcontractor,
    Schedule, EngDocument, VariationOrder, VOBOQItem, VOScheduleImpact,
    RFI, MaterialApprovalRequest, NonConformanceReport,
    MeetingMinute, SubmittalRegister, InspectionRequest, PunchListItem,
    Transmittal, CompanyBranch, ProjectCategory, ProjectCategoryLink,
    CostCode, SafetyIncident, SafetyObservation, MaterialTest,
    ITP, ITPItem, ITPVerification, MethodStatement,
    Specification, SpecSection, PermitToWork,
    SurveyPoint, SurveyReading, SystemSetting,
)

contract_crud = GenericCRUD(Contract)
boq_item_crud = GenericCRUD(BOQItem)
ipc_header_crud = GenericCRUD(IPCHeader)
ipc_detail_crud = GenericCRUD(IPCDetail)
daily_report_crud = GenericCRUD(DailyReport)
subcontractor_crud = GenericCRUD(Subcontractor)
schedule_crud = GenericCRUD(Schedule)
eng_document_crud = GenericCRUD(EngDocument)
variation_order_crud = GenericCRUD(VariationOrder)
vo_boq_item_crud = GenericCRUD(VOBOQItem)
vo_schedule_impact_crud = GenericCRUD(VOScheduleImpact)
rfi_crud = GenericCRUD(RFI)
mar_crud = GenericCRUD(MaterialApprovalRequest)
ncr_crud = GenericCRUD(NonConformanceReport)
meeting_minute_crud = GenericCRUD(MeetingMinute)
submittal_crud = GenericCRUD(SubmittalRegister)
inspection_crud = GenericCRUD(InspectionRequest)
punch_list_crud = GenericCRUD(PunchListItem)
transmittal_crud = GenericCRUD(Transmittal)
branch_crud = GenericCRUD(CompanyBranch)
category_crud = GenericCRUD(ProjectCategory)
category_link_crud = GenericCRUD(ProjectCategoryLink)
cost_code_crud = GenericCRUD(CostCode)
safety_incident_crud = GenericCRUD(SafetyIncident)
safety_observation_crud = GenericCRUD(SafetyObservation)
material_test_crud = GenericCRUD(MaterialTest)
itp_crud = GenericCRUD(ITP)
itp_item_crud = GenericCRUD(ITPItem)
itp_verification_crud = GenericCRUD(ITPVerification)
method_statement_crud = GenericCRUD(MethodStatement)
specification_crud = GenericCRUD(Specification)
spec_section_crud = GenericCRUD(SpecSection)
permit_to_work_crud = GenericCRUD(PermitToWork)
survey_point_crud = GenericCRUD(SurveyPoint)
survey_reading_crud = GenericCRUD(SurveyReading)
system_setting_crud = GenericCRUD(SystemSetting)
