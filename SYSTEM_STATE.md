# Engineering Management System — حالة النظام المستقرة (Stable State)

> تاريخ التوثيق: 2026-06-25  
> الإصدار: `develop` (SHA: `e7a80d34`)  
> النظام شغال على: https://tablets-engineering-erp.hf.space

---

## 1. نظرة عامة

نظام متكامل لإدارة المشاريع الهندسية (Engineering Management System).
- **الاسم التجاري**: Elkanzy
- **الشركة الأساسية**: شركة نجيده للمقاولات العامة والتوريدات
- **الغرض**: إدارة المشاريع الهندسية — المكتب الفني (العقود، المستخلصات، المخططات، الجداول الزمنية، المقاولين، إلخ)

---

## 2. المستودعات (Repositories)

| المصدر | الرابط | الاستخدام |
|--------|--------|-----------|
| **GitHub (المصدر الأساسي)** | `https://github.com/Ahmed-Gaffer/ahmed-engineering-erp.git` | الكود المصدري، GitHub Actions، Docker Images |
| **HuggingFace Space (النشر)** | `https://huggingface.co/spaces/Tablets/engineering-erp` | بيئة التشغيل (Docker فقط، بدون كود مصدري) |

---

## 3. فروع Git (Branches)

| الفرع | الغرض | آخر commit | الحالة |
|-------|-------|-----------|--------|
| `develop` | التطوير النشط — ينشر تلقائياً على HF Space main | `e7a80d34` | نشط (هذا الفرع) |
| `main` | الإصدارات المستقرة | قديم (backup) | يُستخدم للتاغات فقط |
| `stable/v1` | الإصدار 1.0 المستقر للطوارئ — يُنشر يدوياً على HF Space stable | `3f35b8da` | ثابت |
| `master` | قديم (نسخة احتياطية) | قديم | غير مستخدم |

### Tag
- `v1.0.0` — على `stable/v1` (أول إصدار مستقر)

---

## 4. بنية المشروع (Project Structure)

```
engineering-management-system-3/
├── Dockerfile                       # Multi-stage: Node 22 → Python 3.11
├── pyproject.toml                   # Python dependencies (hatchling)
├── deploy-to-hf.sh                  # Script لنشر يدوي على HF Space
├── main.py                          # LEGO v2 app entry point (قديم/غير مستخدم)
├── .github/workflows/
│   ├── deploy-hf-space.yml          # CI/CD: push → build Docker → GHCR → HF Space
│   └── deploy-stable.yml            # Manual: build stable/v1 → GHCR → HF Space (stable branch)
│
├── backend/                         # ★ Backend الأساسي (FastAPI)
│   ├── seed.py                      # بيانات البذرة (admin/admin123 + demo data)
│   ├── seed_demo.py                 # بيانات إضافية (قديم)
│   ├── requirements.txt             # Python dependencies
│   ├── run.py                       # تشغيل محلي
│   ├── start_and_register.py        # قديم
│   └── app/
│       ├── main.py                  # ★ دخلة FastAPI (lifespan, routers, SPA fallback)
│       ├── config.py                # Settings (DATABASE_URL, SECRET_KEY, JWT, UPLOAD_DIR)
│       ├── database.py              # SQLAlchemy async engine + session
│       ├── dependencies.py          # Shared dependencies
│       ├── upload.py                # File upload endpoint
│       ├── core/
│       │   ├── base.py              # Base (DeclarativeBase) + TimestampMixin
│       │   ├── schemas.py           # PaginatedResponse
│       │   ├── crud.py              # Generic CRUD (list, get, create, update, delete)
│       │   ├── audit.py             # Audit logging
│       │   ├── export.py            # Excel export
│       │   ├── export_api.py        # Export endpoints
│       │   ├── search.py            # Global search
│       │   ├── logging.py           # Logger setup
│       │   └── rate_limit.py        # Rate limiter
│       │
│       ├── auth/                    # المصادقة
│       │   ├── api.py               # /api/auth/login, register, profile, refresh
│       │   ├── models.py            # User
│       │   ├── schemas.py           # UserLogin, UserCreate, UserResponse
│       │   ├── crud.py              # login_user (JWT generation)
│       │   └── utils.py             # hash_password, verify_password, create_token, get_current_user
│       │
│       ├── contractors/             # المقاولون
│       │   ├── api.py               # CRUD + /api/contractors/*
│       │   ├── models.py            # Contractor
│       │   ├── schemas.py           # ContractorCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── projects/                # المشاريع
│       │   ├── api.py               # CRUD + /api/projects/*
│       │   ├── models.py            # Project
│       │   ├── schemas.py           # ProjectCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── phases/                  # مراحل المشروع
│       │   ├── api.py               # /api/phases/*
│       │   ├── models.py            # ProjectPhase
│       │   ├── schemas.py           # PhaseCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── codes/                   # أكواد المشروع (WBS)
│       │   ├── api.py               # /api/codes/*
│       │   ├── models.py            # ProjectCode
│       │   ├── schemas.py           # CodeCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── work_orders/             # أوامر العمل
│       │   ├── api.py               # /api/work-orders/*
│       │   ├── models.py            # WorkOrder
│       │   ├── schemas.py           # WorkOrderCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── work_order_items/        # بنود أمر العمل
│       │   ├── api.py               # /api/work-order-items/*
│       │   ├── models.py            # WorkOrderItem
│       │   ├── schemas.py           # WorkOrderItemCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── drawings/                # المخططات
│       │   ├── api.py               # /api/drawings/*
│       │   ├── models.py            # Drawing
│       │   ├── schemas.py           # DrawingCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── drawing_revisions/       # مراجعات المخططات
│       │   ├── api.py               # /api/drawing-revisions/*
│       │   ├── models.py            # DrawingRevision
│       │   ├── schemas.py           # RevisionCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── documents/               # المستندات
│       │   ├── api.py               # /api/documents/*
│       │   ├── models.py            # Document
│       │   ├── schemas.py           # DocumentCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── payment_certificates/    # شهادات الدفع
│       │   ├── api.py               # /api/payment-certificates/*
│       │   ├── models.py            # PaymentCertificate
│       │   ├── schemas.py           # PaymentCertCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── employees/               # الموظفين
│       │   ├── api.py               # /api/employees/*
│       │   ├── models.py            # Employee
│       │   ├── schemas.py           # EmployeeCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── company_profile/         # ملف الشركة
│       │   ├── api.py               # /api/company-profile/*
│       │   ├── models.py            # CompanyProfile
│       │   ├── schemas.py           # ProfileCreate/Update/Response
│       │   └── crud.py              # CRUD ops
│       │
│       ├── notifications/           # الإشعارات
│       │   ├── api.py               # /api/notifications/*
│       │   ├── models.py            # Notification (type, title_ar, title_en, message_ar, message_en, ...)
│       │   ├── schemas.py           # NotificationCreate/Response
│       │   └── crud.py              # CRUD + create_notification
│       │
│       ├── activities/              # سجل النشاطات
│       │   ├── api.py               # /api/activities/*
│       │   ├── models.py            # Activity
│       │   ├── schemas.py           # ActivityResponse
│       │   └── crud.py              # log_activity, get_activities
│       │
│       ├── engineering_features/    # ★ موديول المكتب الفني (الرئيسي)
│       │   ├── api.py               # ~100+ endpoint (IPC, BOQ, Schedule, VO, RFI, Drawings, ...)
│       │   ├── models.py            # 11 models (انظر جدول النماذج أدناه)
│       │   ├── schemas.py           # All Pydantic schemas
│       │   ├── dashboard.py         # Dashboard summary aggregation
│       │   └── ipc_pdf.py           # IPC PDF generation
│       │
│       └── workflow/                # سير العمل
│           ├── api.py               # /api/workflow/*
│           ├── models.py            # WorkflowState, WorkflowTransition
│           ├── schemas.py           # Workflow schemas
│           └── engine.py            # Workflow engine
│
├── core/lego_v2/                    # LEGO v2 (قديم—غير مستخدم حالياً)
│   └── shared/models/__init__.py
├── modules/                         # LEGO v2 modules (قديم—غير مستخدم حالياً)
│   └── ...
│
└── frontend/                        # ★ Frontend (React 19 + MUI 9)
    ├── index.html
    ├── package.json                 # Dependencies
    ├── vite.config.js               # Vite config
    └── src/
        ├── main.jsx                 # React entry
        ├── App.jsx                  # Routes setup
        ├── theme.js                 # MUI theme (RTL Arabic)
        ├── services/api.js          # Axios API service
        ├── utils/helpers.js         # Utility functions
        ├── i18n/                    # الترجمة
        │   ├── index.js
        │   ├── ar.json              # Arabic translations
        │   └── en.json              # English translations
        ├── contexts/
        │   ├── AuthContext.jsx       # Authentication context
        │   └── ThemeContext.jsx      # Theme context
        ├── components/              # 14 Shared components
        │   ├── Layout/              # Main layout (sidebar + header + content)
        │   ├── Sidebar/             # Navigation sidebar
        │   ├── DataTable/           # Reusable data grid
        │   ├── FormDialog/          # Form dialog
        │   ├── ConfirmDialog/       # Confirmation dialog
        │   ├── ApprovalDialog/      # Approval workflow dialog
        │   ├── EmptyState/          # Empty state placeholder
        │   ├── ErrorBoundary/       # Error boundary
        │   ├── NotificationBell/    # Bell icon with unread count
        │   ├── StatsCard/           # Statistics card
        │   ├── GanttChart/          # Gantt chart component
        │   ├── NavigationProgress/  # Progress stepper
        │   ├── Skeleton/            # Loading skeletons
        │   └── WorkflowTimeline/    # Workflow timeline
        └── pages/                   # 24 Pages
            ├── Login/
            ├── Dashboard/
            ├── Projects/
            ├── Phases/
            ├── Contracts/
            ├── BOQ/
            ├── IPC/
            │   └── IPCPrint.jsx     # IPC printable view
            ├── Schedules/
            ├── Drawings/
            ├── DrawingRevisions/
            ├── DailyReports/
            ├── Subcontractors/
            ├── VariationOrders/
            ├── RFIs/
            ├── Documents/
            ├── WorkOrders/
            ├── WorkOrderItems/
            ├── PaymentCertificates/
            ├── Codes/
            ├── Contractors/
            ├── Employees/
            ├── CompanyProfile/
            ├── Notifications/
            ├── Reports/
            ├── Admin/
            └── EntityPage.jsx       # Dynamic CRUD page
```

---

## 5. قاعدة البيانات (Database Schema)

### 5.1 النماذج العامة (Core)

| الجدول | الموديول | الحقول الرئيسية |
|--------|---------|----------------|
| `users` | auth | id, username, email, hashed_password, role, is_active |
| `activities` | activities | id, user_id, action, entity_type, entity_id, details, timestamp |
| `notifications` | notifications | id, user_id, type (نص), title_ar, title_en, message_ar, message_en, related_entity_type, related_entity_id, is_read, created_at |
| `company_profiles` | company_profile | id, company_name_ar, company_name_en, established_year, about_ar, about_en, logo_url, address, phone, ... |
| `workflow_states` | workflow | id, entity_type, entity_id, state, transitions |
| `workflow_transitions` | workflow | id, workflow_id, from_state, to_state, action, performed_by, comment |

### 5.2 النماذج الأساسية (CRUD)

| الجدول | الموديول | الحقول الرئيسية |
|--------|---------|----------------|
| `contractors` | contractors | id, code, name, classification, specialties, phone, email, address, status, commercial_register, tax_card, contract_value |
| `projects` | projects | id, code, name, location, project_type, contractor_id (FK), start_date, end_date_planned, end_date_actual, status, budget_estimated, budget_actual, client_name, consultant_name, project_manager |
| `project_phases` | phases | id, project_id (FK), name, order_index, progress_percentage, status |
| `project_codes` | codes | id, project_id (FK), code, title, level, type (group/item), unit, unit_price, total_quantity |
| `work_orders` | work_orders | id, project_id (FK), wo_number, title, contractor_id (FK), issue_date, due_date, priority, status, total_amount |
| `work_order_items` | work_order_items | id, work_order_id (FK), item_code, description, unit, quantity, unit_price, total_price, executed_quantity, status |
| `drawings` | drawings | id, project_id (FK), drawing_number, title, discipline, scale, status, current_revision |
| `drawing_revisions` | drawing_revisions | id, drawing_id (FK), revision_number, description, status, approved_by, file_path |
| `documents` | documents | id, project_id (FK), doc_number, title, type, direction, related_party, status, file_path |
| `payment_certificates` | payment_certificates | id, project_id (FK), certificate_number, contractor_id (FK), period_from, period_to, issue_date, current_works, materials_on_site, net_amount, retention_amount, amount_due, status, payment_date |
| `employees` | employees | id, code, name, position, department, phone, email, hire_date, status, national_id |

### 5.3 نماذج المكتب الفني (Engineering Features)

| الجدول | الوصف | الحقول الرئيسية |
|--------|-------|----------------|
| `contracts` | العقود الهندسية | id, project_id (FK), contract_number, contract_type, party_a, party_b, sign_date, value, duration_months, retention_percent, advance_payment_percent, status |
| `boq_items` | بنود الكميات | id, project_id (FK), item_code, description, unit, quantity, unit_price, total_price, category, parent_id (self-ref), is_group |
| `ipc_headers` | رأس المستخلص | id, project_id (FK), contract_id (FK), ipc_number, ipc_period, start_date, end_date, status, **total_works**, materials_on_site, gross_amount, retention_percent, retention_amount, advance_recovery, fines, insurance, deductions, net_amount, previous_total, current_due, total_to_date, contract_ceiling, total_billed, assigned_to, last_comment |
| `ipc_details` | تفاصيل المستخلص | id, ipc_header_id (FK), boq_item_id (FK), item_code, description, unit, unit_price, previous_quantity, current_quantity, total_quantity, previous_amount, current_amount, total_amount |
| `daily_reports` | التقارير اليومية | id, project_id (FK), report_date, report_number, weather, summary, labor_count, equipment_count, work_done, issues, created_by |
| `subcontractors` | مقاولين باطن | id, project_id (FK), name, scope, contract_value, start_date, end_date, status, phone, email |
| `schedules` | الجداول الزمنية | id, project_id (FK), wbs_code, task_name, duration_days, start_date, end_date, progress_percentage, status, parent_id (self-ref), dependencies (JSON), assigned_to, priority |
| `eng_documents` | مستندات هندسية | id, project_id (FK), doc_number, title, type, category, file_path, status, issue_date, related_entity_type, related_entity_id |
| `variation_orders` | أوامر التغيير | id, project_id (FK), vo_number, title, description, amount_change, status, reason, approved_by, approved_date, issued_date |
| `rfis` | طلبات استفسار | id, project_id (FK), rfi_number, title, question, answer, status, priority, due_date, assigned_to, created_by, answered_by |
| `system_settings` | إعدادات النظام | id, key, value, type, description |

---

## 6. API Endpoints (الرئيسية)

### 6.1 المصادقة (`/api/auth`)
- `POST /login` — تسجيل الدخول (json: username, password → token)
- `POST /register` — تسجيل مستخدم جديد (admin only)
- `GET /profile` — الملف الشخصي
- `POST /refresh` — تجديد التوكن

### 6.2 الإشعارات (`/api/notifications`)
- `GET /` — قائمة الإشعارات (مقسمة)
- `GET /unread-count` — عدد غير المقروء
- `PUT /{id}/read` — تعيين كمقروء
- `PUT /read-all` — قراءة الكل

### 6.3 المكتب الفني (`/api/engineering`)
- **Dashboard**: `GET /dashboard/summary`
- **Projects**: `GET/POST /projects`, `GET /projects/{id}`
- **Contracts**: `GET/POST /contracts`, `GET/PATCH/DELETE /contracts/{id}`
- **BOQ**: `GET/POST /boq-items`, `POST /boq-items/bulk`, `PUT/DELETE /boq-items/{id}`, `GET /projects/{id}/boq`, `GET /projects/{id}/boq/export`, `POST /projects/{id}/boq/import`
- **IPCs**: `GET/POST/PUT/DELETE /ipcs`, `POST /ipcs/{id}/{submit|approve|reject|pay}`, `GET /projects/{id}/ipcs`, `GET /projects/{id}/ipcs/summary`, `GET /ipcs/{id}/export`, `GET /ipcs/{id}/pdf`
- **Drawings**: `GET/POST /drawings`, `GET /projects/{id}/drawings`
- **Daily Reports**: `GET/POST/PUT/DELETE /daily-reports`, `GET /projects/{id}/daily-reports`
- **Subcontractors**: `GET/POST/PUT/DELETE /subcontractors`, `GET /projects/{id}/subcontractors`
- **Schedules**: `GET/POST/PUT/PATCH/DELETE /schedules`, `GET /projects/{id}/schedules`, `POST /projects/{id}/schedules/critical-path`
- **Documents**: `GET/POST /documents`, `GET /projects/{id}/documents`
- **Variation Orders**: `GET/POST/PUT/DELETE /variation-orders`, `GET /projects/{id}/variation-orders`
- **RFIs**: `GET/POST/PUT/DELETE /rfis`, `GET /projects/{id}/rfis`
- **EVM**: `GET /projects/{id}/evm`
- **Reports**: `GET /reports/project-financial/{id}`, `GET /reports/project-comparison`, `GET /reports/dashboard-export`
- **Settings**: `GET/POST/PUT /admin/settings`
- **Activity**: `GET /admin/activity`
- **Logs**: `GET /admin/logs`
- **Notifications**: `GET /notifications`, `GET /notifications/unread-count`, `PUT /notifications/{id}/read`, `PUT /notifications/read-all`

---

## 7. Frontend

### 7.1 التقنيات
- React 19 + MUI 9 + React Router 7 + Axios
- Recharts (رسوم بيانية)
- Framer Motion (أنيميشن)
- i18next (ترجمة عربي/إنجليزي)
- Vite 6 (build)
- notistack (إشعارات)

### 7.2 الصفحات (24)
كل صفحة (ما عدا Login, Dashboard, Reports, Admin, EntityPage) تتبع نفس النمط:
- `EntityPage.jsx` — صفحة CRUD ديناميكية قابلة لإعادة الاستخدام
- `DataTable` + `FormDialog` + `ConfirmDialog` — مكونات مشتركة في كل الصفحات

### 7.3 المصادقة
- `AuthContext` — يحفظ التوكن في localStorage
- Axios interceptor — يضيف Bearer token تلقائياً
- 401 → redirect للـ Login

---

## 8. الإعدادات والتشغيل

### 8.1 التوكنات والمفاتيح
| المفتاح | القيمة | المخزن في |
|---------|--------|-----------|
| `HF_TOKEN` | `hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` | (معروف لنا) |
| `HF_SPACE_REPO` | `Tablets/engineering-erp` | (معروف لنا) |
| `GHCR_IMAGE` | `ghcr.io/ahmed-gaffer/engineering-erp` | GitHub Actions env |
| `SECRET_KEY` | تلقائي (secrets.token_hex(32)) | .env أو auto-generated |

> **هام**: `HF_TOKEN` و `HF_SPACE_REPO` يجب إضافتها كـ **Secrets** في GitHub repo:
> - Settings → Secrets and variables → Actions
> - `HF_TOKEN` = `hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
> - `HF_SPACE_REPO` = `Tablets/engineering-erp`
>
> بدونها، GitHub Actions ‏workflow مش هيعرف يدفش للـ HF Space.

### 8.2 Credentials للتجربة
- **Username**: `admin`
- **Password**: `admin123`
- User roles: `admin` (كامل الصلاحيات), `engineer`, `viewer`

### 8.3 متغيرات البيئة
```env
DATABASE_URL=sqlite+aiosqlite:///./engineering.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
```

### 8.4 التشغيل المحلي

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## 9. النشر (Deployment)

### 9.1 الاستراتيجية

```
GitHub (source code)
    │
    ├── push → develop branch
    │       │
    │       ▼
    │   GitHub Actions (deploy-hf-space.yml)
    │       │
    │       ├── 1. docker build (multi-stage)
    │       ├── 2. docker push → GHCR (ghcr.io/ahmed-gaffer/engineering-erp:latest + :sha)
    │       ├── 3. Make GHCR package public
    │       └── 4. Push README.md → HF Space (main branch)
    │
    └── manual → workflow_dispatch (deploy-stable.yml)
            │
            ▼
        GitHub Actions
            │
            ├── build stable/v1 → GHCR:stable
            └── Push README → HF Space (stable branch)
```

### 9.2 HF Space (HuggingFace)

| الخاصية | القيمة |
|---------|--------|
| Space name | `Tablets/engineering-erp` |
| URL | https://tablets-engineering-erp.hf.space |
| SDK | docker |
| App port | 8000 |
| Hardware | cpu-basic (مجاني) |
| Default branch | `main` (develop auto-deploy) |
| Stable branch | `stable` (manual deploy for v1.0.0) |

**ما في الـ Space repo (فقط):**
- `README.md` — YAML metadata (title, emoji, sdk, app_port) + description
- `Dockerfile` — سطر واحد: `FROM ghcr.io/ahmed-gaffer/engineering-erp:{sha}`

**لا يوجد كود مصدري على HuggingFace** — أمان كامل.

### 9.3 التبديل بين develop و stable

من HuggingFace Space settings:
1. Settings → Repository → Branch
2. `main` → develop (آخر الإصدارات)
3. `stable` → v1.0.0 (النسخة المستقرة القديمة)
4. Save → HF يعيد البناء تلقائياً

### 9.4 GHCR (GitHub Container Registry)
- **Image**: `ghcr.io/ahmed-gaffer/engineering-erp`
- **Tags**: `:latest` (develop), `:stable` (v1.0.0), `:{sha}` (commit-specific)
- **Public**: مرئي للجميع (لازم عشان HF Space يقدر يسحبه)

### 9.5 النشر اليدوي
```bash
# Secure (README فقط)
./deploy-to-hf.sh --secure [branch] [space] [token]

# Source push إلى stable
./deploy-to-hf.sh --stable [space] [token]

# Source push عادي
./deploy-to-hf.sh [space] [token]
```

---

## 10. الإصدارات والتاريخ (Changelog)

### الإصدار الحالي — `e7a80d34` (2026-06-25)
**الوضع: مستقر — كل الحاجات شغالة ✅**

#### الإصلاحات المطبقة
| # | المشكلة | الملف المعدل | التفاصيل |
|---|---------|-------------|----------|
| 1 | `Table 'notifications' is already defined` | `engineering_features/models.py` | إزالة الكلاس `Notification` المكرر (كان في lines 197-206). النوتيفيكيشن الوحيد بقى في `notifications/models.py` مع حقل `type` |
| 2 | `total_amount` غير موجود في IPCHeader | `dashboard.py` | تغيير `ipc.total_amount` → `ipc.total_works` |
| 3 | `Contractor` relationship mapper error | `projects/models.py` | إضافة `from app.contractors.models import Contractor` عشان SQLAlchemy يلاقي الكلاس |
| 4 | `await` precedence bug | `dashboard.py:92` | `await db.execute(...).scalars()` → `(await db.execute(...)).scalars()` (النقطة لها أسبقية أعلى من await) |
| 5 | إزالة import غير مستخدم | `dashboard.py` | `from app.payment_certificates.models import PaymentCertificate` (كان مستورداً ولا يُستخدم) |
| 6 | Seed data: `total_amount` → `total_works` | `seed.py` | تصحيح أسماء الحقول في بيانات البذرة |

#### التحسينات
| # | التحسين | التفاصيل |
|---|---------|----------|
| 1 | نشر آمن عبر GHCR | Docker image يُدفع لـ GHCR، HF Space فيه README + Dockerfile فقط |
| 2 | Dual-branch HF Space | `main` = develop (auto), `stable` = v1.0.0 (manual) |
| 3 | GitHub Actions CI/CD | كل push على develop يبني image ويدفع لـ HF Space |
| 4 | جدولة النوتيفيكيشن | `seed.py` يسوي `DROP TABLE IF EXISTS notifications` عشان migration |
| 5 | Diagnostic error handling | أضفنا try/exception مؤقتاً عشان نشوف الخطأ الحقيقي (تمت إزالته لاحقاً) |

---

## 11. الاختبارات (Tests)

موجودة في `backend/tests/`:
- `test_auth.py` — اختبارات المصادقة
- `test_crud.py` — اختبارات CRUD العامة
- `test_new_features.py` — اختبارات الميزات الجديدة (engineering features)

**التشغيل:**
```bash
cd backend
pytest tests/ -v
```

---

## 12. ملاحظات هامة (للذاكرة)

### 12.1 SQLAlchemy Async + await precedence
**🚨 خطير جداً**: في Python، النقطة (`.`) لها أسبقية أعلى من `await`. يعني:

```python
# ✅ صح (منفصل)
result = await db.execute(select(Model))
items = result.scalars().all()

# ✅ صح (أقواس)
items = (await db.execute(select(Model))).scalars().all()

# ❌ غلط (النقطة تسبق await — هذا يسبب AttributeError)
items = await db.execute(select(Model)).scalars().all()
```

كل الأماكن التانية في الكود تستخدم الأقواس الصح (`(await db.execute(...)).scalar()`).

### 12.2 Notification model
النوتيفيكيشن الوحيد موجود في `notifications/models.py` — لا يوجد `Notification` في `engineering_features/models.py`.
الحقل `notification_type` تم تغيير اسمه إلى `type`.

### 12.3 IPCHeader model
- `total_works` (ليس `total_amount`)
- `net_amount` موجود
- لو أي كود جديد بيستخدم `total_amount` هيكسر

### 12.4 Circular imports
`projects/models.py` يستورد `Contractor` من `contractors/models.py`.
`contractors/models.py` لا يستورد من `projects/models.py` (يستخدم string `"Project"` في relationship).

أي موديل جديد عنده `relationship("OtherModel")` لازم يتأكد إن `OtherModel` مسجل في الـ Base registry قبل ما يتعمل mapper configuration.

### 12.5 HF Space Rebuild
- **Restart** (API: `POST /api/spaces/.../restart`) ← يعيد تشغيل الحاوية فقط (لا يسحب image جديد)
- **Rebuild** (git push) ← يبني Dockerfile من جديد ويسحب image جديد من GHCR
- Docker cache: `FROM ghcr.io/...:latest` ممكن يستخدم cache لو الـ tag نفسه. الأفضل استخدام SHA tag (`FROM ghcr.io/...:{sha}`).

### 12.6 GitHub Secrets المطلوبة
- `HF_TOKEN`: `hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (أضف التوكن الحقيقي في GitHub Secrets)
- `HF_SPACE_REPO`: `Tablets/engineering-erp`

### 12.7 `[skip ci]` في commit messages
GitHub Actions يتجاهل أي commit فيه `[skip ci]` أو `[ci skip]`.
استخدم `[skip-ci]` بحذر — هيمنع البناء التلقائي.
