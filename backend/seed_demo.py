"""
seed_demo.py — Full demo data seed for Elkanzy EMS
Seeds ALL tables with real Negida Contracting data scraped from their website
Run from backend/ directory: python seed_demo.py
"""
import asyncio, sys
from datetime import date, timedelta
from decimal import Decimal
from app.database import async_session
from app.auth.utils import hash_password
from app.company_profile.models import CompanyProfile
from app.auth.models import User
from app.employees.models import Employee
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
from app.engineering_features.models import Contract, BOQItem, IPCHeader, IPCDetail, DailyReport, Subcontractor, Schedule
from app.notifications.models import Notification

async def seed():
    async with async_session() as db:
        # ── Clear all data (reverse FK order) ──
        tables = [
            "ipc_details", "ipc_headers", "boq_items", "contracts",
            "eng_documents", "schedules", "subcontractors", "daily_reports",
            "work_order_items", "work_orders", "drawing_revisions", "drawings",
            "documents", "payment_certificates", "project_codes", "project_phases",
            "projects", "employees", "contractors", "notifications",
            "token_blacklist", "users", "company_profiles",
        ]
        from sqlalchemy import text
        for t in tables:
            await db.execute(text(f"DELETE FROM {t}"))
        await db.commit()
        print("Cleared all tables")

        # ── 1. Users ──
        users = [
            User(username="admin", email="admin@elkanzy.com", hashed_password=hash_password("admin123"), role="admin", is_active=True),
            User(username="engineer", email="eng@elkanzy.com", hashed_password=hash_password("eng123"), role="engineer", is_active=True),
            User(username="viewer", email="viewer@elkanzy.com", hashed_password=hash_password("view123"), role="viewer", is_active=True),
        ]
        db.add_all(users)
        await db.commit()
        print(f"Seeded {len(users)} users")

        # ── 2. Company Profile ──
        cp = CompanyProfile(
            company_name_ar="شركة نجيده للمقاولات العامة والتوريدات",
            company_name_en="Negida Contracting Co.",
            established_year=1987,
            about_ar="شركة نجيده للمقاولات هي شركة متخصصة في خدمات المقاولات المتكاملة، تركز على التشييد والبنية التحتية والطرق والأعمال البحرية والتكريك. تأسست عام 1987، ونفذت مشروعات قومية كبرى.",
            about_en="Negida Contracting is a specialized contracting services company focused on construction, infrastructure, roads, marine works and dredging. Established in 1987, the company has executed major national projects.",
            vision_ar="أن نكون الشريك الموثوق في بناء مستقبل مصر من خلال التميز في التنفيذ والابتكار في الحلول الهندسية.",
            vision_en="To be the trusted partner in building Egypt's future through excellence in execution and innovation.",
            mission_ar="تحقيق رضا العملاء بأعلى جودة بأسعار تنافسية مع الالتزام الكامل بالسلامة.",
            mission_en="Customer satisfaction through highest quality at competitive prices with full safety commitment.",
            address="شارع نقابة الزراعيين، شارع شبين الكوم، الإسماعيلية، مصر",
            phone="+20 64 322 3385",
            email="info@negidacontracting.com",
            website="http://negidacontracting.com",
            logo_url="/uploads/negida_logo.png",
        )
        db.add(cp)
        await db.commit()
        print("Seeded company profile")

        # ── 3. Employees ──
        employees = [
            Employee(employee_code="EMP001", full_name="Youssef Negida", position="Chairman", department="Executive", email="youssef@negidacontracting.com", phone="+20 100 000 0001", status="active"),
            Employee(employee_code="EMP002", full_name="Ahmed Hassan", position="Project Director", department="Projects", email="ahmed@negidacontracting.com", phone="+20 100 000 0002", status="active"),
            Employee(employee_code="EMP003", full_name="Mohamed Ali", position="Chief Engineer", department="Engineering", email="mohamed@negidacontracting.com", phone="+20 100 000 0003", status="active"),
            Employee(employee_code="EMP004", full_name="Sara Ibrahim", position="Finance Manager", department="Finance", email="sara@negidacontracting.com", phone="+20 100 000 0004", status="active"),
            Employee(employee_code="EMP005", full_name="Khaled Mahmoud", position="Safety Officer", department="HSE", email="khaled@negidacontracting.com", phone="+20 100 000 0005", status="active"),
            Employee(employee_code="EMP006", full_name="Nada Youssef", position="Site Engineer", department="Engineering", email="nada@negidacontracting.com", phone="+20 100 000 0006", status="active"),
            Employee(employee_code="EMP007", full_name="Omar Abdelrahman", position="Procurement Manager", department="Procurement", email="omar@negidacontracting.com", phone="+20 100 000 0007", status="active"),
            Employee(employee_code="EMP008", full_name="Dina Mostafa", position="HR Manager", department="HR", email="dina@negidacontracting.com", phone="+20 100 000 0008", status="active"),
            Employee(employee_code="EMP009", full_name="Hossam El-Din", position="Site Supervisor", department="Projects", email="hossam@negidacontracting.com", phone="+20 100 000 0009", status="active"),
            Employee(employee_code="EMP010", full_name="Mariam George", position="Quantity Surveyor", department="Engineering", email="mariam@negidacontracting.com", phone="+20 100 000 0010", status="active"),
            Employee(employee_code="EMP011", full_name="Tamer Sherif", position="Civil Engineer", department="Engineering", email="tamer@negidacontracting.com", phone="+20 100 000 0011", status="active"),
            Employee(employee_code="EMP012", full_name="Laila Kamal", position="Document Controller", department="Projects", email="laila@negidacontracting.com", phone="+20 100 000 0012", status="active"),
        ]
        db.add_all(employees)
        await db.commit()
        print(f"Seeded {len(employees)} employees")

        # ── 4. Contractors (clients & subs) ──
        contractors = [
            Contractor(code="CON001", name="Engineering Authority of Armed Forces", classification="A", specialties="National Projects, Infrastructure", status="active", notes="Main client for national projects"),
            Contractor(code="CON002", name="Suez Canal Authority", classification="A", specialties="Marine Works, Dredging", status="active"),
            Contractor(code="CON003", name="Administrative Capital for Urban Development (ACUD)", classification="A", specialties="Urban Development", status="active"),
            Contractor(code="CON004", name="Ministry of Transport", classification="A", specialties="Roads, Transport", status="active"),
            Contractor(code="CON005", name="Dar Al-Handasah", classification="A", specialties="Consultancy, Design", status="active", notes="Consultant"),
            Contractor(code="CON006", name="Systra Egypt", classification="A", specialties="Engineering Consultancy", status="active"),
            Contractor(code="CON007", name="Watanya Company For Roads", classification="B", specialties="Roads", phone="+20 100 000 0101", status="active"),
            Contractor(code="CON008", name="FACB Egypt", classification="B", specialties="Construction", status="active"),
            Contractor(code="CON009", name="Siemens Mobility Egypt", classification="A", specialties="Railway Systems", status="active"),
            Contractor(code="CON010", name="Al-Mokhtabar Laboratories", classification="B", specialties="Testing & Quality", phone="+20 100 000 0102", status="active"),
        ]
        db.add_all(contractors)
        await db.commit()
        print(f"Seeded {len(contractors)} contractors")

        # ── 5. Projects ──
        projects_data = [
            Project(code="PRJ001", name="Galala City Development", location="Galala, Red Sea", project_type="infrastructure", client_name="Engineering Authority of Armed Forces", consultant_name="Dar Al-Handasah", project_manager="Ahmed Hassan", start_date=date(2018, 3, 1), end_date_planned=date(2020, 12, 31), end_date_actual=date(2020, 11, 15), status="completed", budget_estimated=Decimal("90000000"), budget_actual=Decimal("85000000"), notes="Tourism city with 2400km walkway overlooking the sea"),
            Project(code="PRJ002", name="New Suez Canal Project", location="Suez Canal, Ismailia", project_type="infrastructure", client_name="Engineering Authority of Armed Forces", project_manager="Ahmed Hassan", start_date=date(2014, 8, 1), end_date_planned=date(2015, 8, 6), end_date_actual=date(2015, 8, 6), status="completed", budget_estimated=Decimal("90000000"), budget_actual=Decimal("88000000"), notes="72km waterway parallel to existing canal"),
            Project(code="PRJ003", name="Suez Canal Coating Works", location="Suez Canal, Ismailia", project_type="infrastructure", client_name="Suez Canal Authority", project_manager="Mohamed Ali", start_date=date(2018, 1, 1), end_date_planned=date(2019, 6, 30), end_date_actual=date(2019, 5, 15), status="completed", budget_estimated=Decimal("45000000"), budget_actual=Decimal("42000000"), notes="Geotextile + dolomite rubble coatings"),
            Project(code="PRJ004", name="Katameya Sokhna Road", location="Suez, Egypt", project_type="road", client_name="Watanya Company For Roads", consultant_name="Systra Egypt", project_manager="Ahmed Hassan", start_date=date(2014, 1, 1), end_date_planned=date(2015, 12, 31), end_date_actual=date(2015, 10, 30), status="completed", budget_estimated=Decimal("58000000"), budget_actual=Decimal("55000000"), notes="7.11km, 5 lanes + bicycle lane"),
            Project(code="PRJ005", name="International Hockey Stadium - Suez Canal Authority", location="Ismailia, Egypt", project_type="building", client_name="Suez Canal Authority", project_manager="Mohamed Ali", start_date=date(2013, 1, 1), end_date_planned=date(2014, 6, 30), end_date_actual=date(2014, 5, 15), status="completed", budget_estimated=Decimal("25000000"), budget_actual=Decimal("23000000"), notes="Stadium renovation and hockey field development"),
            Project(code="PRJ006", name="Horizon Sharm Hotel", location="Nabq Bay, Sharm El-Sheikh", project_type="building", project_manager="Ahmed Hassan", start_date=date(2013, 3, 1), end_date_planned=date(2014, 12, 31), end_date_actual=date(2014, 11, 20), status="completed", budget_estimated=Decimal("90000000"), budget_actual=Decimal("87000000"), notes="5km from Sharm El Sheikh airport"),
            Project(code="PRJ007", name="Administration Capital Roads", location="New Administrative Capital", project_type="road", client_name="ACUD", consultant_name="Dar Al-Handasah", project_manager="Ahmed Hassan", start_date=date(2016, 1, 1), end_date_planned=date(2020, 12, 31), end_date_actual=date(2020, 10, 30), status="completed", budget_estimated=Decimal("400000000"), budget_actual=Decimal("380000000"), notes="10 sectors including Diplomatic Quarter, People's Square"),
            Project(code="PRJ008", name="El Galala Road", location="Galala, Red Sea", project_type="road", client_name="Engineering Authority of Armed Forces", project_manager="Mohamed Ali", start_date=date(2018, 6, 1), end_date_planned=date(2020, 6, 30), end_date_actual=date(2020, 4, 15), status="completed", budget_estimated=Decimal("80000000"), budget_actual=Decimal("75000000"), notes="One of the most difficult roads implemented in Egypt"),
            Project(code="PRJ009", name="Sokhna Port - Marine Berth Construction", location="Ain Sokhna", project_type="infrastructure", client_name="Ministry of Transport", project_manager="Ahmed Hassan", start_date=date(2019, 1, 1), end_date_planned=date(2023, 6, 30), status="inProgress", budget_estimated=Decimal("500000000"), budget_actual=Decimal("350000000"), notes="1250m long, 18m deep marine berth with diaphragm walls"),
            Project(code="PRJ010", name="High Speed Train - Section 1", location="Sokhna to El Alamein", project_type="infrastructure", client_name="Ministry of Transport", consultant_name="Siemens Mobility Egypt", project_manager="Ahmed Hassan", start_date=date(2021, 9, 1), end_date_planned=date(2025, 12, 31), status="inProgress", budget_estimated=Decimal("450000000"), budget_actual=Decimal("200000000"), notes="Egypt's first HSR line, 460km first section"),
            Project(code="PRJ011", name="Dredging of Lake Manzala", location="Lake Manzala, Port Said", project_type="infrastructure", client_name="Engineering Authority of Armed Forces", project_manager="Mohamed Ali", start_date=date(2020, 1, 1), end_date_planned=date(2023, 12, 31), status="inProgress", budget_estimated=Decimal("120000000"), budget_actual=Decimal("80000000"), notes="Developing lake efficiency for fish wealth"),
            Project(code="PRJ012", name="Fish Farms Development", location="East Port Said", project_type="infrastructure", client_name="Engineering Authority of Armed Forces", project_manager="Ahmed Hassan", start_date=date(2021, 3, 1), end_date_planned=date(2024, 6, 30), status="inProgress", budget_estimated=Decimal("420000000"), budget_actual=Decimal("250000000"), notes="4,541 ponds across 7,500 acres"),
            Project(code="PRJ013", name="June 30 Axis Development", location="Suez to Ismailia", project_type="road", client_name="Engineering Authority of Armed Forces", project_manager="Mohamed Ali", start_date=date(2019, 1, 1), end_date_planned=date(2021, 12, 31), end_date_actual=date(2021, 10, 30), status="completed", budget_estimated=Decimal("170000000"), budget_actual=Decimal("160000000"), notes="Saad El-Shazly axis extension"),
            Project(code="PRJ014", name="Dredging of Lake Marriot", location="Alexandria", project_type="infrastructure", client_name="Engineering Authority of Armed Forces", project_manager="Mohamed Ali", start_date=date(2021, 6, 1), end_date_planned=date(2023, 6, 30), status="inProgress", budget_estimated=Decimal("95000000"), budget_actual=Decimal("45000000"), notes="Deepening lake from 30cm to ~3 meters"),
            Project(code="PRJ015", name="East of Ismailia City Roads", location="Ismailia", project_type="road", client_name="Ministry of Housing", project_manager="Ahmed Hassan", start_date=date(2022, 1, 1), end_date_planned=date(2022, 12, 31), status="completed", budget_estimated=Decimal("28000000"), budget_actual=Decimal("26000000"), notes="New city development roads"),
        ]
        db.add_all(projects_data)
        await db.commit()
        print(f"Seeded {len(projects_data)} projects")
        p = {prj.code: prj for prj in projects_data}

        # ── 6. Project Phases ──
        phases = []
        for prj_code, phase_list in {
            "PRJ001": [("Design & Planning", 1, date(2018,3,1), date(2018,6,30), date(2018,6,15), date(2018,6,15), 100, "completed"),
                       ("Site Preparation", 2, date(2018,7,1), date(2018,10,31), date(2018,7,15), date(2018,10,20), 100, "completed"),
                       ("Infrastructure Works", 3, date(2018,11,1), date(2019,12,31), date(2018,11,15), date(2019,12,15), 100, "completed"),
                       ("Road Construction", 4, date(2020,1,1), date(2020,8,31), date(2020,1,10), date(2020,8,20), 100, "completed"),
                       ("Finishing & Handover", 5, date(2020,9,1), date(2020,12,31), date(2020,9,15), date(2020,11,15), 100, "completed")],
            "PRJ009": [("Design & Engineering", 1, date(2019,1,1), date(2019,6,30), date(2019,1,15), date(2019,6,20), 100, "completed"),
                       ("Diaphragm Wall Construction", 2, date(2019,7,1), date(2020,12,31), date(2019,7,15), None, 100, "completed"),
                       ("Berth Construction", 3, date(2021,1,1), date(2022,6,30), date(2021,2,1), None, 75, "inProgress"),
                       ("Backfilling & Finishing", 4, date(2022,7,1), date(2023,6,30), None, None, 30, "inProgress")],
            "PRJ010": [("Route Survey & Design", 1, date(2021,9,1), date(2022,6,30), date(2021,10,1), date(2022,6,15), 100, "completed"),
                       ("Earthworks & Subgrade", 2, date(2022,7,1), date(2023,12,31), date(2022,8,1), None, 60, "inProgress"),
                       ("Railway Infrastructure", 3, date(2024,1,1), date(2025,6,30), None, None, 15, "inProgress"),
                       ("Systems & Signalling", 4, date(2025,1,1), date(2025,12,31), None, None, 5, "planned")],
            "PRJ007": [("Design Phase", 1, date(2016,1,1), date(2016,6,30), date(2016,1,15), date(2016,6,15), 100, "completed"),
                       ("Sector 1 - Diplomatic Quarter", 2, date(2016,7,1), date(2018,6,30), date(2016,7,15), date(2018,5,30), 100, "completed"),
                       ("Sector 2 - Residential Roads", 3, date(2017,1,1), date(2019,12,31), date(2017,2,1), date(2019,11,30), 100, "completed"),
                       ("Sector 3 - People's Square", 4, date(2018,1,1), date(2020,6,30), date(2018,2,1), date(2020,5,30), 100, "completed"),
                       ("Final Works", 5, date(2020,7,1), date(2020,12,31), date(2020,7,15), date(2020,10,30), 100, "completed")],
            "PRJ011": [("Survey & Study", 1, date(2020,1,1), date(2020,6,30), date(2020,1,15), date(2020,6,20), 100, "completed"),
                       ("Phase 1 Dredging", 2, date(2020,7,1), date(2021,12,31), date(2020,8,1), date(2021,11,30), 100, "completed"),
                       ("Phase 2 Dredging", 3, date(2022,1,1), date(2023,12,31), date(2022,2,1), None, 60, "inProgress")],
        }.items():
            for ph in phase_list:
                phases.append(ProjectPhase(project_id=p[prj_code].id, name=ph[0], order_index=ph[1], start_date_planned=ph[2], end_date_planned=ph[3], start_date_actual=ph[4], end_date_actual=ph[5], progress_percentage=ph[6], status=ph[7]))
        db.add_all(phases)
        await db.commit()
        print(f"Seeded {len(phases)} phases")

        # ── 7. Codes (WBS) for major projects ──
        codes = []
        for prj_code, code_list in {
            "PRJ001": [("G-01", 0, 1, "Galala City Development", None, None, 0, "group"),
                       ("G-01-01", 0, 2, "Site Preparation", "LS", 5000000, 1, "item"),
                       ("G-01-02", 0, 2, "Walkway Construction", "M", 2400000, 1500, "item"),
                       ("G-01-03", 0, 2, "Infrastructure Networks", "LS", 15000000, 1, "item"),
                       ("G-01-04", 0, 2, "Road Works", "M2", 85000, 350, "item"),
                       ("G-01-05", 0, 2, "Landscaping", "M2", 120000, 75, "item")],
            "PRJ007": [("R-01", 0, 1, "Administrative Capital Roads", None, None, 0, "group"),
                       ("R-01-01", 0, 2, "Diplomatic Quarter Roads", "KM", 15, 8000000, "item"),
                       ("R-01-02", 0, 2, "Eastern Connection Road", "KM", 22, 5500000, "item"),
                       ("R-01-03", 0, 2, "Ring Road Sector", "KM", 18, 6000000, "item"),
                       ("R-01-04", 0, 2, "People's Square", "M2", 50000, 1200, "item")],
            "PRJ010": [("H-01", 0, 1, "High Speed Train", None, None, 0, "group"),
                       ("H-01-01", 0, 2, "Earthworks", "M3", 2500000, 45, "item"),
                       ("H-01-02", 0, 2, "Subgrade Preparation", "KM", 460, 350000, "item"),
                       ("H-01-03", 0, 2, "Bridge Structures", "NO", 12, 5000000, "item"),
                       ("H-01-04", 0, 2, "Drainage Systems", "KM", 460, 120000, "item")],
        }.items():
            for c in code_list:
                codes.append(ProjectCode(project_id=p[prj_code].id, code=c[0], title=c[3], unit=c[4], unit_price=c[5], total_quantity=c[6], type=c[7], level=c[2]))
        # Set parent_id for children
        for c in codes:
            if c.code.count("-") > 1:
                parent_code = c.code.rsplit("-", 1)[0]
                for pc in codes:
                    if pc.code == parent_code and pc.project_id == c.project_id:
                        c.parent_id = pc.id
        db.add_all(codes)
        await db.commit()
        print(f"Seeded {len(codes)} WBS codes")

        # ── 8. Work Orders ──
        work_orders = [
            WorkOrder(project_id=p["PRJ001"].id, wo_number="WO-2020-001", title="Galala Walkway Construction", description="Construction of the main seaside walkway", priority="high", status="completed", issue_date=date(2020,1,15), due_date=date(2020,8,31), total_amount=Decimal("12000000")),
            WorkOrder(project_id=p["PRJ007"].id, wo_number="WO-2020-002", title="Diplomatic Quarter Asphalt Works", description="Asphalt paving for diplomatic quarter roads", priority="high", status="completed", issue_date=date(2018,3,1), due_date=date(2019,6,30), total_amount=Decimal("25000000")),
            WorkOrder(project_id=p["PRJ009"].id, wo_number="WO-2023-001", title="Diaphragm Wall Installation", description="Diaphragm wall construction for marine berth", priority="urgent", status="inProgress", issue_date=date(2023,1,10), due_date=date(2023,12,31), total_amount=Decimal("45000000")),
            WorkOrder(project_id=p["PRJ010"].id, wo_number="WO-2023-002", title="Earthworks - Section A", description="Earthworks for HSR Section A (Sokhna to Cairo)", priority="high", status="inProgress", issue_date=date(2023,6,1), due_date=date(2024,6,30), total_amount=Decimal("35000000")),
            WorkOrder(project_id=p["PRJ011"].id, wo_number="WO-2023-003", title="Phase 2 Dredging Operations", description="Dredging phase 2 of Lake Manzala", priority="medium", status="inProgress", issue_date=date(2023,1,1), due_date=date(2023,12,31), total_amount=Decimal("18000000")),
            WorkOrder(project_id=p["PRJ012"].id, wo_number="WO-2023-004", title="Pond Construction Sector A", description="Construction of 1,200 fish ponds", priority="high", status="inProgress", issue_date=date(2023,3,1), due_date=date(2024,3,31), total_amount=Decimal("28000000")),
            WorkOrder(project_id=p["PRJ014"].id, wo_number="WO-2023-005", title="Lake Marriot Deepening", description="Deepening works from 30cm to 3m", priority="medium", status="inProgress", issue_date=date(2023,4,1), due_date=date(2023,12,31), total_amount=Decimal("15000000")),
        ]
        db.add_all(work_orders)
        await db.commit()
        wo = work_orders
        print(f"Seeded {len(wo)} work orders")

        # ── 9. Work Order Items ──
        items = [
            WorkOrderItem(work_order_id=wo[0].id, item_code="W-001", description="RCC Walkway (6m width)", unit="M", quantity=2400, unit_price=3500, total_price=8400000, executed_quantity=2400, status="completed"),
            WorkOrderItem(work_order_id=wo[0].id, item_code="W-002", description="Safety Railings", unit="M", quantity=2400, unit_price=800, total_price=1920000, executed_quantity=2400, status="completed"),
            WorkOrderItem(work_order_id=wo[0].id, item_code="W-003", description="Lighting Poles", unit="NO", quantity=120, unit_price=15000, total_price=1800000, executed_quantity=120, status="completed"),
            WorkOrderItem(work_order_id=wo[1].id, item_code="R-001", description="Asphalt Paving 5cm", unit="M2", quantity=180000, unit_price=85, total_price=15300000, executed_quantity=180000, status="completed"),
            WorkOrderItem(work_order_id=wo[1].id, item_code="R-002", description="Base Course 20cm", unit="M2", quantity=180000, unit_price=45, total_price=8100000, executed_quantity=180000, status="completed"),
            WorkOrderItem(work_order_id=wo[2].id, item_code="D-001", description="Diaphragm Wall (1.2m width)", unit="M3", quantity=25000, unit_price=1200, total_price=30000000, executed_quantity=18500, status="completed"),
            WorkOrderItem(work_order_id=wo[2].id, item_code="D-002", description="Reinforcement Steel", unit="TON", quantity=3200, unit_price=35000, total_price=112000000, executed_quantity=2400, status="completed"),
            WorkOrderItem(work_order_id=wo[2].id, item_code="D-003", description="Concrete Capping Beam", unit="M3", quantity=4500, unit_price=1500, total_price=6750000, executed_quantity=2800, status="inProgress"),
            WorkOrderItem(work_order_id=wo[3].id, item_code="E-001", description="Earth Excavation", unit="M3", quantity=1200000, unit_price=25, total_price=30000000, executed_quantity=780000, status="inProgress"),
            WorkOrderItem(work_order_id=wo[3].id, item_code="E-002", description="Embankment Fill", unit="M3", quantity=800000, unit_price=35, total_price=28000000, executed_quantity=450000, status="inProgress"),
        ]
        db.add_all(items)
        await db.commit()
        print(f"Seeded {len(items)} work order items")

        # ── 10. Drawings ──
        drawings = [
            Drawing(project_id=p["PRJ001"].id, drawing_number="GAL-DWG-001", title="Galala Walkway Plan", discipline="Civil", scale="1:500", status="approved", current_revision=2),
            Drawing(project_id=p["PRJ001"].id, drawing_number="GAL-DWG-002", title="Galala Infrastructure Layout", discipline="Infrastructure", scale="1:200", status="approved", current_revision=1),
            Drawing(project_id=p["PRJ007"].id, drawing_number="CAP-DWG-001", title="Diplomatic Quarter Road Layout", discipline="Roads", scale="1:1000", status="approved", current_revision=3),
            Drawing(project_id=p["PRJ007"].id, drawing_number="CAP-DWG-002", title="Ring Road Cross Sections", discipline="Roads", scale="1:200", status="approved", current_revision=2),
            Drawing(project_id=p["PRJ009"].id, drawing_number="SP-DWG-001", title="Marine Berth Plan & Sections", discipline="Marine", scale="1:200", status="approved", current_revision=1),
            Drawing(project_id=p["PRJ009"].id, drawing_number="SP-DWG-002", title="Diaphragm Wall Details", discipline="Structural", scale="1:50", status="underReview", current_revision=0),
            Drawing(project_id=p["PRJ010"].id, drawing_number="HSR-DWG-001", title="Route Alignment Plan", discipline="Civil", scale="1:5000", status="approved", current_revision=1),
            Drawing(project_id=p["PRJ010"].id, drawing_number="HSR-DWG-002", title="Bridge Structure Details", discipline="Structural", scale="1:100", status="underReview", current_revision=0),
        ]
        db.add_all(drawings)
        await db.commit()
        dr = drawings
        print(f"Seeded {len(dr)} drawings")

        # ── 11. Drawing Revisions ──
        revisions = [
            DrawingRevision(drawing_id=dr[0].id, revision_number=1, description="Initial issue", status="approved", approved_by="Ahmed Hassan", approved_date=date(2019,6,15)),
            DrawingRevision(drawing_id=dr[0].id, revision_number=2, description="Minor alignment adjustment", status="approved", approved_by="Ahmed Hassan", approved_date=date(2019,8,20)),
            DrawingRevision(drawing_id=dr[2].id, revision_number=1, description="Initial submission", status="approved", approved_by="Mohamed Ali", approved_date=date(2017,3,1)),
            DrawingRevision(drawing_id=dr[2].id, revision_number=2, description="Updated to reflect revised junction", status="approved", approved_by="Mohamed Ali", approved_date=date(2017,9,15)),
            DrawingRevision(drawing_id=dr[2].id, revision_number=3, description="Final as-built adjustments", status="approved", approved_by="Mohamed Ali", approved_date=date(2018,6,30)),
        ]
        db.add_all(revisions)
        await db.commit()
        print(f"Seeded {len(revisions)} drawing revisions")

        # ── 12. Documents ──
        docs = [
            Document(project_id=p["PRJ001"].id, doc_number="GAL-COR-001", title="Contract Agreement - Galala City", type="contract", direction="outgoing", related_party="Engineering Authority", issue_date=date(2018,2,15), status="final", tags="contract,galala"),
            Document(project_id=p["PRJ002"].id, doc_number="SUE-COR-001", title="Suez Canal Project Award Letter", type="correspondence", direction="incoming", related_party="Engineering Authority", issue_date=date(2014,7,15), status="final", tags="award,suez"),
            Document(project_id=p["PRJ009"].id, doc_number="SP-COR-003", title="Monthly Progress Report - June 2023", type="report", direction="outgoing", related_party="Ministry of Transport", issue_date=date(2023,7,5), status="final", tags="report,monthly"),
            Document(project_id=p["PRJ010"].id, doc_number="HSR-COR-001", title="HSR Section 1 - Notice to Proceed", type="correspondence", direction="incoming", related_party="Ministry of Transport", issue_date=date(2021,9,1), status="final", tags="ntp,hsr"),
            Document(project_id=p["PRJ011"].id, doc_number="LM-COR-002", title="Lake Manzala Dredging Permit", type="permit", direction="incoming", related_party="EEAA", issue_date=date(2020,2,1), status="final", tags="permit,environment"),
            Document(project_id=p["PRJ012"].id, doc_number="FF-COR-001", title="Fish Farms BOQ Revision", type="boq", direction="outgoing", related_party="Engineering Authority", issue_date=date(2021,6,15), status="final", tags="boq,fish-farms"),
        ]
        db.add_all(docs)
        await db.commit()
        print(f"Seeded {len(docs)} documents")

        # ── 13. Payment Certificates ──
        certs = [
            PaymentCertificate(project_id=p["PRJ001"].id, certificate_number="PC-GAL-001", period_from=date(2020,1,1), period_to=date(2020,3,31), issue_date=date(2020,4,15), previous_total=0, current_works=Decimal("12000000"), materials_on_site=Decimal("2000000"), insurance_percent=Decimal("5"), advance_repayment=0, net_amount=Decimal("13300000"), retention_percent=Decimal("5"), retention_amount=Decimal("665000"), amount_due=Decimal("12635000"), status="paid", payment_date=date(2020,5,10)),
            PaymentCertificate(project_id=p["PRJ001"].id, certificate_number="PC-GAL-002", period_from=date(2020,4,1), period_to=date(2020,6,30), issue_date=date(2020,7,15), previous_total=Decimal("12000000"), current_works=Decimal("15000000"), materials_on_site=Decimal("1500000"), insurance_percent=Decimal("5"), advance_repayment=0, net_amount=Decimal("27675000"), retention_percent=Decimal("5"), retention_amount=Decimal("1383750"), amount_due=Decimal("26291250"), status="paid", payment_date=date(2020,8,10)),
            PaymentCertificate(project_id=p["PRJ001"].id, certificate_number="PC-GAL-003", period_from=date(2020,7,1), period_to=date(2020,10,31), issue_date=date(2020,11,15), previous_total=Decimal("27000000"), current_works=Decimal("18000000"), materials_on_site=Decimal("1000000"), insurance_percent=Decimal("5"), advance_repayment=0, net_amount=Decimal("46000000"), retention_percent=Decimal("5"), retention_amount=Decimal("2300000"), amount_due=Decimal("43700000"), status="approved"),
            PaymentCertificate(project_id=p["PRJ007"].id, certificate_number="PC-CAP-001", period_from=date(2018,1,1), period_to=date(2018,6,30), issue_date=date(2018,7,15), previous_total=0, current_works=Decimal("25000000"), materials_on_site=Decimal("5000000"), insurance_percent=Decimal("5"), advance_repayment=0, net_amount=Decimal("30000000"), retention_percent=Decimal("5"), retention_amount=Decimal("1500000"), amount_due=Decimal("28500000"), status="paid", payment_date=date(2018,8,20)),
            PaymentCertificate(project_id=p["PRJ009"].id, certificate_number="PC-SP-001", period_from=date(2023,1,1), period_to=date(2023,6,30), issue_date=date(2023,7,15), previous_total=Decimal("80000000"), current_works=Decimal("15000000"), materials_on_site=Decimal("3000000"), insurance_percent=Decimal("5"), advance_repayment=Decimal("5000000"), net_amount=Decimal("93000000"), retention_percent=Decimal("5"), retention_amount=Decimal("4650000"), amount_due=Decimal("88350000"), status="under_review"),
        ]
        db.add_all(certs)
        await db.commit()
        print(f"Seeded {len(certs)} payment certificates")

        # ── 14. Contracts ──
        contracts = [
            Contract(project_id=p["PRJ001"].id, contract_number="CTR-GAL-001", contract_type="main", party_a="Negida Contracting Co.", party_b="Engineering Authority", sign_date=date(2018,2,15), value=Decimal("90000000"), duration_months=34, retention_percent=Decimal("5"), advance_payment_percent=Decimal("10"), status="final"),
            Contract(project_id=p["PRJ009"].id, contract_number="CTR-SP-001", contract_type="main", party_a="Negida Contracting Co.", party_b="Ministry of Transport", sign_date=date(2019,1,10), value=Decimal("500000000"), duration_months=54, retention_percent=Decimal("5"), advance_payment_percent=Decimal("15"), status="active"),
            Contract(project_id=p["PRJ010"].id, contract_number="CTR-HSR-001", contract_type="subcontract", party_a="Negida Contracting Co.", party_b="Siemens Mobility/Systra Consortium", sign_date=date(2021,9,1), value=Decimal("450000000"), duration_months=52, retention_percent=Decimal("5"), advance_payment_percent=Decimal("15"), status="active"),
            Contract(project_id=p["PRJ007"].id, contract_number="CTR-CAP-001", contract_type="main", party_a="Negida Contracting Co.", party_b="ACUD", sign_date=date(2016,1,15), value=Decimal("400000000"), duration_months=60, retention_percent=Decimal("5"), advance_payment_percent=Decimal("10"), status="final"),
            Contract(project_id=p["PRJ011"].id, contract_number="CTR-LM-001", contract_type="main", party_a="Negida Contracting Co.", party_b="Engineering Authority", sign_date=date(2020,1,5), value=Decimal("120000000"), duration_months=48, retention_percent=Decimal("5"), advance_payment_percent=Decimal("10"), status="active"),
        ]
        db.add_all(contracts)
        await db.commit()
        ctr = contracts
        print(f"Seeded {len(ctr)} contracts")

        # ── 15. BOQ Items ──
        boq_items = [
            # Galala BOQ
            BOQItem(project_id=p["PRJ001"].id, item_code="G-01", description="Galala City - Civil Works", unit="LS", quantity=Decimal("1"), unit_price=Decimal("50000000"), total_price=Decimal("50000000"), is_group=True),
            BOQItem(project_id=p["PRJ001"].id, item_code="G-01-01", description="Site Clearance & Earthworks", unit="M3", quantity=Decimal("500000"), unit_price=Decimal("35"), total_price=Decimal("17500000"), category="Earthworks"),
            BOQItem(project_id=p["PRJ001"].id, item_code="G-01-02", description="Concrete Walkway 6m", unit="M", quantity=Decimal("2400"), unit_price=Decimal("3500"), total_price=Decimal("8400000"), category="Concrete"),
            BOQItem(project_id=p["PRJ001"].id, item_code="G-02", description="Infrastructure", unit="LS", quantity=Decimal("1"), unit_price=Decimal("40000000"), total_price=Decimal("40000000"), is_group=True),
            BOQItem(project_id=p["PRJ001"].id, item_code="G-02-01", description="Water Supply Network", unit="M", quantity=Decimal("15000"), unit_price=Decimal("550"), total_price=Decimal("8250000"), category="Infrastructure"),
            BOQItem(project_id=p["PRJ001"].id, item_code="G-02-02", description="Sewer Network", unit="M", quantity=Decimal("12000"), unit_price=Decimal("800"), total_price=Decimal("9600000"), category="Infrastructure"),
            # Fish Farms BOQ
            BOQItem(project_id=p["PRJ012"].id, item_code="FF-01", description="Fish Ponds Construction", unit="LS", quantity=Decimal("1"), unit_price=Decimal("420000000"), total_price=Decimal("420000000"), is_group=True),
            BOQItem(project_id=p["PRJ012"].id, item_code="FF-01-01", description="Pond Excavation", unit="M3", quantity=Decimal("1200000"), unit_price=Decimal("45"), total_price=Decimal("54000000"), category="Earthworks"),
            BOQItem(project_id=p["PRJ012"].id, item_code="FF-01-02", description="Lining Works", unit="M2", quantity=Decimal("800000"), unit_price=Decimal("120"), total_price=Decimal("96000000"), category="Lining"),
            BOQItem(project_id=p["PRJ012"].id, item_code="FF-01-03", description="Water Supply System", unit="LS", quantity=Decimal("1"), unit_price=Decimal("25000000"), total_price=Decimal("25000000"), category="Infrastructure"),
        ]
        db.add_all(boq_items)
        await db.commit()
        bi = boq_items
        # Set parent_id for children
        for i in bi:
            if i.item_code.count("-") > 1:
                parent_code = i.item_code.rsplit("-", 1)[0]
                for pbi in bi:
                    if pbi.item_code == parent_code and pbi.project_id == i.project_id:
                        i.parent_id = pbi.id
                        break
        await db.commit()
        print(f"Seeded {len(bi)} BOQ items")

        # ── 16. IPC Headers ──
        ipcs = [
            IPCHeader(project_id=p["PRJ001"].id, contract_id=ctr[0].id, ipc_number="IPC-GAL-001", ipc_period=1, start_date=date(2020,1,1), end_date=date(2020,3,31), status="paid", total_amount=Decimal("12000000"), retention_amount=Decimal("600000"), advance_recovery=Decimal("0"), net_amount=Decimal("11400000")),
            IPCHeader(project_id=p["PRJ001"].id, contract_id=ctr[0].id, ipc_number="IPC-GAL-002", ipc_period=2, start_date=date(2020,4,1), end_date=date(2020,6,30), status="paid", total_amount=Decimal("15000000"), retention_amount=Decimal("750000"), advance_recovery=Decimal("0"), net_amount=Decimal("14250000")),
            IPCHeader(project_id=p["PRJ001"].id, contract_id=ctr[0].id, ipc_number="IPC-GAL-003", ipc_period=3, start_date=date(2020,7,1), end_date=date(2020,10,31), status="approved", total_amount=Decimal("18000000"), retention_amount=Decimal("900000"), advance_recovery=Decimal("0"), net_amount=Decimal("17100000")),
            IPCHeader(project_id=p["PRJ009"].id, contract_id=ctr[1].id, ipc_number="IPC-SP-001", ipc_period=1, start_date=date(2023,1,1), end_date=date(2023,6,30), status="under_review", total_amount=Decimal("15000000"), retention_amount=Decimal("750000"), advance_recovery=Decimal("5000000"), net_amount=Decimal("9250000")),
        ]
        db.add_all(ipcs)
        await db.commit()
        print(f"Seeded {len(ipcs)} IPC headers")

        # ── 17. IPC Details ──
        ipc_details = [
            IPCDetail(ipc_id=ipcs[0].id, boq_item_id=bi[1].id, boq_item_code=bi[1].item_code, boq_item_description=bi[1].description, boq_item_unit=bi[1].unit, previous_quantity=Decimal("0"), current_quantity=Decimal("50000"), cumulative_quantity=Decimal("50000"), percentage=Decimal("10"), amount=Decimal("1750000")),
            IPCDetail(ipc_id=ipcs[0].id, boq_item_id=bi[2].id, boq_item_code=bi[2].item_code, boq_item_description=bi[2].description, boq_item_unit=bi[2].unit, previous_quantity=Decimal("0"), current_quantity=Decimal("2400"), cumulative_quantity=Decimal("2400"), percentage=Decimal("100"), amount=Decimal("8400000")),
            IPCDetail(ipc_id=ipcs[1].id, boq_item_id=bi[1].id, boq_item_code=bi[1].item_code, boq_item_description=bi[1].description, boq_item_unit=bi[1].unit, previous_quantity=Decimal("50000"), current_quantity=Decimal("150000"), cumulative_quantity=Decimal("200000"), percentage=Decimal("40"), amount=Decimal("5250000")),
            IPCDetail(ipc_id=ipcs[2].id, boq_item_id=bi[1].id, boq_item_code=bi[1].item_code, boq_item_description=bi[1].description, boq_item_unit=bi[1].unit, previous_quantity=Decimal("200000"), current_quantity=Decimal("200000"), cumulative_quantity=Decimal("400000"), percentage=Decimal("80"), amount=Decimal("7000000")),
        ]
        db.add_all(ipc_details)
        await db.commit()
        print(f"Seeded {len(ipc_details)} IPC details")

        # ── 18. Daily Reports ──
        daily_reports = []
        for prj_code in ["PRJ001", "PRJ009", "PRJ010", "PRJ011", "PRJ012"]:
            for i in range(5):
                d = date(2023, 6, 15 + i)
                daily_reports.append(DailyReport(
                    project_id=p[prj_code].id, report_date=d,
                    weather="Sunny", manpower_count=45 + i * 5,
                    equipment_count=12 + i * 2,
                    work_description=f"Routine works day {i+1}" if i < 3 else f"Critical path activity - day {i+1}",
                    issues="None" if i != 2 else "Minor delay due to material delivery",
                    created_by="Hossam El-Din" if i % 2 == 0 else "Mohamed Ali",
                ))
        db.add_all(daily_reports)
        await db.commit()
        print(f"Seeded {len(daily_reports)} daily reports")

        # ── 19. Subcontractors ──
        subs = [
            Subcontractor(project_id=p["PRJ009"].id, name="Egyptian Marine Works Co.", trade="Marine Works", contract_value=Decimal("45000000"), status="active"),
            Subcontractor(project_id=p["PRJ009"].id, name="Cairo Reinforcement Co.", trade="Steel Fixing", contract_value=Decimal("18000000"), status="active"),
            Subcontractor(project_id=p["PRJ010"].id, name="Upper Egypt Earthmoving", trade="Earthworks", contract_value=Decimal("35000000"), status="active"),
            Subcontractor(project_id=p["PRJ010"].id, name="Nile Bridge Construction", trade="Bridge Works", contract_value=Decimal("28000000"), status="active"),
            Subcontractor(project_id=p["PRJ012"].id, name="Port Said Engineering", trade="Excavation", contract_value=Decimal("22000000"), status="active"),
            Subcontractor(project_id=p["PRJ011"].id, name="Delta Dredging Co.", trade="Dredging", contract_value=Decimal("35000000"), status="active"),
        ]
        db.add_all(subs)
        await db.commit()
        print(f"Seeded {len(subs)} subcontractors")

        # ── 20. Schedules ──
        schedules = [
            Schedule(project_id=p["PRJ009"].id, task_name="Sokhna Port Construction", start_date=date(2019,1,1), end_date=date(2023,6,30), duration_days=1642, progress_percent=Decimal("75"), status="inProgress", responsible="Ahmed Hassan"),
            Schedule(project_id=p["PRJ009"].id, task_name="Diaphragm Walls", start_date=date(2019,7,1), end_date=date(2020,12,31), duration_days=549, progress_percent=Decimal("100"), status="completed", responsible="Mohamed Ali"),
            Schedule(project_id=p["PRJ009"].id, task_name="Berth Construction", start_date=date(2021,1,1), end_date=date(2022,6,30), duration_days=546, progress_percent=Decimal("75"), status="inProgress", responsible="Hossam El-Din"),
            Schedule(project_id=p["PRJ009"].id, task_name="Backfilling & Finishing", start_date=date(2022,7,1), end_date=date(2023,6,30), duration_days=365, progress_percent=Decimal("30"), status="inProgress", responsible="Hossam El-Din"),
            Schedule(project_id=p["PRJ010"].id, task_name="HSR Section 1", start_date=date(2021,9,1), end_date=date(2025,12,31), duration_days=1582, progress_percent=Decimal("35"), status="inProgress", responsible="Ahmed Hassan"),
            Schedule(project_id=p["PRJ010"].id, task_name="Earthworks", start_date=date(2022,7,1), end_date=date(2023,12,31), duration_days=549, progress_percent=Decimal("60"), status="inProgress", responsible="Mohamed Ali"),
            Schedule(project_id=p["PRJ010"].id, task_name="Bridge Structures", start_date=date(2024,1,1), end_date=date(2025,6,30), duration_days=547, progress_percent=Decimal("15"), status="inProgress", responsible="Tamer Sherif"),
        ]
        db.add_all(schedules)
        await db.commit()
        print(f"Seeded {len(schedules)} schedule tasks")

        # ── 21. Notifications ──
        notifications = [
            Notification(user_id=1, title="Payment Certificate Approved", message="PC-GAL-003 has been approved", notification_type="success", is_read=False, link="/engineering/payment-certificates"),
            Notification(user_id=1, title="HSR Progress Update", message="HSR earthworks reached 60%", notification_type="info", is_read=False, link="/engineering/projects"),
            Notification(user_id=1, title="New IPC Ready", message="IPC-SP-001 is ready for review", notification_type="warning", is_read=False, link="/engineering/ipc"),
            Notification(user_id=1, title="Safety Report Due", message="Monthly HSE report for Sokhna Port is due", notification_type="info", is_read=False, link="/engineering/daily-reports"),
        ]
        db.add_all(notifications)
        await db.commit()
        print(f"Seeded {len(notifications)} notifications")

        print("\n=== DEMO DATA SEED COMPLETE ===")
        print("Users: admin/admin123, engineer/eng123, viewer/view123")
        print(f"Projects: {len(projects_data)}, Contractors: {len(contractors)}, Employees: {len(employees)}")
        print(f"Phases: {len(phases)}, Work Orders: {len(wo)}, Schedules: {len(schedules)}")

asyncio.run(seed())
