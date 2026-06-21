from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.drawings.schemas import DrawingCreate, DrawingUpdate
from app.drawings.crud import drawing_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/drawings", tags=["drawings"])
SEARCH_FIELDS = ["drawing_number", "title", "created_by"]


@router.get("/")
async def list_drawings(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    phase_id: int | None = Query(None),
    status: str | None = Query(None),
    discipline: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await drawing_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "phase_id": phase_id, "status": status, "discipline": discipline})


@router.get("/{id}")
async def get_drawing(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await drawing_crud.get(db, id)


@router.post("/")
async def create_drawing(data: DrawingCreate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await drawing_crud.create(db, data, actor_id=user.id)


@router.put("/{id}")
async def update_drawing(id: int, data: DrawingUpdate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await drawing_crud.update(db, id, data, actor_id=user.id)


@router.delete("/{id}")
async def delete_drawing(id: int, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    await drawing_crud.delete(db, id, actor_id=user.id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_drawings(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    deleted = await drawing_crud.bulk_delete(db, data.ids, actor_id=user.id)
    return {"deleted": deleted}
