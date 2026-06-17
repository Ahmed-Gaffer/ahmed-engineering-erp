from sqlalchemy.ext.asyncio import AsyncSession
from app.core.crud import GenericCRUD
from app.work_order_items.models import WorkOrderItem
from app.work_orders.crud import work_order_crud


class WorkOrderItemCRUD(GenericCRUD[WorkOrderItem]):
    async def create(self, db: AsyncSession, data) -> WorkOrderItem:
        data_dict = data.model_dump()
        data_dict["total_price"] = round(float(data_dict.get("quantity", 0) or 0) * float(data_dict.get("unit_price", 0) or 0), 2)
        obj = self.model(**data_dict)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        await work_order_crud.update_total_amount(db, obj.work_order_id)
        return obj

    async def update(self, db: AsyncSession, id: int, data) -> WorkOrderItem:
        obj = await self.get(db, id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(obj, key, value)
        obj.total_price = round(float(obj.quantity or 0) * float(obj.unit_price or 0), 2)
        await db.commit()
        await db.refresh(obj)
        await work_order_crud.update_total_amount(db, obj.work_order_id)
        return obj

    async def delete(self, db: AsyncSession, id: int) -> None:
        obj = await self.get(db, id)
        wo_id = obj.work_order_id
        await db.delete(obj)
        await db.commit()
        await work_order_crud.update_total_amount(db, wo_id)


work_order_item_crud = WorkOrderItemCRUD(WorkOrderItem)
