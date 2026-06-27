from decimal import Decimal
from typing import List
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.projects.models import Project
from app.drawings.models import Drawing
from app.workflow.models import WorkflowLog
from app.notifications.models import Notification
from app.activities.models import Activity

from .models import (
    BOQItem, Contract, IPCHeader, DailyReport, Subcontractor, Schedule, EngDocument,
    VariationOrder, RFI,
)
from .schemas import DashboardSummary


async def get_dashboard_summary(db: AsyncSession) -> DashboardSummary:
    projects_result = await db.execute(select(func.count()).select_from(Project))
    total_projects = projects_result.scalar() or 0

    contracts_result = await db.execute(select(Contract))
    contracts = contracts_result.scalars().all()
    total_contract_value = sum((c.value or 0) for c in contracts)

    boq_result = await db.execute(select(func.count()).select_from(BOQItem))
    total_boq_items = boq_result.scalar() or 0
    boq_value_result = await db.execute(select(func.coalesce(func.sum(BOQItem.total_price), 0)))
    total_boq_value = boq_value_result.scalar() or 0

    ipc_result = await db.execute(select(IPCHeader))
    ipcs = ipc_result.scalars().all()
    total_ipc_count = len(ipcs)
    total_ipc_amount = sum((i.total_works or 0) for i in ipcs)
    total_ipc_paid = sum((i.net_amount or 0) for i in ipcs if i.status == "paid")
    total_ipc_approved = sum((i.net_amount or 0) for i in ipcs if i.status == "approved")

    status_counts = {}
    proj_result = await db.execute(select(Project.status, func.count()).group_by(Project.status))
    for row in proj_result:
        status_counts[row[0] or "unknown"] = row[1]
    projects_by_status = [{"status": k, "count": v} for k, v in status_counts.items()]

    ipc_status = {}
    for i in ipcs:
        st = i.status or "unknown"
        if st not in ipc_status:
            ipc_status[st] = {"count": 0, "amount": Decimal("0")}
        ipc_status[st]["count"] += 1
        ipc_status[st]["amount"] += i.net_amount or 0
    ipc_by_status = [{"status": k, "count": v["count"], "amount": str(v["amount"])} for k, v in ipc_status.items()]

    total_contract_value_dec = Decimal(str(total_contract_value)) if total_contract_value else Decimal("0")
    overall_execution_rate = (total_ipc_amount / total_contract_value_dec * 100) if total_contract_value_dec > 0 else Decimal("0")
    overall_financial_progress = (total_ipc_paid / total_contract_value_dec * 100) if total_contract_value_dec > 0 else Decimal("0")
    total_remaining_value = total_contract_value_dec - total_ipc_paid

    recent_ipcs_stmt = select(IPCHeader).order_by(IPCHeader.id.desc()).limit(10)
    recent_ipcs_result = await db.execute(recent_ipcs_stmt)
    recent_ipcs_data = recent_ipcs_result.scalars().all()
    recent_ipcs = [
        {
            "id": ipc.id,
            "ipc_number": ipc.ipc_number,
            "project_id": ipc.project_id,
            "total_works": str(ipc.total_works),
            "net_amount": str(ipc.net_amount),
            "status": ipc.status,
            "created_at": ipc.created_at.isoformat() if ipc.created_at else None,
        }
        for ipc in recent_ipcs_data
    ]

    top_projects_data = sorted(contracts, key=lambda c: c.value or 0, reverse=True)[:5]
    proj_map_result = await db.execute(select(Project))
    proj_map = {p.id: p for p in proj_map_result.scalars().all()}
    top_projects = []
    for c in top_projects_data:
        p = proj_map.get(c.project_id)
        if p:
            top_projects.append({
                "id": p.id,
                "code": p.code,
                "name": p.name,
                "contract_value": str(c.value or 0),
                "status": p.status,
            })

    drawings_count = (await db.execute(select(func.count()).select_from(Drawing))).scalar() or 0
    daily_reports_count = (await db.execute(select(func.count()).select_from(DailyReport))).scalar() or 0
    subcontractors_count = (await db.execute(select(func.count()).select_from(Subcontractor))).scalar() or 0
    schedules_count = (await db.execute(select(func.count()).select_from(Schedule))).scalar() or 0
    documents_count = (await db.execute(select(func.count()).select_from(EngDocument))).scalar() or 0
    vos_count = (await db.execute(select(func.count()).select_from(VariationOrder))).scalar() or 0
    rfis_count = (await db.execute(select(func.count()).select_from(RFI))).scalar() or 0
    vo_sum_result = await db.execute(select(func.coalesce(func.sum(VariationOrder.amount_change), 0)))
    total_vo_amount = vo_sum_result.scalar() or 0

    pending_approvals = (await db.execute(
        select(func.count()).select_from(WorkflowLog).where(WorkflowLog.action == "submit")
    )).scalar() or 0

    unread_notifications_count = (await db.execute(
        select(func.count()).select_from(Notification).where(Notification.is_read == False)
    )).scalar() or 0

    recent_activity_result = await db.execute(
        select(Activity).order_by(Activity.created_at.desc()).limit(10)
    )
    recent_activity = [
        {
            "id": a.id,
            "user_id": a.user_id,
            "action": a.action,
            "entity_type": a.entity_type,
            "description": a.description,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in recent_activity_result.scalars().all()
    ]

    return DashboardSummary(
        total_projects=total_projects,
        total_contract_value=total_contract_value_dec,
        total_boq_items=total_boq_items,
        total_boq_value=total_boq_value,
        total_ipc_count=total_ipc_count,
        total_ipc_amount=total_ipc_amount,
        total_ipc_paid=total_ipc_paid,
        total_ipc_approved=total_ipc_approved,
        projects_by_status=projects_by_status,
        ipc_by_status=ipc_by_status,
        recent_ipcs=recent_ipcs,
        total_contracts=len(contracts),
        total_drawings=drawings_count,
        total_daily_reports=daily_reports_count,
        total_schedules=schedules_count,
        total_subcontractors=subcontractors_count,
        total_documents=documents_count,
        total_variation_orders=vos_count,
        total_vo_amount=total_vo_amount,
        total_rfis=rfis_count,
        overall_execution_rate=overall_execution_rate,
        overall_financial_progress=overall_financial_progress,
        total_remaining_value=total_remaining_value,
        projects_active=status_counts.get("in_progress", 0),
        projects_completed=status_counts.get("completed", 0),
        projects_planning=status_counts.get("planned", 0),
        top_projects=top_projects,
        pending_approvals=pending_approvals,
        unread_notifications=unread_notifications_count,
        recent_activity=recent_activity,
    )


async def get_ipc_trends(db: AsyncSession) -> list[dict]:
    result = await db.execute(
        select(IPCHeader).order_by(IPCHeader.project_id, IPCHeader.created_at)
    )
    ipcs = result.scalars().all()
    trends: dict[int, list] = {}
    projects_result = await db.execute(select(Project))
    projects_map = {p.id: {"code": p.code, "name": p.name} for p in projects_result.scalars().all()}
    for ipc in ipcs:
        pid = ipc.project_id
        if pid not in trends:
            trends[pid] = {"project_id": pid, "project_code": "", "project_name": "", "data": []}
            proj = projects_map.get(pid, {})
            trends[pid]["project_code"] = proj.get("code", "")
            trends[pid]["project_name"] = proj.get("name", "")
        trends[pid]["data"].append({
            "ipc_number": ipc.ipc_number,
            "period": ipc.ipc_period,
            "total_works": str(ipc.total_works),
            "net_amount": str(ipc.net_amount),
            "status": ipc.status,
            "date": ipc.created_at.isoformat() if ipc.created_at else None,
        })
    return list(trends.values())
