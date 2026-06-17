from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.contractors.models import Contractor
from app.projects.models import Project
from app.phases.models import ProjectPhase
from app.codes.models import ProjectCode
from app.work_orders.models import WorkOrder
from app.work_order_items.models import WorkOrderItem
from app.drawings.models import Drawing
from app.drawing_revisions.models import DrawingRevision
from app.documents.models import Document
from app.payment_certificates.models import PaymentCertificate
from app.core.export import export_excel

EXPORTABLE_MODELS = {
    "contractors": Contractor,
    "projects": Project,
    "phases": ProjectPhase,
    "codes": ProjectCode,
    "work_orders": WorkOrder,
    "work_order_items": WorkOrderItem,
    "drawings": Drawing,
    "drawing_revisions": DrawingRevision,
    "documents": Document,
    "payment_certificates": PaymentCertificate,
}

EXPORT_SEARCH_FIELDS = {
    "contractors": ["code", "name", "phone", "email"],
    "projects": ["code", "name", "location", "client_name", "project_manager"],
    "phases": ["name"],
    "codes": ["code", "title"],
    "work_orders": ["wo_number", "title"],
    "work_order_items": ["item_code", "description"],
    "drawings": ["drawing_number", "title", "discipline"],
    "drawing_revisions": ["description"],
    "documents": ["doc_number", "title", "related_party"],
    "payment_certificates": ["certificate_number"],
}

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/{entity}")
async def export_entity(
    entity: str,
    search: str | None = Query(None),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    model_cls = EXPORTABLE_MODELS.get(entity)
    if not model_cls:
        raise HTTPException(status_code=404, detail=f"Entity '{entity}' not found")
    search_fields = EXPORT_SEARCH_FIELDS.get(entity)
    excel_bytes = await export_excel(db, model_cls, search=search, search_fields=search_fields)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={entity}.xlsx"},
    )
