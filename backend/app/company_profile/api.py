from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.company_profile.schemas import CompanyProfileCreate, CompanyProfileUpdate
from app.company_profile.crud import company_profile_crud
from app.company_profile.models import CompanyProfile
from app.core.schemas import BulkDeleteRequest

router = APIRouter(prefix="/api/company-profile", tags=["Company Profile"])


@router.get("/current")
async def get_current_profile(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(CompanyProfile).limit(1))
    profile = result.scalar_one_or_none()
    if not profile:
        return None
    return profile


@router.get("/")
async def list_profiles(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await company_profile_crud.list(db)


@router.get("/{id}")
async def get_profile(id: int, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    return await company_profile_crud.get(db, id)


@router.post("/")
async def create_profile(data: CompanyProfileCreate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await company_profile_crud.create(db, data, actor_id=user.id)


@router.put("/{id}")
async def update_profile(id: int, data: CompanyProfileUpdate, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin", "engineer"))):
    return await company_profile_crud.update(db, id, data, actor_id=user.id)


@router.delete("/{id}")
async def delete_profile(id: int, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    await company_profile_crud.delete(db, id, actor_id=user.id)
    return {"ok": True}


@router.post("/bulk-delete")
async def bulk_delete_profiles(data: BulkDeleteRequest, db: AsyncSession = Depends(get_db), user=Depends(require_role("admin"))):
    deleted = await company_profile_crud.bulk_delete(db, data.ids, actor_id=user.id)
    return {"deleted": deleted}
