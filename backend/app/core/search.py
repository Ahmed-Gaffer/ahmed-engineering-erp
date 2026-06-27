from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, union_all, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import require_role
from app.contractors.models import Contractor
from app.projects.models import Project
from app.employees.models import Employee
from app.drawings.models import Drawing
from app.engineering_features.models import RFI, MaterialApprovalRequest, NonConformanceReport, Contract, VariationOrder, DailyReport

SEARCHABLE_MODELS = {
    "contractors": (Contractor, ["code", "name"], "/engineering/contractors", False),
    "projects": (Project, ["code", "name", "location"], "/engineering/projects", True),
    "employees": (Employee, ["employee_code", "full_name", "position"], "/engineering/employees", False),
    "drawings": (Drawing, ["drawing_number", "title", "discipline"], "/engineering/drawings", False),
    "rfis": (RFI, ["rfi_number", "title"], "/engineering/rfis", False),
    "mar": (MaterialApprovalRequest, ["mar_number", "title", "manufacturer"], "/engineering/mar", False),
    "ncr": (NonConformanceReport, ["ncr_number", "title", "location"], "/engineering/ncr", False),
    "contracts": (Contract, ["contract_number", "party_a", "party_b"], "/engineering/contracts-list", False),
    "variation_orders": (VariationOrder, ["vo_number", "title"], "/engineering/variation-orders", False),
    "daily_reports": (DailyReport, ["work_description", "created_by"], "/engineering/daily-reports", False),
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
    for key, entry in SEARCHABLE_MODELS.items():
        model, fields, base_path = entry[:3]
        has_detail = entry[3] if len(entry) > 3 else False
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
                    "url": f"{base_path}/{item.id}" if has_detail else base_path,
                })

    return {"results": results, "query": q, "total": len(results)}
