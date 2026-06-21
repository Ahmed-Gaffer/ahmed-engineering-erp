from typing import List
from decimal import Decimal
from datetime import date
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

from app.database import get_db
from app.projects.models import Project

from .models import (
    BOQItem, Contract, IPCHeader, IPCDetail,
    DailyReport, Subcontractor, Schedule, EngDocument
)
from .schemas import (
    ContractCreate, ContractUpdate,
    BOQItemCreate, BOQItemUpdate,
    IPCHeaderCreate, IPCHeaderUpdate,
    DrawingCreate, DailyReportCreate,
    SubcontractorCreate, ScheduleCreate,
)
from .dashboard import get_dashboard_summary

router = APIRouter(prefix="/api/engineering", tags=["Engineering"])


# ─── Dashboard ───

@router.get("/dashboard/summary")
async def dashboard_summary(db: AsyncSession = Depends(get_db)):
    return await get_dashboard_summary(db)


# ─── Projects ───

@router.get("/projects")
async def list_projects(skip: int = Query(0, ge=0), limit: int = Query(100, le=1000), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/projects/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


# ─── Contracts ───

@router.post("/contracts")
async def create_contract(data: ContractCreate, db: AsyncSession = Depends(get_db)):
    contract = Contract(**data.model_dump())
    db.add(contract)
    await db.commit()
    await db.refresh(contract)
    return contract


@router.get("/projects/{project_id}/contracts")
async def list_project_contracts(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contract).where(Contract.project_id == project_id))
    return result.scalars().all()


@router.get("/contracts/{contract_id}")
async def get_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    contract = await db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    return contract


@router.patch("/contracts/{contract_id}")
async def update_contract(contract_id: int, data: ContractUpdate, db: AsyncSession = Depends(get_db)):
    contract = await db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(404, "Contract not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(contract, key, val)
    await db.commit()
    await db.refresh(contract)
    return contract


# ─── BOQ ───

@router.post("/boq-items")
async def create_boq_item(data: BOQItemCreate, db: AsyncSession = Depends(get_db)):
    item_data = data.model_dump()
    item_data["total_price"] = data.quantity * data.unit_price
    item = BOQItem(**item_data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/boq-items/bulk")
async def bulk_create_boq_items(items: List[BOQItemCreate], db: AsyncSession = Depends(get_db)):
    created = []
    for data in items:
        item_data = data.model_dump()
        item_data["total_price"] = data.quantity * data.unit_price
        item = BOQItem(**item_data)
        db.add(item)
        created.append(item)
    await db.commit()
    for item in created:
        await db.refresh(item)
    return created


@router.get("/projects/{project_id}/boq")
async def list_project_boq(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BOQItem).where(BOQItem.project_id == project_id))
    items = result.scalars().all()
    return items


@router.put("/boq-items/{item_id}")
async def update_boq_item(item_id: int, data: BOQItemUpdate, db: AsyncSession = Depends(get_db)):
    item = await db.get(BOQItem, item_id)
    if not item:
        raise HTTPException(404, "BOQ item not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(item, key, val)
    if "quantity" in update_data or "unit_price" in update_data:
        item.total_price = item.quantity * item.unit_price
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/boq-items/{item_id}")
async def delete_boq_item(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await db.get(BOQItem, item_id)
    if not item:
        raise HTTPException(404, "BOQ item not found")
    await db.delete(item)
    await db.commit()
    return {"detail": "BOQ item deleted successfully"}


# ─── BOQ Export/Import ───

@router.get("/projects/{project_id}/boq/export")
async def export_boq_excel(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BOQItem).where(BOQItem.project_id == project_id))
    items = result.scalars().all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "BOQ"
    hdr_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    hdr_font = Font(bold=True, size=12, color="FFFFFF")
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

    headers = ["Item Code", "Description", "Unit", "Quantity", "Unit Price", "Total Price", "Category", "Group"]
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = hdr_font
        cell.fill = hdr_fill
        cell.alignment = Alignment(horizontal='center')
        cell.border = thin_border

    for i, item in enumerate(items, 2):
        ws.cell(row=i, column=1, value=item.item_code).border = thin_border
        ws.cell(row=i, column=2, value=item.description).border = thin_border
        ws.cell(row=i, column=3, value=item.unit).border = thin_border
        ws.cell(row=i, column=4, value=float(item.quantity)).border = thin_border
        ws.cell(row=i, column=5, value=float(item.unit_price)).border = thin_border
        ws.cell(row=i, column=6, value=float(item.total_price)).border = thin_border
        ws.cell(row=i, column=7, value=item.category or "").border = thin_border
        ws.cell(row=i, column=8, value="Yes" if item.is_group else "No").border = thin_border

    ws.column_dimensions['A'].width = 12
    ws.column_dimensions['B'].width = 35
    ws.column_dimensions['C'].width = 8
    ws.column_dimensions['D'].width = 12
    ws.column_dimensions['E'].width = 14
    ws.column_dimensions['F'].width = 14
    ws.column_dimensions['G'].width = 14
    ws.column_dimensions['H'].width = 8

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             headers={"Content-Disposition": f"attachment; filename=boq_project_{project_id}.xlsx"})


@router.post("/projects/{project_id}/boq/import")
async def import_boq_excel(project_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    contents = await file.read()
    wb = openpyxl.load_workbook(BytesIO(contents))
    ws = wb.active
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    created = 0
    errors = []
    for i, row in enumerate(rows):
        try:
            item_code, description, unit, quantity, unit_price, _, category, is_group = row
            is_group_val = str(is_group).lower() in ("yes", "true", "1") if is_group else False
            item = BOQItem(
                project_id=project_id,
                item_code=str(item_code or ""),
                description=str(description or ""),
                unit=str(unit or ""),
                quantity=Decimal(str(quantity or 0)),
                unit_price=Decimal(str(unit_price or 0)),
                category=str(category or "") if category else None,
                is_group=is_group_val,
            )
            item.total_price = item.quantity * item.unit_price
            db.add(item)
            created += 1
        except Exception as e:
            errors.append({"row": i + 2, "error": str(e)})
    await db.commit()
    return {"created": created, "errors": errors}


# ─── IPC ───

@router.post("/ipcs")
async def create_ipc(data: IPCHeaderCreate, db: AsyncSession = Depends(get_db)):
    header = IPCHeader(
        project_id=data.project_id,
        contract_id=data.contract_id,
        ipc_number=data.ipc_number,
        ipc_period=data.ipc_period,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(header)
    await db.flush()

    total_amount = Decimal("0")
    for detail_data in data.details:
        boq = await db.get(BOQItem, detail_data.boq_item_id)
        if not boq:
            continue

        prev_result = await db.execute(
            select(IPCDetail).where(IPCDetail.boq_item_id == detail_data.boq_item_id).order_by(IPCDetail.id.desc())
        )
        prev = prev_result.scalars().all()
        previous_qty = sum(d.current_quantity for d in prev)
        current_qty = detail_data.current_quantity
        cumulative = previous_qty + current_qty
        amount = current_qty * boq.unit_price
        total_amount += amount

        detail = IPCDetail(
            ipc_id=header.id,
            boq_item_id=detail_data.boq_item_id,
            previous_quantity=previous_qty,
            current_quantity=current_qty,
            cumulative_quantity=cumulative,
            percentage=(cumulative / boq.quantity * 100) if boq.quantity > 0 else Decimal("0"),
            amount=amount,
            boq_item_code=boq.item_code,
            boq_item_description=boq.description,
            boq_item_unit=boq.unit,
        )
        db.add(detail)

    contract = await db.get(Contract, data.contract_id)
    retention = Decimal("0")
    if contract:
        retention = total_amount * (contract.retention_percent / 100)

    header.total_amount = total_amount
    header.retention_amount = retention
    header.net_amount = total_amount - retention
    await db.commit()
    await db.refresh(header)
    return header


@router.get("/projects/{project_id}/ipcs")
async def list_project_ipcs(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IPCHeader).where(IPCHeader.project_id == project_id))
    return result.scalars().all()


@router.get("/ipcs/{ipc_id}")
async def get_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc:
        raise HTTPException(404, "IPC not found")
    return ipc


@router.post("/ipcs/{ipc_id}/submit")
async def submit_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc or ipc.status != "draft":
        raise HTTPException(400, "IPC cannot be submitted")
    ipc.status = "submitted"
    await db.commit()
    await db.refresh(ipc)
    return ipc


@router.post("/ipcs/{ipc_id}/approve")
async def approve_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc or ipc.status not in ("draft", "submitted"):
        raise HTTPException(400, "IPC cannot be approved")
    ipc.status = "approved"
    await db.commit()
    await db.refresh(ipc)
    return ipc


@router.post("/ipcs/{ipc_id}/reject")
async def reject_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc or ipc.status != "submitted":
        raise HTTPException(400, "IPC cannot be rejected")
    ipc.status = "rejected"
    await db.commit()
    await db.refresh(ipc)
    return ipc


@router.post("/ipcs/{ipc_id}/pay")
async def pay_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc or ipc.status != "approved":
        raise HTTPException(400, "IPC cannot be paid")
    ipc.status = "paid"
    await db.commit()
    await db.refresh(ipc)
    return ipc


@router.delete("/ipcs/{ipc_id}")
async def delete_ipc(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc:
        raise HTTPException(404, "IPC not found")
    await db.delete(ipc)
    await db.commit()
    return {"detail": "IPC deleted successfully"}


@router.put("/ipcs/{ipc_id}")
async def update_ipc(ipc_id: int, data: IPCHeaderUpdate, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc:
        raise HTTPException(404, "IPC not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(ipc, key, val)
    await db.commit()
    await db.refresh(ipc)
    return ipc


# ─── IPC Export ───

@router.get("/ipcs/{ipc_id}/export")
async def export_ipc_excel(ipc_id: int, db: AsyncSession = Depends(get_db)):
    ipc = await db.get(IPCHeader, ipc_id)
    if not ipc:
        raise HTTPException(404, "IPC not found")
    result = await db.execute(select(IPCDetail).where(IPCDetail.ipc_id == ipc_id))
    details = result.scalars().all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"IPC-{ipc.ipc_number}"
    hdr_font = Font(bold=True, size=12)
    hdr_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    hdr_font_white = Font(bold=True, size=12, color="FFFFFF")
    thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

    ws.cell(row=1, column=1, value=f"IPC: {ipc.ipc_number}").font = Font(bold=True, size=14)
    ws.cell(row=2, column=1, value=f"Period: {ipc.start_date} to {ipc.end_date}")
    ws.cell(row=3, column=1, value=f"Status: {ipc.status}")
    ws.cell(row=4, column=1, value=f"Total: {ipc.total_amount} | Net: {ipc.net_amount} | Retention: {ipc.retention_amount}")

    headers = ["Item Code", "Description", "Unit", "Previous Qty", "Current Qty", "Cumulative", "Amount"]
    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=6, column=col, value=h)
        cell.font = hdr_font_white
        cell.fill = hdr_fill
        cell.alignment = Alignment(horizontal='center')
        cell.border = thin_border

    for i, d in enumerate(details, 7):
        ws.cell(row=i, column=1, value=d.boq_item_code).border = thin_border
        ws.cell(row=i, column=2, value=d.boq_item_description).border = thin_border
        ws.cell(row=i, column=3, value=d.boq_item_unit).border = thin_border
        ws.cell(row=i, column=4, value=float(d.previous_quantity)).border = thin_border
        ws.cell(row=i, column=5, value=float(d.current_quantity)).border = thin_border
        ws.cell(row=i, column=6, value=float(d.cumulative_quantity)).border = thin_border
        ws.cell(row=i, column=7, value=float(d.amount)).border = thin_border

    ws.column_dimensions['A'].width = 12
    ws.column_dimensions['B'].width = 30
    ws.column_dimensions['C'].width = 8
    ws.column_dimensions['D'].width = 14
    ws.column_dimensions['E'].width = 14
    ws.column_dimensions['F'].width = 14
    ws.column_dimensions['G'].width = 14

    buf = BytesIO()
    wb.save(buf)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             headers={"Content-Disposition": f"attachment; filename=ipc_{ipc.ipc_number}.xlsx"})


# ─── Drawings ───


@router.post("/drawings")
async def create_drawing(data: DrawingCreate, db: AsyncSession = Depends(get_db)):
    from app.drawings.models import Drawing
    dwg = Drawing(**data.model_dump())
    db.add(dwg)
    await db.commit()
    await db.refresh(dwg)
    return dwg

@router.get("/projects/{project_id}/drawings")
async def list_project_drawings(project_id: int, db: AsyncSession = Depends(get_db)):
    from app.drawings.models import Drawing
    result = await db.execute(select(Drawing).where(Drawing.project_id == project_id))
    return result.scalars().all()


# ─── Daily Reports ───

@router.post("/daily-reports")
async def create_daily_report(data: DailyReportCreate, db: AsyncSession = Depends(get_db)):
    report = DailyReport(**data.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/projects/{project_id}/daily-reports")
async def list_daily_reports(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyReport).where(DailyReport.project_id == project_id))
    return result.scalars().all()


# ─── Subcontractors ───

@router.post("/subcontractors")
async def create_subcontractor(data: SubcontractorCreate, db: AsyncSession = Depends(get_db)):
    sub = Subcontractor(**data.model_dump())
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub


@router.get("/projects/{project_id}/subcontractors")
async def list_subcontractors(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subcontractor).where(Subcontractor.project_id == project_id))
    return result.scalars().all()


# ─── Schedules ───

@router.post("/schedules")
async def create_schedule(data: ScheduleCreate, db: AsyncSession = Depends(get_db)):
    sched = Schedule(**data.model_dump())
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return sched


@router.get("/projects/{project_id}/schedules")
async def list_schedules(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Schedule).where(Schedule.project_id == project_id))
    return result.scalars().all()


@router.patch("/schedules/{schedule_id}/progress")
async def update_schedule_progress(schedule_id: int, progress: float, db: AsyncSession = Depends(get_db)):
    sched = await db.get(Schedule, schedule_id)
    if not sched:
        raise HTTPException(404, "Schedule not found")
    sched.progress_percent = Decimal(str(progress))
    await db.commit()
    await db.refresh(sched)
    return sched


# ─── Documents ───

@router.post("/documents")
async def create_document(
    project_id: int, title: str, doc_type: str = "correspondence",
    reference_number: str = None, file_path: str = None,
    status: str = "draft", created_by: str = None,
    db: AsyncSession = Depends(get_db),
):
    doc = EngDocument(
        project_id=project_id, title=title, doc_type=doc_type,
        reference_number=reference_number, file_path=file_path,
        status=status, created_by=created_by,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/projects/{project_id}/documents")
async def list_documents(project_id: int, doc_type: str = Query(None), db: AsyncSession = Depends(get_db)):
    stmt = select(EngDocument).where(EngDocument.project_id == project_id)
    if doc_type:
        stmt = stmt.where(EngDocument.doc_type == doc_type)
    result = await db.execute(stmt)
    return result.scalars().all()
