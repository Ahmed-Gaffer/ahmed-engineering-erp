from datetime import datetime, timedelta, timezone
import uuid
import bcrypt as _bcrypt
import jwt
from jwt.exceptions import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings


def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: int, token_type: str = "access") -> str:
    if token_type == "refresh":
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": token_type,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except InvalidTokenError:
        return None


async def blacklist_token(db: AsyncSession, jti: str, expires_at: datetime):
    from app.auth.models import TokenBlacklist
    entry = TokenBlacklist(jti=jti, expires_at=expires_at)
    db.add(entry)
    await db.commit()


async def is_token_blacklisted(db: AsyncSession, jti: str) -> bool:
    from app.auth.models import TokenBlacklist
    result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.jti == jti)
    )
    return result.scalar_one_or_none() is not None


async def cleanup_blacklist(db: AsyncSession):
    from app.auth.models import TokenBlacklist
    result = await db.execute(
        select(TokenBlacklist).where(TokenBlacklist.expires_at < datetime.now(timezone.utc))
    )
    expired = result.scalars().all()
    for entry in expired:
        await db.delete(entry)
    if expired:
        await db.commit()


async def get_user_by_id(db: AsyncSession, user_id: int):
    from app.auth.models import User
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str):
    from app.auth.models import User
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()
