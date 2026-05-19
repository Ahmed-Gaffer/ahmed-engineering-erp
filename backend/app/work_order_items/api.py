from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.work_order_items.schemas import WorkOrderItemCreate, WorkOrderItemUpdate
from app.work_order_items.crud import work_order_item_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/work-order-items", tags=["work_order_items"])
SEARCH_FIELDS = ["item_code", "description"]


@router.get("/")
async def list_items(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    work_order_id: int | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await work_order_item_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"work_order_id": work_order_id, "status": status})


@router.get("/{id}")
async def get_item(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_item_crud.get(db, id)


@router.post("/")
async def create_item(data: WorkOrderItemCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_item_crud.create(db, data)


@router.put("/{id}")
async def update_item(id: int, data: WorkOrderItemUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await work_order_item_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_item(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await work_order_item_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_items(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await work_order_item_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
