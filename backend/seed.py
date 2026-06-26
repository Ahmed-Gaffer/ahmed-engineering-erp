import asyncio, sys, os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select, text
from app.database import engine, async_session
from app.core.base import Base
from app.auth.utils import hash_password
from app.auth.models import User
from app.contractors.models import Contractor
from app.projects.models import Project
from app.phases.models import ProjectPhase
from app.codes.models import ProjectCode
from app.work_orders.models import WorkOrder
from app.work_order_items.models import WorkOrderItem
from app.drawings.models import Drawing
from app.drawing_revisions.models import DrawingRevision
from app.documents.models import Document
from app.payment_certificates.models import PaymentCertificate
from app.company_profile.models import CompanyProfile
from app.engineering_features.models import (
    BOQItem, Contract, IPCHeader, IPCDetail,
    DailyReport, Subcontractor, Schedule, EngDocument
)
from datetime import date
from decimal import Decimal


async def seed():
    async with engine.begin() as conn:
        # Drop notifications table to recreate with new schema (type column)
        await conn.execute(text("DROP TABLE IF EXISTS notifications"))
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = (await db.execute(select(User).where(User.username == "admin"))).scalar_one_or_none()
        if existing:
            existing_profile = (await db.execute(select(CompanyProfile).limit(1))).scalar_one_or_none()
            if not existing_profile:
                db.add(CompanyProfile(
                    company_name_ar="شركة نجيده للمقاولات العامة والتوريدات",
                    company_name_en="Negida Contracting Co.", established_year=1987,
                    about_ar="شركة نجيده للمقاولات هي شركة متخصصة في خدمات المقاولات المتكاملة.",
                    about_en="Negida Contracting is a specialized contracting integrated services company.",
                    address="شارع نقابة الزراعيين، شارع شبين الكوم، الإسماعيلية، مصر",
                    phone="+20 64 322 3385", email="info@negidacontracting.com",
                    vision_ar="أن نكون الشريك الموثوق في بناء مستقبل مصر.",
                    vision_en="To be the trusted partner in building Egypt's future.",
                    mission_ar="تحقيق رضا العملاء من خلال تقديم أعلى مستوى من الخدمات.",
                    mission_en="To achieve customer satisfaction by delivering the highest level of quality services."
                ))
                await db.commit()
                print("Company profile seeded")
            else:
                print("Data already seeded, skipping")
            return

        admin = User(username="admin", email="admin@ems.com", hashed_password=hash_password("admin123"), role="admin", is_active=True)
        db.add(admin)

        db.add(CompanyProfile(
            company_name_ar="شركة نجيده للمقاولات العامة والتوريدات",
            company_name_en="Negida Contracting Co.", established_year=1987,
            about_ar="شركة نجيده للمقاولات هي شركة متخصصة في خدمات المقاولات المتكاملة.",
            about_en="Negida Contracting is a specialized contracting integrated services company.",
            address="شارع نقابة الزراعيين، شارع شبين الكوم، الإسماعيلية، مصر",
            phone="+20 64 322 3385", email="info@negidacontracting.com",
            vision_ar="أن نكون الشريك الموثوق في بناء مستقبل مصر.",
            vision_en="To be the trusted partner in building Egypt's future.",
            mission_ar="تحقيق رضا العملاء من خلال تقديم أعلى مستوى من الخدمات.",
            mission_en="To achieve customer satisfaction by delivering the highest level of quality services."
        ))
        await db.flush()

        c1 = Contractor(code="CON001", name="شركة البناء الحديث", classification="أ", specialties="مباني, طرق", phone="0501234567", email="info@modern.com", contract_value=5000000, insurance_value=250000, insurance_remaining=150000, status="active")
        c2 = Contractor(code="CON002", name="مؤسسة الأساس المتين", classification="ب", specialties="بنية تحتية", phone="0507654321", status="active")
        db.add_all([c1, c2])
        await db.flush()

        p1 = Project(code="PRJ001", name="مشروع برج الإدارة", location="الرياض", project_type="مباني", contractor_id=c1.id, start_date=date(2025, 1, 1), end_date_planned=date(2026, 12, 31), status="in_progress", budget_estimated=50000000, budget_actual=32000000, client_name="وزارة الإسكان", consultant_name="دار الهندسة", project_manager="م. أحمد")
        p2 = Project(code="PRJ002", name="طريق الملك سلمان", location="جدة", project_type="طرق", contractor_id=c2.id, start_date=date(2025, 3, 1), end_date_planned=date(2026, 9, 30), status="in_progress", budget_estimated=80000000, budget_actual=45000000, client_name="أمانة جدة")
        p3 = Project(code="PRJ003", name="مشروع الصرف الصحي", location="الدمام", project_type="بنية تحتية", contractor_id=c2.id, start_date=date(2024, 6, 1), end_date_actual=date(2025, 12, 31), status="completed", budget_estimated=30000000, budget_actual=28500000)
        p4 = Project(code="PRJ004", name="صيانة جسر الملك فهد", location="الخبر", project_type="صيانة", status="planned", budget_estimated=15000000)
        db.add_all([p1, p2, p3, p4])
        await db.flush()

        db.add_all([
            ProjectPhase(project_id=p1.id, name="الأعمال الترابية", order_index=1, progress_percentage=100, status="completed"),
            ProjectPhase(project_id=p1.id, name="الأعمال الخرسانية", order_index=2, progress_percentage=75, status="in_progress"),
            ProjectPhase(project_id=p1.id, name="التشطيبات", order_index=3, progress_percentage=20, status="in_progress"),
            ProjectPhase(project_id=p2.id, name="الرفع المساحي", order_index=1, progress_percentage=100, status="completed"),
            ProjectPhase(project_id=p2.id, name="طبقات الأساس", order_index=2, progress_percentage=60, status="in_progress"),
            ProjectPhase(project_id=p2.id, name="طبقات الأسفلت", order_index=3, progress_percentage=10, status="pending"),
        ])
        db.add_all([
            ProjectCode(project_id=p1.id, code="01", title="أعمال الحفر", level=1, type="group"),
            ProjectCode(project_id=p1.id, code="01.01", title="حفر عادي", level=2, unit="م³", unit_price=50, total_quantity=5000, type="item"),
            ProjectCode(project_id=p1.id, code="01.02", title="حفر صخري", level=2, unit="م³", unit_price=120, total_quantity=2000, type="item"),
            ProjectCode(project_id=p1.id, code="02", title="أعمال خرسانية", level=1, type="group"),
            ProjectCode(project_id=p1.id, code="02.01", title="خرسانة مسلحة", level=2, unit="م³", unit_price=850, total_quantity=3000, type="item"),
        ])
        await db.flush()

        wo1 = WorkOrder(project_id=p1.id, wo_number="WO-001", title="أعمال الحفر للمشروع", contractor_id=c1.id, issue_date=date(2025, 1, 15), due_date=date(2025, 3, 15), priority="high", status="completed", total_amount=490000)
        wo2 = WorkOrder(project_id=p1.id, wo_number="WO-002", title="أعمال الخرسانة للدور الأرضي", contractor_id=c1.id, issue_date=date(2025, 3, 1), due_date=date(2025, 6, 30), priority="urgent", status="under_execution", total_amount=2550000)
        wo3 = WorkOrder(project_id=p2.id, wo_number="WO-003", title="أعمال الردميات", contractor_id=c2.id, issue_date=date(2025, 4, 1), due_date=date(2025, 5, 30), priority="medium", status="completed", total_amount=780000)
        db.add_all([wo1, wo2, wo3])
        await db.flush()

        db.add_all([
            WorkOrderItem(work_order_id=wo1.id, item_code="01.01", description="حفر عادي", unit="م³", quantity=5000, unit_price=50, total_price=250000, executed_quantity=5000, status="done"),
            WorkOrderItem(work_order_id=wo1.id, item_code="01.02", description="حفر صخري", unit="م³", quantity=2000, unit_price=120, total_price=240000, executed_quantity=2000, status="done"),
            WorkOrderItem(work_order_id=wo2.id, item_code="02.01", description="خرسانة مسلحة للأعمدة", unit="م³", quantity=3000, unit_price=850, total_price=2550000, executed_quantity=2200, status="partial"),
        ])

        dw1 = Drawing(project_id=p1.id, drawing_number="ARC-001", title="المخططات المعمارية - الدور الأرضي", discipline="معماري", status="approved", current_revision=3, created_by="م. أحمد")
        dw2 = Drawing(project_id=p1.id, drawing_number="STR-001", title="مخططات الأساسات", discipline="إنشائي", scale="1:100", status="approved", current_revision=2, created_by="م. خالد")
        dw3 = Drawing(project_id=p1.id, drawing_number="ELC-001", title="مخططات الكهرباء", discipline="كهرباء", status="under_review", current_revision=1, created_by="م. سامي")
        db.add_all([dw1, dw2, dw3])
        await db.flush()

        db.add_all([
            DrawingRevision(drawing_id=dw1.id, revision_number=1, description="إصدار أولي", status="approved", approved_by="م. أحمد"),
            DrawingRevision(drawing_id=dw1.id, revision_number=2, description="تعديل الأبعاد", status="approved", approved_by="م. أحمد"),
            DrawingRevision(drawing_id=dw1.id, revision_number=3, description="إضافة المدخل الرئيسي", status="submitted"),
        ])
        db.add_all([
            Document(project_id=p1.id, doc_number="CTR-001", title="عقد المقاول", type="contract", direction="incoming", related_party="شركة البناء الحديث", status="final"),
            Document(project_id=p1.id, doc_number="LTR-001", title="كتاب التكليف", type="letter", direction="outgoing", related_party="الاستشاري", status="final"),
            Document(project_id=p1.id, doc_number="RPT-001", title="تقرير الجودة الشهري", type="report", direction="internal", status="draft"),
        ])
        db.add_all([
            PaymentCertificate(project_id=p1.id, certificate_number="PC-001", contractor_id=c1.id, period_from=date(2025, 1, 1), period_to=date(2025, 3, 31), issue_date=date(2025, 4, 5), current_works=1500000, materials_on_site=200000, insurance_percent=5, retention_percent=10, status="paid", net_amount=1530000, retention_amount=153000, amount_due=1377000),
            PaymentCertificate(project_id=p1.id, certificate_number="PC-002", contractor_id=c1.id, period_from=date(2025, 4, 1), period_to=date(2025, 6, 30), issue_date=date(2025, 7, 5), current_works=2000000, materials_on_site=300000, insurance_percent=5, retention_percent=10, status="under_review", net_amount=2070000, retention_amount=207000, amount_due=1863000),
        ])

        # ── Engineering Features ──
        ctr1 = Contract(project_id=p1.id, contract_number="CTR-001", contract_type="main", party_a="وزارة الإسكان", party_b="شركة البناء الحديث", value=Decimal("50000000"), duration_months=24, retention_percent=Decimal("5"), status="active")
        ctr2 = Contract(project_id=p2.id, contract_number="CTR-002", contract_type="main", party_a="أمانة جدة", party_b="مؤسسة الأساس المتين", value=Decimal("80000000"), duration_months=18, retention_percent=Decimal("5"), status="active")
        db.add_all([ctr1, ctr2])
        await db.flush()

        boq_items = [
            BOQItem(project_id=p1.id, item_code="01", description="أعمال الحفر", unit="", quantity=0, unit_price=0, is_group=True),
            BOQItem(project_id=p1.id, item_code="01.01", description="حفر عادي", unit="م³", quantity=5000, unit_price=Decimal("50"), total_price=Decimal("250000"), parent_id=None),
            BOQItem(project_id=p1.id, item_code="01.02", description="حفر صخري", unit="م³", quantity=2000, unit_price=Decimal("120"), total_price=Decimal("240000"), parent_id=None),
            BOQItem(project_id=p1.id, item_code="02", description="أعمال خرسانية", unit="", quantity=0, unit_price=0, is_group=True),
            BOQItem(project_id=p1.id, item_code="02.01", description="خرسانة مسلحة", unit="م³", quantity=3000, unit_price=Decimal("850"), total_price=Decimal("2550000"), parent_id=None),
            BOQItem(project_id=p2.id, item_code="01", description="أعمال الردم", unit="", quantity=0, unit_price=0, is_group=True),
            BOQItem(project_id=p2.id, item_code="01.01", description="ردم عادي", unit="م³", quantity=10000, unit_price=Decimal("30"), total_price=Decimal("300000"), parent_id=None),
        ]
        db.add_all(boq_items)
        await db.flush()
        for item in boq_items:
            if item.parent_id is None and not item.is_group:
                parent = await db.execute(select(BOQItem).where(BOQItem.project_id == item.project_id, BOQItem.item_code == item.item_code.rsplit('.', 1)[0], BOQItem.is_group == True))
                parent_item = parent.scalar_one_or_none()
                if parent_item:
                    item.parent_id = parent_item.id

        ipc1 = IPCHeader(project_id=p1.id, contract_id=ctr1.id, ipc_number="IPC-001", ipc_period=1, start_date=date(2025, 4, 1), end_date=date(2025, 6, 30), status="paid", total_works=Decimal("120000"), retention_amount=Decimal("6000"), net_amount=Decimal("114000"))
        ipc2 = IPCHeader(project_id=p1.id, contract_id=ctr1.id, ipc_number="IPC-002", ipc_period=2, start_date=date(2025, 7, 1), end_date=date(2025, 9, 30), status="approved", total_works=Decimal("180000"), retention_amount=Decimal("9000"), net_amount=Decimal("171000"))
        db.add_all([ipc1, ipc2])
        await db.flush()

        await db.commit()
        print("Seed complete — admin/admin123 + demo data")


if __name__ == "__main__":
    asyncio.run(seed())
