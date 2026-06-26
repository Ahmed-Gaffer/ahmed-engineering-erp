from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.documents.schemas import DocumentCreate, DocumentUpdate
from app.documents.crud import document_crud
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/documents", tags=["documents"])
SEARCH_FIELDS = ["doc_number", "title", "related_party", "tags"]


@router.get("/")
async def list_documents(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str | None = Query(None),
    sort_order: str = Query("asc"),
    project_id: int | None = Query(None),
    type: str | None = Query(None),
    direction: str | None = Query(None),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await document_crud.list(db, search=search, search_fields=SEARCH_FIELDS, page=page, limit=limit, sort_by=sort_by, sort_order=sort_order, filters={"project_id": project_id, "type": type, "direction": direction, "status": status})


@router.get("/{id}")
async def get_document(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await document_crud.get(db, id)


@router.post("/")
async def create_document(data: DocumentCreate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await document_crud.create(db, data, actor_id=user.id)


@router.put("/{id}")
async def update_document(id: int, data: DocumentUpdate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await document_crud.update(db, id, data, actor_id=user.id)


@router.delete("/{id}")
async def delete_document(id: int, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    await document_crud.delete(db, id, actor_id=user.id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_documents(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    deleted = await document_crud.bulk_delete(db, data.ids, actor_id=user.id)
    return {"deleted": deleted}
