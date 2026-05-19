from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.payment_certificates.schemas import PaymentCertificateCreate, PaymentCertificateUpdate
from app.payment_certificates.crud import payment_cert_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/payment-certificates", tags=["payment_certificates"])
SEARCH_FIELDS = ["certificate_number", "notes"]


@router.get("/")
async def list_certificates(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    contractor_id: int | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await payment_cert_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "contractor_id": contractor_id, "status": status})


@router.get("/{id}")
async def get_certificate(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await payment_cert_crud.get(db, id)


@router.post("/")
async def create_certificate(data: PaymentCertificateCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await payment_cert_crud.create(db, data)


@router.put("/{id}")
async def update_certificate(id: int, data: PaymentCertificateUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await payment_cert_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_certificate(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await payment_cert_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_certificates(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await payment_cert_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
