from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.work_orders.schemas import WorkOrderCreate, WorkOrderUpdate
from app.work_orders.crud import work_order_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/work-orders", tags=["work_orders"])
SEARCH_FIELDS = ["wo_number", "title"]


@router.get("/")
async def list_work_orders(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    contractor_id: int | None = Query(None),
    status: str | None = Query(None),
    priority: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await work_order_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "contractor_id": contractor_id, "status": status, "priority": priority})


@router.get("/{id}")
async def get_work_order(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_crud.get(db, id)


@router.post("/")
async def create_work_order(data: WorkOrderCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_crud.create(db, data)


@router.put("/{id}")
async def update_work_order(id: int, data: WorkOrderUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_work_order(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await work_order_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_work_orders(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await work_order_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
