from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, union_all, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import require_role
from app.contractors.models import Contractor
from app.projects.models import Project
from app.employees.models import Employee

SEARCHABLE_MODELS = {
    "contractors": (Contractor, ["code", "name"], "/engineering/contractors"),
    "projects": (Project, ["code", "name", "location"], "/engineering/projects"),
    "employees": (Employee, ["employee_code", "full_name", "position"], "/engineering/employees"),
}

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/")
async def global_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("admin", "engineer")),
):
    results = []
    for key, (model, fields, base_path) in SEARCHABLE_MODELS.items():
        query = select(model)
        conditions = []
        for f in fields:
            col = getattr(model, f, None)
            if col is not None:
                from sqlalchemy import String, cast
                conditions.append(cast(col, String).ilike(f"%{q}%"))
        if conditions:
            from sqlalchemy import or_
            query = query.where(or_(*conditions)).limit(limit)
            result = await db.execute(query)
            for item in result.scalars().all():
                label = getattr(item, fields[1] if len(fields) > 1 else fields[0], "")
                code = getattr(item, fields[0], "")
                results.append({
                    "entity_type": key,
                    "id": item.id,
                    "code": str(code),
                    "label": str(label),
                    "url": f"{base_path}/{item.id}",
                })

    return {"results": results, "query": q, "total": len(results)}
