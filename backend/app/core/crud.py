import math
from typing import Any, Generic, TypeVar
from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import String, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.base import Base
from app.core.audit import AuditLog

ModelT = TypeVar("ModelT", bound=Base)


class GenericCRUD(Generic[ModelT]):
    def __init__(self, model: type[ModelT]):
        self.model = model

    async def list(
        self,
        db: AsyncSession,
        search: str | None = None,
        search_fields: list[str] | None = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str | None = None,
        sort_order: str = "asc",
        filters: dict[str, Any] | None = None,
    ) -> dict:
        query = select(self.model)

        if filters:
            for key, value in filters.items():
                if value is not None:
                    col = getattr(self.model, key, None)
                    if col is not None:
                        query = query.where(col == value)

        if search and search_fields:
            conditions = [
                getattr(self.model, f).cast(String).ilike(f"%{search}%")
                for f in search_fields
                if hasattr(self.model, f)
            ]
            if conditions:
                query = query.where(or_(*conditions))

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        sort_col = getattr(self.model, sort_by, None) if sort_by else None
        if sort_col is not None:
            order = sort_col.asc() if sort_order == "asc" else sort_col.desc()
            query = query.order_by(order)
        else:
            query = query.order_by(self.model.id)

        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        items = result.scalars().all()

        return {
            "items": [self._to_dict(item) for item in items],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if total > 0 else 0,
        }

    async def get(self, db: AsyncSession, id: int) -> ModelT:
        result = await db.execute(select(self.model).where(self.model.id == id))
        obj = result.scalar_one_or_none()
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{self.model.__name__} not found")
        return obj

    async def create(self, db: AsyncSession, data: BaseModel, actor_id: int | None = None) -> ModelT:
        obj = self.model(**data.model_dump())
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        if actor_id:
            db.add(AuditLog(user_id=actor_id, action="CREATE", entity_type=self.model.__tablename__, entity_id=obj.id))
            await db.commit()
        return obj

    async def update(self, db: AsyncSession, id: int, data: BaseModel, actor_id: int | None = None) -> ModelT:
        obj = await self.get(db, id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, key, value)
        await db.commit()
        await db.refresh(obj)
        if actor_id:
            db.add(AuditLog(user_id=actor_id, action="UPDATE", entity_type=self.model.__tablename__, entity_id=obj.id))
            await db.commit()
        return obj

    async def delete(self, db: AsyncSession, id: int, actor_id: int | None = None) -> None:
        obj = await self.get(db, id)
        await db.delete(obj)
        await db.commit()
        if actor_id:
            db.add(AuditLog(user_id=actor_id, action="DELETE", entity_type=self.model.__tablename__, entity_id=id))
            await db.commit()

    async def bulk_delete(self, db: AsyncSession, ids: list[int], actor_id: int | None = None) -> int:
        result = await db.execute(delete(self.model).where(self.model.id.in_(ids)))
        await db.commit()
        if actor_id:
            db.add(AuditLog(user_id=actor_id, action="BULK_DELETE", entity_type=self.model.__tablename__, details=str(ids)))
            await db.commit()
        return result.rowcount

    def _to_dict(self, obj: ModelT) -> dict:
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
