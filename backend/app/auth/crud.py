from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import User
from app.auth.schemas import UserCreate
from app.auth.utils import create_token, get_user_by_username, hash_password, verify_password


async def register_user(db: AsyncSession, data: UserCreate) -> dict:
    existing = await get_user_by_username(db, data.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    access_token = create_token(user.id, token_type="access")
    refresh_token = create_token(user.id, token_type="refresh")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}
    }


async def login_user(db: AsyncSession, username: str, password: str) -> dict:
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    access_token = create_token(user.id, token_type="access")
    refresh_token = create_token(user.id, token_type="refresh")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}
    }
