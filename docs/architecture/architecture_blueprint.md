# Architecture Blueprint — Engineering Management System

## دليل معمارية النظام الشامل (0 → 360)

> هذا الملف هو المرجع المعماري للنظام. يقرأه Agent I و Agent B قبل أي تعديل.
> يضمن اتساق القرارات المعمارية عبر جميع الموديولات.

---

## 1. هيكل المشروع (Directory Tree)

```
engineering-management-system-3/
│
├── brand_identity.json              # الهوية البصرية واللفظية (يُقرأ أولاً)
├── architecture_blueprint.md        # هذا الملف — المرجع المعماري
├── .cursorrules                     # لقاح الاستمرارية التلقائي
├── ENGINEERING_BUSINESS_RULES.md    # قواعد العمل الهندسية
│
├── backend/                         # ★ Backend (FastAPI + SQLAlchemy Async)
│   ├── app/
│   │   ├── main.py                  # دخلة FastAPI + lifespan + routers
│   │   ├── config.py                # Pydantic Settings (DATABASE_URL, SECRET_KEY, ...)
│   │   ├── database.py              # SQLAlchemy async engine + session
│   │   ├── dependencies.py          # Shared dependencies
│   │   │
│   │   ├── core/                    # ★ الخدمات المشتركة
│   │   │   ├── base.py              # DeclarativeBase + TimestampMixin
│   │   │   ├── schemas.py           # PaginatedResponse
│   │   │   ├── crud.py              # GenericCRUD (list, get, create, update, delete)
│   │   │   ├── audit.py             # Audit logging
│   │   │   ├── export.py            # Excel export
│   │   │   ├── search.py            # Global search (19 entity types)
│   │   │   └── rate_limit.py        # Rate limiter
│   │   │
│   │   ├── auth/                    # المصادقة (JWT)
│   │   │   ├── models.py / schemas.py / crud.py / api.py / utils.py
│   │   │
│   │   ├── [entity]/                # ★ نمط كل Entity (رباعي إلزامي):
│   │   │   ├── models.py            # SQLAlchemy model
│   │   │   ├── schemas.py           # Pydantic schemas
│   │   │   ├── crud.py              # GenericCRUD instance
│   │   │   └── api.py               # FastAPI router
│   │   │
│   │   └── engineering_features/    # ★ المكتب الفني (موديول رئيسي)
│   │       ├── models.py            # ~11 models (IPC, BOQ, Schedule, ...)
│   │       ├── schemas.py           # Pydantic schemas
│   │       ├── api.py               # ~100+ endpoint
│   │       ├── dashboard.py         # Dashboard summary KPIs
│   │       └── ipc_pdf.py           # IPC PDF generation
│   │
│   ├── tests/                       # اختبارات pytest
│   ├── seed.py                      # بيانات البذرة
│   └── requirements.txt
│
├── core/lego_v2/                    # ★ LEGO v2 Event-Driven Infrastructure
│   ├── registry/                    # ModuleRegistry — تسجيل الموديولات
│   ├── connectors/                  # ConnectorRegistry — منافذ inter-module
│   ├── event_bus/
│   │   ├── bus.py                   # EventBus — pub/sub
│   │   └── events.py                # 24 event constants
│   └── shared/                      # مشترك
│
├── modules/                         # ★ LEGO v2 Module Definitions
│   ├── engineering/                 # (قيد الاستخدام)
│   ├── hr / finance / inventory     # (مخطط)
│   └── ...
│
└── frontend/                        # ★ Frontend (React 19 + MUI 9)
    ├── src/
    │   ├── main.jsx                 # React entry
    │   ├── App.jsx                  # Routes
    │   ├── theme.js                 # MUI theme (Corporate Luxury)
    │   ├── services/api.js          # Axios API
    │   ├── contexts/                # AuthContext, ThemeContext
    │   ├── components/              # 14 shared components
    │   └── pages/                   # 24 pages
    └── package.json
```

---

## 2. المعمارية الأساسية (Core Architecture)

### 2.1 Backend Pattern: FastAPI Modular Monolith
- **محرك واحد** (`backend/app/main.py`) يشغل كل الـ entities
- **لكن معزولة**: كل entity لها models/schemas/crud/api مستقلة
- **GenericCRUD**: يوفر CRUD موحد لجميع entities (يقلل تكرار الكود 80%)
- **Entity رباعي إلزامي**: models.py + schemas.py + crud.py + api.py

### 2.2 Event-Driven Layer: LEGO v2
- **EventBus**: تواصل غير متزامن بين الموديولات
- **Connectors**: منافذ لاستدعاء خدمات موديول آخر (عند الضرورة)
- **ModuleRegistry**: تسجيل كل موديول مع أحداثه ومنافذه
- **24 Engineering Event**: تغطي workflows الـ entities (IPC.APPROVED, NCR.CREATED, ...)

### 2.3 Frontend Pattern: React 19 + MUI 9
- **MUI DataGrid**: جدول موحد لكل entities
- **FormDialog**: نافذة إضافة/تعديل موحدة
- **EntityPage.jsx**: صفحة CRUD ديناميكية قابلة لإعادة الاستخدام
- **i18n**: ترجمة عربي/إنجليزي (RTL)

---

## 3. قواعد العزل والتخاطب (Isolation & Communication)

### 3.1 حظر الاستدعاء المباشر بين الموديولات
```
🚫 engineering/api.py --import--> hr/models.py
✅ engineering --emit_event("IPC.APPROVED")--> EventBus --> hr يستقبل
```

### 3.2 عزل قواعد البيانات
- كل entity لها جداولها الخاصة
- يُمنع Cross-Module Joins
- العلاقات عبر `SQLAlchemy relationship()` فقط داخل نفس entity

### 3.3 التخاطب عبر الأحداث (Event-Driven)
- الموديول المصدر يبث حدثاً عبر EventBus
- الموديول الهدف يستقبل ويعالج
- مثال: IPC.APPROVED → Finance يستقبل ويسجل قيداً محاسبياً

---

## 4. الأمان والصلاحيات (Security)

| الدور | الصلاحيات |
|-------|-----------|
| admin | كامل الصلاحيات (قراءة/كتابة/حذف) + إدارة مستخدمين |
| engineer | قراءة/كتابة entities + تعديل محدود |
| viewer | قراءة فقط |

- جميع endpoints محمية بـ `Depends(get_current_user)`
- عمليات الكتابة: `require_role("admin", "engineer")`
- عمليات الحذف: حكر على `require_role("admin")`
- JWT + Refresh Token + Blacklist
- Rate Limiting: 5 req/min على auth

---

## 5. قاعدة البيانات (Database)

### 5.1 التقنية
- **SQLite** (تطوير) / **PostgreSQL** (إنتاج — مخطط)
- **SQLAlchemy 2.0 Async** — كل العمليات غير متزامنة
- **Alembic** مهيأ ولكن auto-migration غير مفعلة (إنشاء الجداول تلقائياً عند startup)

### 5.2 نمط الـ Models
```python
class EntityModel(TimestampMixin, Base):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # entity-specific fields
    # relationships
    # __tablename__
```

### 5.3 أهم الجداول الهندسية
- `contracts` — العقود
- `boq_items` — بنود الكميات (هرمي مع parent_id)
- `ipc_headers` / `ipc_details` — المستخلصات
- `schedules` — الجداول الزمنية (WBS, CPM)
- `daily_reports` — التقارير اليومية
- `rfis` — طلبات الاستفسار
- `variation_orders` — أوامر التغيير
- `submittal_register` — سجل التقديمات (Phase 1)
- `inspection_requests` — طلبات التفتيش (Phase 1)
- `punch_list_items` — بنود الملاحظات (Phase 1)
- `transmittals` — الإرساليات (Phase 1)
- `safety_incidents` / `safety_observations` — HSE (Phase 3)

---

## 6. واجهة المستخدم (UI Spec)

### 6.1 الهوية البصرية
- **الطراز**: Corporate Luxury Minimalism
- **التأثير**: Daylight-Resistant Glassmorphism
- **الألوان**: Deep Slate Navy (خلفيات) + Brushed Amber Gold (تمييز)
- **الخط**: Inter (إنجليزي) / Cairo (عربي) — MUI theme

### 6.2 Glassmorphism Spec
```css
.glass-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(14px) saturate(180%);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 14px;
}
```

### 6.3 المكونات الأساسية
- **Layout**: Sidebar + Header + Content (RTL/LTR)
- **DataTable**: MUI X DataGrid مع filtering/sorting
- **StatsCard**: Glassmorphism مع رقم كبير + أيقونة
- **FormDialog**: Modal لإضافة/تعديل entities
- **WorkflowTimeline**: timeline لحالات workflows
- **GanttChart**: للجداول الزمنية

---

## 7. الحسابات الهندسية (Engineering Math)

### 7.1 EVM — إدارة القيمة المكتسبة
- SPI = EV / PV
- CPI = EV / AC
- CV = EV - AC
- SV = EV - PV

### 7.2 IPC — شهادات الدفع المؤقتة
- Net Amount = Gross - Retention - Advance Recovery - Fines - Insurance - Deductions
- كل Detail: previous_amount + current_amount = total_amount

### 7.3 BOQ — بنود الكميات
- total_price = quantity × unit_price
- بنود آباء (groups) وأبناء (items)

### 7.4 CPM — المسار الحرج
- Forward pass: Early Start / Early Finish
- Backward pass: Late Start / Late Finish
- Float = LS - ES (أو LF - EF)
- المسار الحرج: كل الأنشطة اللتي Float = 0

---

## 8. قرارات معمارية محفورة (Architectural Decisions)

| القرار | التفصيل |
|--------|---------|
| GenericCRUD موحد | لا نعيد كتابة CRUD لكل entity |
| Notification في موديول منفصل | لا Notification داخل engineering_features |
| EventBus للتواصل بين الموديولات | لا direct imports بين modules/ |
| SQLAlchemy Async | كل DB عمليات غير متزامنة |
| MUI DataGrid موحد | لا نصنع table لكل صفحة |
| EntityPage.jsx ديناميكي | صفحة واحدة تكفي لكل entities البسيطة |
| brand_identity.json في الجذر | لأي AI أو مطور يدخل المشروع يقرأ الهوية أولاً |

---

## 9. الملفات التي يقرأها AI Agent — بالترتيب

```
1. brand_identity.json          ← الهوية (أول شيء)
2. .cursorrules                 ← اللقاح + القواعد
3. architecture_blueprint.md    ← هذا الملف
4. .ai/SYSTEM_DNA.md            ← الحمض النووي
5. ENGINEERING_BUSINESS_RULES.md ← قواعد العمل الهندسية
6. .ai/AGENT_0_MAESTRO.md       ← هوية المايسترو
7. PROJECT_MAP.md               ← خريطة المشروع
8. DB_SCHEMA.md                 ← مخطط قاعدة البيانات
```
