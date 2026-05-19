from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.phases.schemas import ProjectPhaseCreate, ProjectPhaseUpdate
from app.phases.crud import phase_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/phases", tags=["phases"])
SEARCH_FIELDS = ["name"]


@router.get("/")
async def list_phases(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await phase_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "status": status})


@router.get("/{id}")
async def get_phase(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await phase_crud.get(db, id)


@router.post("/")
async def create_phase(data: ProjectPhaseCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await phase_crud.create(db, data)


@router.put("/{id}")
async def update_phase(id: int, data: ProjectPhaseUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await phase_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_phase(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await phase_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_phases(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await phase_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
