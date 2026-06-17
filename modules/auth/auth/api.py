from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.auth.models import User
from app.auth.schemas import UserCreate, UserLogin
from app.auth import crud

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def _has_any_user(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count()).select_from(User))
    return (result.scalar() or 0) > 0


@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    has_users = await _has_any_user(db)
    if has_users and (not user or user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can register new users when users exist"
        )
    return await crud.register_user(db, data)


@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await crud.login_user(db, data.username, data.password)


@router.post("/refresh")
async def refresh(user: User = Depends(get_current_user)):
    from app.auth.utils import create_token
    return {"access_token": create_token(user.id, token_type="access"), "token_type": "bearer"}


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}
