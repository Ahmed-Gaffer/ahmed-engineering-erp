from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.crud import GenericCRUD
from app.work_orders.models import WorkOrder
from app.work_order_items.models import WorkOrderItem


class WorkOrderCRUD(GenericCRUD[WorkOrder]):
    async def update_total_amount(self, db: AsyncSession, work_order_id: int) -> None:
        result = await db.execute(
            select(func.coalesce(func.sum(WorkOrderItem.total_price), 0))
            .where(WorkOrderItem.work_order_id == work_order_id)
        )
        total = result.scalar() or 0
        wo = await self.get(db, work_order_id)
        wo.total_amount = float(total)
        await db.commit()


work_order_crud = WorkOrderCRUD(WorkOrder)
