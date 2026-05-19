from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.drawing_revisions.schemas import DrawingRevisionCreate, DrawingRevisionUpdate
from app.drawing_revisions.crud import revision_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/drawing-revisions", tags=["drawing_revisions"])
SEARCH_FIELDS = ["description", "approved_by"]


@router.get("/")
async def list_revisions(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    drawing_id: int | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await revision_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"drawing_id": drawing_id, "status": status})


@router.get("/{id}")
async def get_revision(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await revision_crud.get(db, id)


@router.post("/")
async def create_revision(data: DrawingRevisionCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await revision_crud.create(db, data)


@router.put("/{id}")
async def update_revision(id: int, data: DrawingRevisionUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await revision_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_revision(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await revision_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_revisions(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await revision_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
