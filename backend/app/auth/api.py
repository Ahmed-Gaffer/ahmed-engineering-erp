from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.auth.schemas import UserCreate, UserLogin
from app.auth import crud

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await crud.register_user(db, data)


@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await crud.login_user(db, data.username, data.password)


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}
