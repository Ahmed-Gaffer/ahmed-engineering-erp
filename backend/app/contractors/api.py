from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.contractors.schemas import ContractorCreate, ContractorUpdate
from app.contractors.crud import contractor_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/contractors", tags=["contractors"])
SEARCH_FIELDS = ["code", "name", "phone", "email", "commercial_register"]


@router.get("/")
async def list_contractors(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await contractor_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"status": status})


@router.get("/{id}")
async def get_contractor(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await contractor_crud.get(db, id)


@router.post("/")
async def create_contractor(data: ContractorCreate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await contractor_crud.create(db, data, actor_id=user.id)


@router.put("/{id}")
async def update_contractor(id: int, data: ContractorUpdate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await contractor_crud.update(db, id, data, actor_id=user.id)


@router.delete("/{id}")
async def delete_contractor(id: int, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    await contractor_crud.delete(db, id, actor_id=user.id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_contractors(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    deleted = await contractor_crud.bulk_delete(db, data.ids, actor_id=user.id)
    return {"deleted": deleted}
