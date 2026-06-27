from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.dependencies import security, get_current_user, get_optional_current_user, require_role
from app.core.rate_limit import auth_rate_limit
from app.auth.models import User
from app.auth.schemas import UserCreate, UserLogin, RefreshRequest
from app.auth import crud, utils as auth_utils

router = APIRouter(prefix="/api/auth", tags=["auth"], dependencies=[Depends(auth_rate_limit)])


async def _has_any_user(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count()).select_from(User))
    return (result.scalar() or 0) > 0


@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db), user: Optional[User] = Depends(get_optional_current_user)):
    has_users = await _has_any_user(db)
    if has_users:
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Registration is disabled after initial setup. Please contact an admin."
            )
        if data.role == "admin" and user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can register new admin users"
            )
    return await crud.register_user(db, data)


@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    return await crud.login_user(db, data.username, data.password)


@router.post("/refresh")
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = auth_utils.decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    jti = payload.get("jti")
    if jti and await auth_utils.is_token_blacklisted(db, jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")
    user = await auth_utils.get_user_by_id(db, int(payload.get("sub")))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")
    await auth_utils.blacklist_token(db, jti, datetime.fromtimestamp(payload["exp"], tz=timezone.utc))
    new_access = auth_utils.create_token(user.id, token_type="access")
    new_refresh = auth_utils.create_token(user.id, token_type="refresh")
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}
    }


@router.post("/logout")
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = auth_utils.decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    jti = payload.get("jti")
    if jti:
        await auth_utils.blacklist_token(db, jti, datetime.fromtimestamp(payload["exp"], tz=timezone.utc))
    return {"message": "Logged out successfully"}


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "is_active": user.is_active}