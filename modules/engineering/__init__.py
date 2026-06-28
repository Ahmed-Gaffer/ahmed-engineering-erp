from core.lego_v2.shared.base_module import BaseModule
from core.lego_v2.event_bus.events import ENGINEERING_EVENTS
from app.engineering_features.notification_adapter import handle_engineering_event
from app.projects.api import router as projects_router
from app.projects.models import Project
from app.phases.api import router as phases_router
from app.phases.models import ProjectPhase
from app.codes.api import router as codes_router
from app.codes.models import ProjectCode
from app.drawings.api import router as drawings_router
from app.drawings.models import Drawing
from app.drawing_revisions.api import router as drawing_revisions_router
from app.drawing_revisions.models import DrawingRevision
from app.documents.api import router as documents_router
from app.documents.models import Document
from app.payment_certificates.api import router as payment_certificates_router
from app.payment_certificates.models import PaymentCertificate
from app.work_orders.api import router as work_orders_router
from app.work_orders.models import WorkOrder
from app.work_order_items.api import router as work_order_items_router
from app.work_order_items.models import WorkOrderItem

from app.engineering_features.api import router as eng_router
from .reports_api import router as reports_router
from app.engineering_features.models import (
    BOQItem, Contract, IPCHeader, IPCDetail,
    DailyReport, Subcontractor, Schedule, EngDocument,
    SubmittalRegister, InspectionRequest, PunchListItem, Transmittal,
    CompanyBranch, ProjectCategory, ProjectCategoryLink, CostCode,
    SafetyIncident, SafetyObservation,
)


class EngineeringModule(BaseModule):
    def __init__(self):
        super().__init__(name="engineering", version="1.0.0", dependencies=["contractors", "core"])
        self.add_router(projects_router)
        self.add_router(phases_router)
        self.add_router(codes_router)
        self.add_router(drawings_router)
        self.add_router(drawing_revisions_router)
        self.add_router(documents_router)
        self.add_router(payment_certificates_router)
        self.add_router(work_orders_router)
        self.add_router(work_order_items_router)
        self.add_router(eng_router)
        self.add_router(reports_router)
        self.add_model(Project)
        self.add_model(ProjectPhase)
        self.add_model(ProjectCode)
        self.add_model(Drawing)
        self.add_model(DrawingRevision)
        self.add_model(Document)
        self.add_model(PaymentCertificate)
        self.add_model(WorkOrder)
        self.add_model(WorkOrderItem)
        self.add_model(BOQItem)
        self.add_model(Contract)
        self.add_model(IPCHeader)
        self.add_model(IPCDetail)
        self.add_model(DailyReport)
        self.add_model(Subcontractor)
        self.add_model(Schedule)
        self.add_model(EngDocument)
        self.add_model(SubmittalRegister)
        self.add_model(InspectionRequest)
        self.add_model(PunchListItem)
        self.add_model(Transmittal)
        self.add_model(CompanyBranch)
        self.add_model(ProjectCategory)
        self.add_model(ProjectCategoryLink)
        self.add_model(CostCode)
        self.add_model(SafetyIncident)
        self.add_model(SafetyObservation)

        # Subscribe to all engineering events → notification adapter
        for event_key in ENGINEERING_EVENTS:
            self.add_event(ENGINEERING_EVENTS[event_key], handle_engineering_event)

        # Expose notification service as a connector port
        async def notify_port(entity_type: str, entity_id: int, action: str, **kwargs):
            from app.engineering_features.notification_adapter import handle_engineering_event
            await handle_engineering_event({
                "name": f"engineering.{entity_type}.{action}",
                "source": "engineering",
                "payload": {
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "action": action,
                    **kwargs,
                },
            })
        self.add_port("notify", notify_port)

        self.register()


engineering_module = EngineeringModule()
