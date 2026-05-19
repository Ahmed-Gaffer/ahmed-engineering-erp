from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.projects.schemas import ProjectCreate, ProjectUpdate
from app.projects.crud import project_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/projects", tags=["projects"])
SEARCH_FIELDS = ["code", "name", "location", "client_name", "project_manager"]


@router.get("/")
async def list_projects(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    status: str | None = Query(None),
    project_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await project_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"status": status, "project_type": project_type})


@router.get("/{id}")
async def get_project(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await project_crud.get(db, id)


@router.post("/")
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await project_crud.create(db, data)


@router.put("/{id}")
async def update_project(id: int, data: ProjectUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await project_crud.update(db, id, data)


@router.delete("/{id}")
async def delete_project(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    await project_crud.delete(db, id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_projects(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    deleted = await project_crud.bulk_delete(db, data.ids)
    return {"deleted": deleted}
