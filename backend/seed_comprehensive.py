"""
Seed Comprehensive — Engineering Management System Demo Data
ينشئ بيانات تجريبية واقعية لموديول إدارة المشاريع الهندسية
"""
import asyncio, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from sqlmodel import Session, SQLModel
from modules.engineering.database import sync_engine
from modules.engineering.models.project_models import (
    Project, Contract, BOQItem, IPCHeader, IPCDetail,
    Drawing, DailyReport, Subcontractor, Schedule, Document
)

from sqlalchemy import select, text
from app.database import engine as async_engine, async_session
from app.core.base import Base
from app.auth.utils import hash_password
from app.auth.models import User
from app.contractors.models import Contractor
from app.projects.models import Project as LegacyProject
from app.phases.models import ProjectPhase
from app.codes.models import ProjectCode
from app.work_orders.models import WorkOrder
from app.work_order_items.models import WorkOrderItem
from app.drawings.models import Drawing as LegacyDrawing
from app.drawing_revisions.models import DrawingRevision
from app.documents.models import Document as LegacyDocument
from app.payment_certificates.models import PaymentCertificate


# ─────────────── Data ───────────────

PROJECTS = [
    {
        "code": "PRJ-EN-001",
        "name": "مشروع تطوير حي النزهة السكني",
        "description": "تطوير شامل لحي النزهة يشمل إنشاء 12 مبنى سكني تجاري ومرافق عامة ومساحات خضراء ومواقف سيارات",
        "project_type": "building",
        "status": "active",
        "start_date": date(2025, 3, 1),
        "planned_end_date": date(2027, 6, 30),
        "contract_value": Decimal("50000000.00"),
        "currency": "EGP",
        "location": "حي النزهة - القاهرة الجديدة",
        "engineer_in_charge": "م. أحمد السيد",
    },
    {
        "code": "PRJ-EN-002",
        "name": "مشروع إنشاء كوبري الحرية",
        "description": "إنشاء كوبري علوي يربط بين منطقتي وسط البلد والمنيل بطول 850 متر وعرض 30 متر يشمل 6 حارات مرورية",
        "project_type": "bridge",
        "status": "active",
        "start_date": date(2025, 1, 15),
        "planned_end_date": date(2027, 3, 30),
        "contract_value": Decimal("80000000.00"),
        "currency": "EGP",
        "location": " وسط البلد - القاهرة",
        "engineer_in_charge": "م. خالد عبدالله",
    },
    {
        "code": "PRJ-EN-003",
        "name": "مشروع شبكة مياه الشرب بالغربية",
        "description": "تنفيذ شبكات مياه شرب بطول 45 كم للمراكز والقرى بمحافظة الغربية تشمل خطوط ناقلة ومحطات رفع وخزانات أرضية",
        "project_type": "infrastructure",
        "status": "active",
        "start_date": date(2024, 9, 1),
        "planned_end_date": date(2026, 12, 31),
        "contract_value": Decimal("30000000.00"),
        "currency": "EGP",
        "location": "محافظة الغربية",
        "engineer_in_charge": "م. سارة محمد",
    },
    {
        "code": "PRJ-EN-004",
        "name": "مشروع إنشاء مصنع بلاستيك",
        "description": "إنشاء مصنع لإنتاج المنتجات البلاستيكية على مساحة 25 ألف متر مربع يشمل مباني إدارية وصناعية ومستودعات",
        "project_type": "industrial",
        "status": "planning",
        "start_date": date(2026, 1, 1),
        "planned_end_date": date(2028, 6, 30),
        "contract_value": Decimal("120000000.00"),
        "currency": "EGP",
        "location": "المنطقة الصناعية - العاشر من رمضان",
        "engineer_in_charge": "م. عمرو حسين",
    },
    {
        "code": "PRJ-EN-005",
        "name": "مشروع طريق القاهرة الإسكندرية الصحراوي",
        "description": "تطوير وتوسعة طريق القاهرة الإسكندرية الصحراوي بطول 220 كم ليشمل 4 حارات إضافية وإنار كاملة ونقاط إسعاف",
        "project_type": "road",
        "status": "active",
        "start_date": date(2025, 6, 1),
        "planned_end_date": date(2028, 5, 31),
        "contract_value": Decimal("200000000.00"),
        "currency": "EGP",
        "location": "القاهرة - الإسكندرية",
        "engineer_in_charge": "م. محمد علي",
    },
]

CONTRACTS_DATA = [
    # Project 1 - contracts
    {"project_idx": 0, "contract_number": "CON-MN-001", "contract_type": "main", "party_a": "وزارة الإسكان", "party_b": "شركة المقاولون العرب", "sign_date": date(2025, 2, 15), "value": Decimal("50000000.00"), "duration_months": 28, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("15.00"), "status": "active"},
    {"project_idx": 0, "contract_number": "CON-SB-001", "contract_type": "subcontract", "party_a": "شركة المقاولون العرب", "party_b": "مؤسسة الأعمال الكهربائية", "sign_date": date(2025, 3, 1), "value": Decimal("5000000.00"), "duration_months": 18, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("10.00"), "status": "active"},
    # Project 2 - contracts
    {"project_idx": 1, "contract_number": "CON-MN-002", "contract_type": "main", "party_a": "محافظة القاهرة", "party_b": "شركة أوراسكوم للإنشاءات", "sign_date": date(2025, 1, 1), "value": Decimal("80000000.00"), "duration_months": 26, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("20.00"), "status": "active"},
    {"project_idx": 1, "contract_number": "CON-SB-002", "contract_type": "subcontract", "party_a": "شركة أوراسكوم للإنشاءات", "party_b": "شركة الصلب المصرية", "sign_date": date(2025, 1, 20), "value": Decimal("15000000.00"), "duration_months": 20, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("10.00"), "status": "active"},
    # Project 3 - contracts
    {"project_idx": 2, "contract_number": "CON-MN-003", "contract_type": "main", "party_a": "شركة مياه الشرب بالغربية", "party_b": "شركة حسن علام", "sign_date": date(2024, 8, 15), "value": Decimal("30000000.00"), "duration_months": 28, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("15.00"), "status": "active"},
    {"project_idx": 2, "contract_number": "CON-SB-003", "contract_type": "subcontract", "party_a": "شركة حسن علام", "party_b": "مؤسسة الحفر الحديثة", "sign_date": date(2024, 9, 1), "value": Decimal("6000000.00"), "duration_months": 16, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("10.00"), "status": "active"},
    # Project 4 - contracts
    {"project_idx": 3, "contract_number": "CON-MN-004", "contract_type": "main", "party_a": "شركة البلاستيك الوطنية", "party_b": "شركة بتروجت", "sign_date": date(2025, 12, 1), "value": Decimal("120000000.00"), "duration_months": 30, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("20.00"), "status": "draft"},
    # Project 5 - contracts
    {"project_idx": 4, "contract_number": "CON-MN-005", "contract_type": "main", "party_a": "وزارة النقل", "party_b": "شركة المقاولون العرب", "sign_date": date(2025, 5, 15), "value": Decimal("200000000.00"), "duration_months": 36, "retention_percent": Decimal("5.00"), "advance_payment_percent": Decimal("15.00"), "status": "active"},
]

BOQ_GROUPS = {
    # Project 1: مشروع تطوير حي النزهة السكني
    0: [
        ("01", "أعمال الحفر والردم", None),
        ("02", "أعمال الخرسانة المسلحة", None),
        ("03", "أعمال المباني", None),
        ("04", "أعمال التشطيب", None),
    ],
    # Project 2: كوبري الحرية
    1: [
        ("01", "أعمال الأساسات", None),
        ("02", "الأعمال الخرسانية للكوبري", None),
        ("03", "أعمال الطرق والرصف", None),
    ],
    # Project 3: شبكة مياه الشرب
    2: [
        ("01", "أعمال الحفر والمد", None),
        ("02", "محطات الرفع", None),
        ("03", "الخزانات", None),
    ],
    # Project 4: مصنع بلاستيك
    3: [
        ("01", "أعمال الحفر والأساسات", None),
        ("02", "الهيكل الخرساني", None),
        ("03", "الهيكل المعدني", None),
    ],
    # Project 5: طريق القاهرة الإسكندرية
    4: [
        ("01", "أعمال الرفع المساحي والحفر", None),
        ("02", "طبقات الرصف", None),
        ("03", "أعمال السلامة والإشارات", None),
    ],
}

BOQ_ITEMS = {
    # Project 1 items
    0: [
        ("01.01", "حفر عادي", "م³", Decimal("15000"), Decimal("45.50"), "group_01"),
        ("01.02", "حفر صخري", "م³", Decimal("5000"), Decimal("120.00"), "group_01"),
        ("01.03", "ردم وتشغيل", "م³", Decimal("12000"), Decimal("35.00"), "group_01"),
        ("02.01", "خرسانة مسلحة للأساسات", "م³", Decimal("4500"), Decimal("950.00"), "group_02"),
        ("02.02", "خرسانة مسلحة للأعمدة", "م³", Decimal("3500"), Decimal("1100.00"), "group_02"),
        ("02.03", "خرسانة مسلحة للأسقف", "م³", Decimal("6000"), Decimal("1050.00"), "group_02"),
        ("02.04", "حديد تسليح", "طن", Decimal("1200"), Decimal("18000.00"), "group_02"),
        ("03.01", "طوب طفلي 25 سم", "م²", Decimal("8500"), Decimal("180.00"), "group_03"),
        ("03.02", "طوب أسمنتي مفرغ", "م²", Decimal("3000"), Decimal("220.00"), "group_03"),
        ("04.01", "محارة داخلية", "م²", Decimal("22000"), Decimal("85.00"), "group_04"),
        ("04.02", "دهانات أكريليك", "م²", Decimal("22000"), Decimal("65.00"), "group_04"),
        ("04.03", "سيراميك أرضيات", "م²", Decimal("8000"), Decimal("250.00"), "group_04"),
        ("04.04", "سيراميك حوائط", "م²", Decimal("6000"), Decimal("220.00"), "group_04"),
        ("04.05", "أبواب خشب موسكي", "باب", Decimal("450"), Decimal("3500.00"), "group_04"),
        ("04.06", "شبابيك ألمونيوم", "شباك", Decimal("600"), Decimal("2800.00"), "group_04"),
    ],
    # Project 2 items
    1: [
        ("01.01", "جسات تربة وتحليل", "جسة", Decimal("30"), Decimal("15000.00"), "group_01"),
        ("01.02", "خوازيق خرسانية قطر 1.2 م", "م", Decimal("1200"), Decimal("3200.00"), "group_01"),
        ("01.03", "قواعد خرسانية مسلحة", "م³", Decimal("3000"), Decimal("1200.00"), "group_01"),
        ("02.01", "خرسانة مسلحة للأعمدة الرئيسية", "م³", Decimal("4500"), Decimal("1500.00"), "group_02"),
        ("02.02", "خرسانة مسلحة للكمرات", "م³", Decimal("3500"), Decimal("1300.00"), "group_02"),
        ("02.03", "خرسانة مسلحة لبلاطة الكوبري", "م³", Decimal("6000"), Decimal("1400.00"), "group_02"),
        ("02.04", "حديد تسليح عالي المقاومة", "طن", Decimal("2500"), Decimal("22000.00"), "group_02"),
        ("02.05", "شدات معدنية", "م²", Decimal("15000"), Decimal("250.00"), "group_02"),
        ("03.01", "طبقة أساس ممتازة", "م³", Decimal("8000"), Decimal("180.00"), "group_03"),
        ("03.02", "خلطة أسفلتية سمك 10 سم", "طن", Decimal("12000"), Decimal("950.00"), "group_03"),
        ("03.03", "طبقة أسفلتية سمك 5 سم", "طن", Decimal("6000"), Decimal("850.00"), "group_03"),
        ("03.04", "رصف بلاط إنترلوك", "م²", Decimal("3000"), Decimal("180.00"), "group_03"),
    ],
    # Project 3 items
    2: [
        ("01.01", "حفر خطوط شبكة مياه", "م³", Decimal("85000"), Decimal("35.00"), "group_01"),
        ("01.02", "مواسير حديد زهر قطر 600 مم", "م", Decimal("15000"), Decimal("2800.00"), "group_01"),
        ("01.03", "مواسير حديد زهر قطر 400 مم", "م", Decimal("20000"), Decimal("1800.00"), "group_01"),
        ("01.04", "مواسير HDPE قطر 200 مم", "م", Decimal("10000"), Decimal("650.00"), "group_01"),
        ("01.05", "محابس بوابات", "عدد", Decimal("350"), Decimal("4500.00"), "group_01"),
        ("01.06", "غرف تفتيش", "عدد", Decimal("200"), Decimal("8500.00"), "group_01"),
        ("02.01", "إنشاء محطة رفع رئيسية", "محطة", Decimal("2"), Decimal("3500000.00"), "group_02"),
        ("02.02", "مضخات غاطسة", "وحدة", Decimal("12"), Decimal("180000.00"), "group_02"),
        ("02.03", "خزان أرضي سعة 3000 م³", "خزان", Decimal("2"), Decimal("2500000.00"), "group_02"),
        ("03.01", "خزان أرضي سعة 5000 م³", "خزان", Decimal("1"), Decimal("4000000.00"), "group_03"),
        ("03.02", "خزان علوي سعة 500 م³", "خزان", Decimal("3"), Decimal("1800000.00"), "group_03"),
        ("03.03", "غرفة تحكم كهربائي", "غرفة", Decimal("5"), Decimal("350000.00"), "group_03"),
    ],
    # Project 4 items
    3: [
        ("01.01", "حفر عام", "م³", Decimal("30000"), Decimal("40.00"), "group_01"),
        ("01.02", "خوازيق خرسانية", "م", Decimal("2500"), Decimal("2800.00"), "group_01"),
        ("01.03", "قواعد خرسانية مسلحة", "م³", Decimal("5000"), Decimal("1000.00"), "group_01"),
        ("02.01", "خرسانة مسلحة للأعمدة", "م³", Decimal("4000"), Decimal("1200.00"), "group_02"),
        ("02.02", "خرسانة مسلحة للأسقف", "م³", Decimal("8000"), Decimal("1100.00"), "group_02"),
        ("02.03", "خرسانة مسلحة للجدران الستائرية", "م³", Decimal("3000"), Decimal("1300.00"), "group_02"),
        ("02.04", "حديد تسليح", "طن", Decimal("2500"), Decimal("19000.00"), "group_02"),
        ("03.01", "هيكل معدني للصالة الصناعية", "طن", Decimal("2500"), Decimal("25000.00"), "group_03"),
        ("03.02", "كسوة معادن معزولة", "م²", Decimal("15000"), Decimal("650.00"), "group_03"),
        ("03.03", "أبواب قطاعية معدنية", "باب", Decimal("20"), Decimal("45000.00"), "group_03"),
        ("03.04", "رافعة علوية 10 طن", "رافعة", Decimal("5"), Decimal("750000.00"), "group_03"),
    ],
    # Project 5 items
    4: [
        ("01.01", "رفع مساحي وتحديد مسار", "كم", Decimal("220"), Decimal("15000.00"), "group_01"),
        ("01.02", "حفر عام للطريق", "م³", Decimal("550000"), Decimal("30.00"), "group_01"),
        ("01.03", "ردم دمك", "م³", Decimal("450000"), Decimal("45.00"), "group_01"),
        ("01.04", "جسات تربة", "جسة", Decimal("150"), Decimal("12000.00"), "group_01"),
        ("02.01", "طبقة أساس ممتازة سمك 40 سم", "طن", Decimal("250000"), Decimal("160.00"), "group_02"),
        ("02.02", "طبقة أساس مساعد سمك 30 سم", "طن", Decimal("180000"), Decimal("120.00"), "group_02"),
        ("02.03", "بيتومين تمهيدي", "م²", Decimal("1056000"), Decimal("15.00"), "group_02"),
        ("02.04", "خلطة أسفلتية SMA سمك 6 سم", "طن", Decimal("180000"), Decimal("1200.00"), "group_02"),
        ("02.05", "خلطة أسفلتية سمك 5 سم", "طن", Decimal("120000"), Decimal("950.00"), "group_02"),
        ("03.01", "حواجز حماية معدنية (New Jersey)", "م", Decimal("40000"), Decimal("550.00"), "group_03"),
        ("03.02", "لافتات إرشادية وتحذيرية", "لافتة", Decimal("850"), Decimal("3500.00"), "group_03"),
        ("03.03", "العلامات الأرضية", "م²", Decimal("12000"), Decimal("250.00"), "group_03"),
        ("03.04", "أعمدة إنارة", "عمود", Decimal("3200"), Decimal("8500.00"), "group_03"),
    ],
}

SUBCONTRACTORS = {
    0: [("مؤسسة الأعمال الكهربائية", "أعمال كهربائية", Decimal("5000000.00")), 
        ("شركة الدهانات الحديثة", "دهانات", Decimal("2500000.00")),
        ("مؤسسة السيراميك الملكي", "سيراميك وأرضيات", Decimal("3000000.00"))],
    1: [("شركة الصلب المصرية", "تسليح وصهر", Decimal("15000000.00")),
        ("مؤسسة الخوازيق المتينة", "خوازيق وأساسات", Decimal("12000000.00")),
        ("شركة الأسفلت الوطني", "رصف وأسفلت", Decimal("18000000.00"))],
    2: [("مؤسسة الحفر الحديثة", "حفر ومد خطوط", Decimal("6000000.00")),
        ("شركة المضخات العربية", "مضخات ومعدات", Decimal("3000000.00")),
        ("مؤسسة التحكم الكهربائي", "لوحات كهرباء وتحكم", Decimal("2000000.00"))],
    3: [("شركة الإنشاءات المعدنية", "هيكل معدني", Decimal("50000000.00")),
        ("مؤسسة الخرسانة الجاهزة", "خرسانة جاهزة", Decimal("15000000.00")),
        ("شركة الرافعات العالمية", "رافعات ومعدات", Decimal("8000000.00"))],
    4: [("شركة الأسفلت المتطور", "أسفلت وخلاطات", Decimal("45000000.00")),
        ("مؤسسة السلامة المرورية", "إشارات وعلامات", Decimal("15000000.00")),
        ("شركة الإنارة الوطنية", "إنارة الطريق", Decimal("20000000.00"))],
}

IPC_DATA = {
    0: [
        {"ipc_number": "IPC-EN-001-01", "ipc_period": 1, "status": "paid",
         "start_date": date(2025, 3, 1), "end_date": date(2025, 5, 31),
         "items": [(0, 800), (1, 300), (2, 500)]},
        {"ipc_number": "IPC-EN-001-02", "ipc_period": 2, "status": "paid",
         "start_date": date(2025, 6, 1), "end_date": date(2025, 8, 31),
         "items": [(0, 1200), (1, 500), (3, 600)]},
        {"ipc_number": "IPC-EN-001-03", "ipc_period": 3, "status": "approved",
         "start_date": date(2025, 9, 1), "end_date": date(2025, 11, 30),
         "items": [(0, 1000), (2, 800), (3, 900), (4, 400)]},
    ],
    1: [
        {"ipc_number": "IPC-EN-002-01", "ipc_period": 1, "status": "paid",
         "start_date": date(2025, 1, 15), "end_date": date(2025, 4, 30),
         "items": [(0, 10), (1, 200)]},
        {"ipc_number": "IPC-EN-002-02", "ipc_period": 2, "status": "approved",
         "start_date": date(2025, 5, 1), "end_date": date(2025, 7, 31),
         "items": [(1, 300), (2, 500), (3, 400)]},
        {"ipc_number": "IPC-EN-002-03", "ipc_period": 3, "status": "draft",
         "start_date": date(2025, 8, 1), "end_date": date(2025, 10, 31),
         "items": [(1, 200), (2, 400), (3, 600), (4, 300)]},
        {"ipc_number": "IPC-EN-002-04", "ipc_period": 4, "status": "draft",
         "start_date": date(2025, 11, 1), "end_date": date(2026, 1, 31),
         "items": [(1, 150), (3, 500), (5, 400)]},
    ],
    2: [
        {"ipc_number": "IPC-EN-003-01", "ipc_period": 1, "status": "paid",
         "start_date": date(2024, 9, 1), "end_date": date(2024, 12, 31),
         "items": [(0, 15000), (1, 2000)]},
        {"ipc_number": "IPC-EN-003-02", "ipc_period": 2, "status": "paid",
         "start_date": date(2025, 1, 1), "end_date": date(2025, 3, 31),
         "items": [(0, 12000), (1, 3000), (2, 4000), (4, 80)]},
        {"ipc_number": "IPC-EN-003-03", "ipc_period": 3, "status": "approved",
         "start_date": date(2025, 4, 1), "end_date": date(2025, 6, 30),
         "items": [(0, 10000), (2, 3500), (3, 2500), (6, 1)]},
        {"ipc_number": "IPC-EN-003-04", "ipc_period": 4, "status": "draft",
         "start_date": date(2025, 7, 1), "end_date": date(2025, 9, 30),
         "items": [(0, 8000), (1, 2500), (5, 50), (7, 4)]},
    ],
    4: [
        {"ipc_number": "IPC-EN-005-01", "ipc_period": 1, "status": "paid",
         "start_date": date(2025, 6, 1), "end_date": date(2025, 8, 31),
         "items": [(0, 50), (1, 80000), (2, 60000)]},
        {"ipc_number": "IPC-EN-005-02", "ipc_period": 2, "status": "approved",
         "start_date": date(2025, 9, 1), "end_date": date(2025, 11, 30),
         "items": [(0, 40), (1, 100000), (2, 90000), (4, 30000)]},
        {"ipc_number": "IPC-EN-005-03", "ipc_period": 3, "status": "draft",
         "start_date": date(2025, 12, 1), "end_date": date(2026, 2, 28),
         "items": [(0, 30), (1, 70000), (4, 40000), (5, 25000)]},
    ],
}

DRAWINGS_DATA = {
    0: [
        ("ARC-001", "مخطط معماري - الدور الأرضي", "A", "architectural", "approved"),
        ("ARC-002", "مخطط معماري - المتكرر", "A", "architectural", "approved"),
        ("STR-001", "مخطط أساسات", "B", "structural", "approved"),
        ("STR-002", "مخطط أعمدة", "A", "structural", "under_review"),
        ("ELC-001", "مخطط كهرباء - إضاءة", "A", "electrical", "draft"),
    ],
    1: [
        ("CIV-001", "مخطط الموقع العام", "B", "civil", "approved"),
        ("STR-010", "مخطط الخوازيق", "A", "structural", "approved"),
        ("STR-011", "مخطط الكمرات الرئيسية", "A", "structural", "approved"),
        ("STR-012", "مخطط بلاطة الكوبري", "B", "structural", "under_review"),
        ("TRF-001", "مخطط المرور", "A", "traffic", "draft"),
    ],
    2: [
        ("CIV-020", "مخطط مسار الخطوط", "A", "civil", "approved"),
        ("CIV-021", "مخطط غرف التفتيش", "A", "civil", "approved"),
        ("MEC-001", "مخطط محطة الرفع", "B", "mechanical", "under_review"),
        ("ELC-010", "مخطط التحكم الكهربائي", "A", "electrical", "draft"),
        ("STR-020", "مخطط الخزانات الأرضية", "A", "structural", "approved"),
    ],
    3: [
        ("ARC-010", "مخطط المبنى الإداري", "A", "architectural", "draft"),
        ("STR-030", "مخطط أساسات المصنع", "A", "structural", "draft"),
        ("STR-031", "مخطط الهيكل المعدني", "A", "structural", "draft"),
        ("ARC-011", "مخطط واجهات المصنع", "A", "architectural", "draft"),
        ("ELC-020", "مخطط تغذية كهربائية", "A", "electrical", "draft"),
    ],
    4: [
        ("CIV-030", "مخطط المسار الكامل", "C", "civil", "approved"),
        ("CIV-031", "مخطط المقاطع العرضية", "B", "civil", "approved"),
        ("STR-040", "مخطط الحوائط الساندة", "A", "structural", "approved"),
        ("TRF-010", "مخطط اللوحات الإرشادية", "A", "traffic", "under_review"),
        ("ELC-030", "مخطط أعمدة الإنارة", "A", "electrical", "draft"),
    ],
}

DAILY_REPORTS = {
    0: [
        date(2025, 3, 5), date(2025, 3, 6), date(2025, 3, 7), date(2025, 3, 8), date(2025, 3, 9),
    ],
    1: [
        date(2025, 1, 20), date(2025, 1, 21), date(2025, 1, 22), date(2025, 1, 23), date(2025, 1, 24),
    ],
    2: [
        date(2024, 9, 5), date(2024, 9, 6), date(2024, 9, 7), date(2024, 9, 8), date(2024, 9, 9),
    ],
    3: [
        date(2026, 1, 5), date(2026, 1, 6), date(2026, 1, 7), date(2026, 1, 8), date(2026, 1, 9),
    ],
    4: [
        date(2025, 6, 5), date(2025, 6, 6), date(2025, 6, 7), date(2025, 6, 8), date(2025, 6, 9),
    ],
}

SCHEDULES = {
    0: [
        ("الأعمال التحضيرية", None, date(2025, 3, 1), date(2025, 3, 30), 30, 100, "completed", "م. أحمد"),
        ("أعمال الحفر", None, date(2025, 4, 1), date(2025, 5, 31), 61, 80, "in_progress", "م. خالد"),
        ("أعمال الخرسانة المسلحة", None, date(2025, 6, 1), date(2026, 2, 28), 273, 20, "in_progress", "م. سامي"),
        ("أعمال المباني", None, date(2025, 10, 1), date(2026, 5, 31), 243, 5, "not_started", "م. عمر"),
        ("أعمال التشطيب", None, date(2026, 3, 1), date(2027, 6, 30), 487, 0, "not_started", "م. علي"),
    ],
    1: [
        ("الرفع المساحي والتصميم", None, date(2025, 1, 15), date(2025, 2, 15), 31, 100, "completed", "م. هندسة"),
        ("أعمال الخوازيق", None, date(2025, 2, 16), date(2025, 5, 31), 105, 70, "in_progress", "م. أسامة"),
        ("الأعمال الخرسانية للكوبري", None, date(2025, 6, 1), date(2026, 6, 30), 395, 10, "in_progress", "م. حسام"),
        ("أعمال الرصف", None, date(2026, 1, 1), date(2026, 12, 31), 365, 0, "not_started", "م. كريم"),
        ("أعمال التشطيب النهائي", None, date(2026, 10, 1), date(2027, 3, 30), 181, 0, "not_started", "م. أحمد"),
    ],
    2: [
        ("أعمال الحفر والمد", None, date(2024, 9, 1), date(2025, 6, 30), 303, 70, "in_progress", "م. محمد"),
        ("محطات الرفع", None, date(2025, 1, 1), date(2025, 12, 31), 365, 30, "in_progress", "م. إبراهيم"),
        ("الخزانات", None, date(2025, 4, 1), date(2026, 6, 30), 456, 10, "in_progress", "م. وليد"),
        ("الاختبارات والتشغيل", None, date(2026, 1, 1), date(2026, 12, 31), 365, 0, "not_started", "م. شريف"),
        ("أعمال التسليم", None, date(2026, 10, 1), date(2026, 12, 31), 92, 0, "not_started", "م. محمد"),
    ],
    3: [
        ("أعمال التصميم التفصيلي", None, date(2026, 1, 1), date(2026, 4, 30), 120, 10, "in_progress", "م. مهندس"),
        ("أعمال الحفر والأساسات", None, date(2026, 5, 1), date(2026, 10, 31), 184, 0, "not_started", "م. سعيد"),
        ("الهيكل الخرساني", None, date(2026, 8, 1), date(2027, 5, 31), 304, 0, "not_started", "م. جمال"),
        ("الهيكل المعدني", None, date(2027, 1, 1), date(2027, 9, 30), 273, 0, "not_started", "م. هاني"),
        ("التشطيبات والتسليم", None, date(2027, 6, 1), date(2028, 6, 30), 396, 0, "not_started", "م. أحمد"),
    ],
    4: [
        ("الرفع المساحي", None, date(2025, 6, 1), date(2025, 8, 31), 92, 90, "in_progress", "م. مساحي"),
        ("أعمال الحفر", None, date(2025, 7, 1), date(2026, 3, 31), 274, 40, "in_progress", "م. حفار"),
        ("طبقات الرصف", None, date(2025, 12, 1), date(2027, 6, 30), 578, 5, "not_started", "م. رصف"),
        ("أعمال السلامة والإشارات", None, date(2027, 1, 1), date(2028, 1, 31), 396, 0, "not_started", "م. مرور"),
        ("أعمال التسليم النهائي", None, date(2028, 1, 1), date(2028, 5, 31), 151, 0, "not_started", "م. مدير"),
    ],
}

DOCUMENTS_DATA = {
    0: [
        ("العقد الرئيسي للمشروع", "contract", "CTR-EN-001"),
        ("كتاب التكليف", "letter", "LTR-EN-001"),
        ("تقرير الجودة الشهري - مارس", "report", "RPT-EN-001"),
    ],
    1: [
        ("عقد إنشاء كوبري الحرية", "contract", "CTR-EN-002"),
        ("محضر اجتماع المتابعة الأول", "meeting_minutes", "MM-EN-001"),
        ("تقرير اختبار الخوازيق", "report", "RPT-EN-002"),
    ],
    2: [
        ("العقد الرئيسي لمشروع المياه", "contract", "CTR-EN-003"),
        ("جدول الكميات المعتمد", "boq", "BOQ-EN-003"),
        ("تقرير اختبار الضغط", "report", "RPT-EN-003"),
    ],
    3: [
        ("عقد إنشاء المصنع", "contract", "CTR-EN-004"),
        ("الموافقات البيئية", "permit", "PER-EN-001"),
        ("مخطط الموقع العام", "drawing", "DRW-EN-004"),
    ],
    4: [
        ("العقد الرئيسي للطريق", "contract", "CTR-EN-005"),
        ("تقرير المساحة الأولي", "report", "RPT-EN-005"),
        ("خطاب اعتماد التصميم", "letter", "LTR-EN-005"),
    ],
}


def seed_sync():
    """Seed engineering module data using sync engine."""
    with Session(sync_engine) as db:
        # Delete existing data in reverse FK order
        for table in reversed(SQLModel.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()

        # Create projects
        projects = []
        for p in PROJECTS:
            project = Project(**p)
            db.add(project)
            projects.append(project)
        db.flush()

        # Create contracts
        all_contracts = {}
        for cd in CONTRACTS_DATA:
            data = dict(cd)
            p_idx = data.pop("project_idx")
            contract = Contract(project_id=projects[p_idx].id, **data)
            db.add(contract)
            all_contracts.setdefault(p_idx, []).append(contract)
        db.flush()

        # Create BOQ items
        all_boq_items = {}
        for p_idx, groups in BOQ_GROUPS.items():
            group_map = {}
            items_for_project = []
            for code, desc, _ in groups:
                group_item = BOQItem(
                    project_id=projects[p_idx].id,
                    item_code=code,
                    description=desc,
                    unit="",
                    quantity=Decimal("0"),
                    unit_price=Decimal("0"),
                    total_price=Decimal("0"),
                    category=code.split(".")[0],
                    is_group=True,
                )
                db.add(group_item)
                db.flush()
                group_map[code] = group_item
                items_for_project.append(group_item)

            for code, desc, unit, qty, price, group_code in BOQ_ITEMS[p_idx]:
                parent = group_map.get(group_code[:2], group_map.get("01", None))
                item = BOQItem(
                    project_id=projects[p_idx].id,
                    item_code=code,
                    description=desc,
                    unit=unit,
                    quantity=qty,
                    unit_price=price,
                    total_price=qty * price,
                    category=group_code[:2],
                    parent_id=parent.id if parent else None,
                    is_group=False,
                )
                db.add(item)
                items_for_project.append(item)

            all_boq_items[p_idx] = [i for i in items_for_project if not i.is_group]
        db.flush()

        # Create subcontractors
        for p_idx, subs in SUBCONTRACTORS.items():
            for name, trade, value in subs:
                sub = Subcontractor(
                    project_id=projects[p_idx].id,
                    name=name,
                    trade=trade,
                    contract_value=value,
                    status="active",
                )
                db.add(sub)
        db.flush()

        # Create IPCs
        for p_idx, ipcs in IPC_DATA.items():
            project_contracts = all_contracts.get(p_idx, [])
            main_contract = None
            for c in project_contracts:
                if c.contract_type == "main":
                    main_contract = c
                    break
            if not main_contract and project_contracts:
                main_contract = project_contracts[0]
            if not main_contract:
                continue

            boq_items = all_boq_items.get(p_idx, [])
            for ipc_info in ipcs:
                header = IPCHeader(
                    project_id=projects[p_idx].id,
                    contract_id=main_contract.id,
                    ipc_number=ipc_info["ipc_number"],
                    ipc_period=ipc_info["ipc_period"],
                    start_date=ipc_info["start_date"],
                    end_date=ipc_info["end_date"],
                    status=ipc_info["status"],
                )
                db.add(header)
                db.flush()

                total_amount = Decimal("0.00")
                details = []
                for boq_idx, current_qty in ipc_info["items"]:
                    if boq_idx >= len(boq_items):
                        continue
                    boq = boq_items[boq_idx]
                    # Find previous quantities for this boq_item
                    prev_qty = Decimal("0.00")
                    # Cumulative across all IPCs with same boq_item
                    amount = current_qty * boq.unit_price
                    total_amount += amount
                    detail = IPCDetail(
                        ipc_id=header.id,
                        boq_item_id=boq.id,
                        previous_quantity=prev_qty,
                        current_quantity=Decimal(str(current_qty)),
                        cumulative_quantity=Decimal(str(current_qty)),
                        percentage=(Decimal(str(current_qty)) / boq.quantity * 100) if boq.quantity > 0 else Decimal("0.00"),
                        amount=amount,
                    )
                    details.append(detail)

                contract = main_contract
                retention = Decimal("0.00")
                if contract:
                    retention = total_amount * (contract.retention_percent / 100)

                header.total_amount = total_amount
                header.retention_amount = retention
                header.net_amount = total_amount - retention
                db.add(header)
                db.flush()

                for detail in details:
                    detail.ipc_id = header.id
                    db.add(detail)
        db.flush()

        # Create drawings
        for p_idx, dwgs in DRAWINGS_DATA.items():
            for dwg_num, title, rev, disc, status in dwgs:
                drawing = Drawing(
                    project_id=projects[p_idx].id,
                    drawing_number=dwg_num,
                    title=title,
                    revision=rev,
                    discipline=disc,
                    status=status,
                )
                db.add(drawing)
        db.flush()

        # Create daily reports
        weather_opts = ["مشمس", "غائم جزئياً", "صافي", "معتدل"]
        for p_idx, dates in DAILY_REPORTS.items():
            for i, d in enumerate(dates):
                report = DailyReport(
                    project_id=projects[p_idx].id,
                    report_date=d,
                    weather=weather_opts[i % len(weather_opts)],
                    manpower_count=25 + i * 5,
                    equipment_count=8 + i * 2,
                    work_description=f"استمرار الأعمال في الموقع - الأسبوع {i + 1}",
                    issues="لا يوجد" if i % 2 == 0 else "تأخير وصول المواد",
                    created_by=PROJECTS[p_idx]["engineer_in_charge"],
                )
                db.add(report)
        db.flush()

        # Create schedules
        for p_idx, scheds in SCHEDULES.items():
            for task, parent_idx, sd, ed, dur, progress, status, resp in scheds:
                schedule = Schedule(
                    project_id=projects[p_idx].id,
                    task_name=task,
                    parent_id=None,
                    start_date=sd,
                    end_date=ed,
                    duration_days=dur,
                    progress_percent=Decimal(str(progress)),
                    status=status,
                    responsible=resp,
                )
                db.add(schedule)
        db.flush()

        # Create documents
        for p_idx, docs in DOCUMENTS_DATA.items():
            for title, doc_type, ref in docs:
                doc = Document(
                    project_id=projects[p_idx].id,
                    title=title,
                    doc_type=doc_type,
                    reference_number=ref,
                    status="final",
                    created_by=PROJECTS[p_idx]["engineer_in_charge"],
                )
                db.add(doc)
        db.flush()

        db.commit()
        print(f"[OK] Seeded {len(projects)} projects, {sum(len(v) for v in all_contracts.values())} contracts, "
              f"{sum(len(v) for v in all_boq_items.values())} BOQ items + groups")


async def seed_async():
    """Seed auth users using async engine."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        existing = result.scalar_one_or_none()
        if not existing:
            admin = User(
                username="admin",
                email="admin@ems.com",
                hashed_password=hash_password("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            print("[OK] Created admin user (admin/admin123)")
        else:
            print("[OK] Admin user already exists")


def seed():
    seed_sync()


if __name__ == "__main__":
    asyncio.run(seed_async())
    seed()
    print("\nSeeding complete! All demo data created.")
