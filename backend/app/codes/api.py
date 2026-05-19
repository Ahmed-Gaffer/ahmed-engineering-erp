from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.codes.schemas import ProjectCodeCreate, ProjectCodeUpdate
from app.codes.crud import code_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/codes", tags=["codes"])
SEARCH_FIELDS = ["code", "title"]


@router.get("/")
async def list_codes(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    parent_id: int | None = Query(None),
    type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await code_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "parent_id": parent_id, "type": type})


@router.get("/{id}")
async def get_code(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await code_crud.get(db, id)


@router.post("/")
async def create_code(data: ProjectCodeCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await code_crud.create(db, data)


@router.put("/{id}")
async def update_code(id: int, data: ProjectCodeUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await code_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_code(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await code_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_codes(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await code_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
