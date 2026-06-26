# LEGO v2 — Legacy Merge Plan (Agent B: Solutions Architect)

## Executive Summary

نحول المشروع القديم (`engineering-management-system`) من monolith مسطح إلى **LEGO v2 modular architecture** مع الحفاظ على:
- SQLAlchemy 2.0 (لا SQLModel migration)
- GenericCRUD (114 سطر — أقوى أصول المشروع)
- Async عبر `AsyncSession`
- API surface متطابق 100% (Frontend لا يتأثر)
- Auth + RBAC + Audit logs + File upload

الاستراتيجية: **Layer فوق** — لا نستبدل، نبني LEGO v2 infrastructure فوق الكود الموجود وننقل الكيانات تدريجياً.

---

## 1. تحويل كل Entity Folder إلى `LegoModule`

### 1.1 الهيكل الحالي (Legacy)

```
backend/app/
├── contractors/     → models.py, schemas.py, crud.py, api.py
├── projects/        → models.py, schemas.py, crud.py, api.py
├── phases/          → models.py, schemas.py, crud.py, api.py
├── codes/           → models.py, schemas.py, crud.py, api.py
├── work_orders/     → models.py, schemas.py, crud.py, api.py
├── work_order_items/→ models.py, schemas.py, crud.py, api.py
├── drawings/        → models.py, schemas.py, crud.py, api.py
├── drawing_revisions/→ models.py, schemas.py, crud.py, api.py
├── documents/       → models.py, schemas.py, crud.py, api.py
├── payment_certificates/ → models.py, schemas.py, crud.py, api.py
├── employees/       → models.py, schemas.py, crud.py, api.py
├── auth/            → models.py, schemas.py, crud.py, api.py, utils.py
├── core/            → crud.py (GenericCRUD), base.py, audit.py, schemas.py
```

### 1.2 الهيكل المستهدف (LEGO v2)

```
modules/
├── engineering/
│   ├── __init__.py          → EngineeringModule(BaseModule)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── project.py       ← projects/models.py (SQLAlchemy 2.0)
│   │   ├── phase.py         ← phases/models.py
│   │   ├── code.py          ← codes/models.py
│   │   ├── work_order.py    ← work_orders/models.py
│   │   ├── work_order_item.py ← work_order_items/models.py
│   │   ├── drawing.py       ← drawings/models.py
│   │   ├── drawing_revision.py ← drawing_revisions/models.py
│   │   ├── document.py      ← documents/models.py
│   │   ├── payment_certificate.py ← payment_certificates/models.py
│   │   └── contractor.py    ← contractors/models.py
│   ├── schemas/
│   │   └── (نفس الملفات — Pydantic v2)
│   ├── crud/
│   │   └── (GenericCRUD instances — انظر §4)
│   ├── routers/
│   │   └── (نفس api.py — مع تعديل prefix)
│   ├── services/
│   │   └── (business logic إضافية — اختياري)
│   └── events/
│       └── handlers.py      → مشتركو EventBus
├── hr/
│   ├── __init__.py          → HRModule(BaseModule)
│   ├── models/
│   │   └── employee.py      ← employees/models.py
│   ├── schemas/
│   ├── crud/
│   ├── routers/
│   └── events/
├── auth/
│   ├── __init__.py          → AuthModule(BaseModule)
│   ├── models/
│   │   └── user.py          ← auth/models.py
│   ├── schemas/
│   ├── crud/
│   ├── routers/
│   │   └── auth.py          ← auth/api.py
│   └── dependencies.py      ← app/dependencies.py (get_current_user, require_role)
└── core/
    ├── __init__.py          → CoreModule(BaseModule)
    ├── crud.py              ← app/core/crud.py (GenericCRUD)
    ├── audit.py             ← app/core/audit.py
    ├── base.py              ← app/core/base.py (SQLAlchemy Base)
    ├── upload.py            ← app/upload.py
    └── export.py            ← app/core/export.py
```

### 1.3 آلية التحويل

لكل entity folder في Legacy:

| الخطوة | العمل | التفاصيل |
|--------|-------|----------|
| 1 | نقل `models.py` | إلى `modules/<module>/models/<entity>.py` |
| 2 | نقل `schemas.py` | إلى `modules/<module>/schemas/<entity>.py` |
| 3 | نقل `api.py` | إلى `modules/<module>/routers/<entity>.py` |
| 4 | نقل `crud.py` | إلى `modules/<module>/crud/<entity>.py` (انظر §4) |
| 5 | تعديل imports | من `app.X.models` إلى `modules.<module>.models.X` |
| 6 | تسجيل في `__init__.py` | `add_model()`, `add_router()`, `add_event()` |

### 1.4 `EngineeringModule.__init__.py` — المثال الكامل

```python
class EngineeringModule(BaseModule):
    name = "engineering"
    version = "1.0.0"
    dependencies = ["auth"]  # يحتاج auth للـ RBAC

    def __init__(self):
        super().__init__()
        
        # Routers
        self.add_router(contractor_router)   # prefix=/api/contractors
        self.add_router(project_router)      # prefix=/api/projects
        self.add_router(phase_router)          # prefix=/api/phases
        self.add_router(code_router)         # prefix=/api/codes
        self.add_router(work_order_router)   # prefix=/api/work-orders
        self.add_router(drawing_router)      # prefix=/api/drawings
        self.add_router(document_router)     # prefix=/api/documents
        self.add_router(payment_cert_router) # prefix=/api/payment-certificates
        
        # Models
        for m in [Contractor, Project, Phase, Code, WorkOrder, WorkOrderItem,
                  Drawing, DrawingRevision, Document, PaymentCertificate]:
            self.add_model(m)
        
        # Events
        self.add_event("project.created")
        self.add_event("project.updated")
        self.add_event("project.deleted")
        self.add_event("payment_certificate.approved")
        self.add_event("drawing.approved")
        
        # Ports (Connectors)
        self.add_port(ConnectorPort(
            name="project.get_by_id",
            module=self.name,
            handler=self._get_project_by_id,
            description="..."
        ))
        self.add_port(...)
```

---

## 2. فصل `auth` كـ Module مستقل

### 2.1 لماذا نفصل auth؟

- Auth هو **cross-cutting concern** — كل modules تعتمد عليه
- RBAC يجب أن يعمل cross-module (engineering يحتاج `require_role("engineer")`)
- JWT validation مركزي — لا نكرره في كل module

### 2.2 هيكل `auth` module

```
modules/auth/
├── __init__.py              → AuthModule(BaseModule)
├── models/
│   └── user.py              ← User model (SQLAlchemy 2.0)
├── schemas/
│   ├── user.py              ← UserCreate, UserLogin, UserResponse
│   └── token.py             ← TokenPayload
├── crud/
│   └── user.py              ← register_user, login_user
├── routers/
│   └── auth.py              ← /api/auth/register, /api/auth/login, /api/auth/me
├── dependencies.py          ← get_current_user, require_role
├── utils.py                 ← JWT encode/decode, password hash
└── events/
    └── handlers.py          ← user.created, user.login_failed
```

### 2.3 كيف يعمل RBAC cross-module

```python
# modules/auth/dependencies.py
from fastapi import Depends, HTTPException
from modules.auth.utils import decode_token, get_user_by_id

async def get_current_user(credentials=Depends(HTTPBearer()), db=Depends(get_db)):
    ...  # نفس الكود الحالي

def require_role(*roles: str):
    async def _check(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, ...)
        return user
    return _check
```

```python
# modules/engineering/routers/projects.py
from modules.auth.dependencies import get_current_user, require_role

@router.post("/", ...)
async def create_project(..., user=Depends(require_role("admin", "engineer"))):
    ...
```

### 2.4 تسجيل auth في Registry

```python
class AuthModule(BaseModule):
    name = "auth"
    version = "1.0.0"
    dependencies = []  # auth لا يعتمد على أحد
    
    def __init__(self):
        super().__init__()
        self.add_router(auth_router)
        self.add_model(User)
        
        # Port: يقدم خدمة التحقق من المستخدم
        self.add_port(ConnectorPort(
            name="user.get_by_id",
            module=self.name,
            handler=self._get_user_by_id,
            description="الحصول على مستخدم بواسطة ID"
        ))
        
        self.add_port(ConnectorPort(
            name="user.verify_token",
            module=self.name,
            handler=self._verify_token,
            description="التحقق من صلاحية JWT token"
        ))
```

---

## 3. فصل `employees` كـ `hr` module

### 3.1 لماذا نفصل employees إلى hr؟

- `employees` في Legacy كان مجرد entity مسطح
- في LEGO v2، `hr` module سيكون أكبر — يشمل:
  - employees (الموظفين)
  - attendance (الحضور والانصراف)
  - payroll (الرواتب)
  - leave_requests (الإجازات)
- engineering module يحتاج `hr.get_employee` عبر Connector

### 3.2 هيكل `hr` module

```
modules/hr/
├── __init__.py              → HRModule(BaseModule)
├── models/
│   └── employee.py          ← Employee model (SQLAlchemy 2.0)
├── schemas/
│   └── employee.py          ← EmployeeCreate, EmployeeUpdate, EmployeeResponse
├── crud/
│   └── employee.py          ← GenericCRUD(Employee)
├── routers/
│   └── employee.py          ← /api/employees (نفس الـ API surface!)
├── services/
│   └── employee_service.py  ← business logic إضافية
└── events/
    └── handlers.py          → مشتركو الأحداث
```

### 3.3 الحفاظ على API surface

```python
# modules/hr/routers/employee.py
router = APIRouter(prefix="/api/employees", tags=["employees"])
# نفس الـ endpoints بالضبط — لا تغيير في الـ URL أو الـ response shape
```

### 3.4 Ports المقدمة من hr

```python
# في HRModule.__init__
self.add_port(ConnectorPort(
    name="employee.get_by_id",
    module=self.name,
    handler=self._get_employee_by_id,
    description="الحصول على موظف بواسطة ID"
))

self.add_port(ConnectorPort(
    name="employee.list_by_department",
    module=self.name,
    handler=self._list_by_department,
    description="قائمة موظفي قسم معين"
))
```

---

## 4. الحفاظ على `GenericCRUD` داخل كل Module

### 4.1 لماذا GenericCRUD هو جوهر التصميم

- 114 سطر — تعمل بكفاءة عالية
- تدعم: list (مع search, filter, sort, pagination), get, create, update, delete, bulk_delete
- مدمج مع AuditLog تلقائياً
- نحتفظ عليها **كما هي** — لا نعيد اختراع العجلة

### 4.2 مكان GenericCRUD في LEGO v2

```
core/
└── crud.py                  ← GenericCRUD (نفس الملف بالضبط)
```

### 4.3 كيف يستخدم كل module GenericCRUD

```python
# modules/engineering/crud/project.py
from core.crud import GenericCRUD
from modules.engineering.models.project import Project

project_crud = GenericCRUD(Project)

# modules/engineering/routers/project.py
from modules.engineering.crud.project import project_crud

@router.get("/")
async def list_projects(db=Depends(get_db), ...):
    return await project_crud.list(
        db, search=search, search_fields=SEARCH_FIELDS,
        page=page, limit=limit, sort_by=sort_by, sort_order=sort_order,
        filters={"status": status, "project_type": project_type}
    )
```

### 4.4 Audit Logs — cross-module

GenericCRUD تستخدم `AuditLog` من `core.audit`. هذا يعني:
- أي create/update/delete في أي module يُسجّل تلقائياً
- لا حاجة لتعديل GenericCRUD
- AuditLog table يبقى في `core` (shared infrastructure)

---

## 5. `EventBus` بين Modules

### 5.1 المبدأ

- لا import مباشر بين modules للـ side effects
- module ينشر event → EventBus → modules المشتركة تستجيب
- Pattern: **Publish/Subscribe** غير متزامن

### 5.2 أمثلة Events

| Event | Publisher | Subscribers | Action |
|-------|-----------|-------------|--------|
| `project.created` | engineering | hr, finance, notifications | إنشاء سجل مبدئي |
| `project.completed` | engineering | finance | إغلاق حساب المشروع |
| `payment_certificate.approved` | engineering | finance | إنشاء سند صرف |
| `drawing.approved` | engineering | notifications | إرسال إشعار للفريق |
| `employee.created` | hr | auth | إنشاء user account |
| `user.login_failed` | auth | notifications, audit | تسجيل محاولة فاشلة |

### 5.3 مثال: `project.created` → notification

```python
# modules/engineering/routers/project.py
@router.post("/")
async def create_project(data: ProjectCreate, db=Depends(get_db), user=Depends(require_role(...))):
    project = await project_crud.create(db, data, actor_id=user.id)
    
    # نشر الحدث
    await engineering_module.emit_event(
        "project.created",
        payload={
            "project_id": project.id,
            "project_name": project.name,
            "created_by": user.id,
            "timestamp": datetime.now().isoformat()
        },
        priority=EventPriority.NORMAL
    )
    
    return project
```

```python
# modules/notifications/events/handlers.py
from core.lego_v2.event_bus import event_bus, Event

async def on_project_created(event: Event):
    project_id = event.payload["project_id"]
    project_name = event.payload["project_name"]
    
    # إنشاء إشعار في قاعدة البيانات
    await create_notification(
        title=f"مشروع جديد: {project_name}",
        body=f"تم إنشاء المشروع #{project_id}",
        recipients=["admin", "engineer"]
    )

# تسجيل المشترك
event_bus.subscribe("project.created", on_project_created)
```

### 5.4 EventBus في `BaseModule`

```python
class BaseModule:
    async def emit_event(self, event_name: str, payload: dict, priority=EventPriority.NORMAL):
        event = Event(
            name=event_name,
            payload=payload,
            source_module=self.name,
            timestamp=datetime.now(),
            priority=priority
        )
        await self.event_bus.publish(event)
```

---

## 6. `Connectors` بين Modules

### 6.1 المبدأ

- **Synchronous request/response** بين modules
- module A يحتاج بيانات من module B → يستدعي Connector
- لا import مباشر — يمر عبر `ConnectorRegistry`

### 6.2 أمثلة Connectors

| Caller | Adapter | Target Port | Use Case |
|--------|---------|-------------|----------|
| engineering | `hr.employee.get_by_id` | hr.employee.get_by_id | عرض اسم المهندس في المشروع |
| engineering | `hr.employee.list_by_department` | hr.employee.list_by_department | قائمة مهندسي المكتب الفني |
| finance | `engineering.project.get_by_id` | engineering.project.get_by_id | ربط سند الصرف بمشروع |
| finance | `engineering.contract.get_by_project` | engineering.contract.get_by_project | حساب قيمة العقد |
| notifications | `auth.user.get_by_id` | auth.user.get_by_id | إرسال إشعار لمستخدم |

### 6.3 مثال: engineering يستدعي hr.get_employee

```python
# modules/engineering/__init__.py
class EngineeringModule(BaseModule):
    def __init__(self):
        super().__init__()
        
        # Adapter: ما نحتاجه من hr
        self.add_adapter(ConnectorAdapter(
            name="employee_lookup",
            target_module="hr",
            target_port="employee.get_by_id",
            fallback_handler=self._fallback_employee  # إذا hr غير متوفر
        ))

    def _fallback_employee(self, employee_id: int):
        return {"id": employee_id, "full_name": "Unknown Employee"}
```

```python
# modules/engineering/routers/project.py
from core.lego_v2.connectors import connector_registry

@router.get("/{project_id}/team")
async def get_project_team(project_id: int, db=Depends(get_db)):
    project = await project_crud.get(db, project_id)
    
    # استدعاء hr عبر Connector
    pm = connector_registry.call("hr", "employee.get_by_id", employee_id=project.project_manager_id)
    
    return {
        "project": project,
        "project_manager": pm
    }
```

### 6.4 ConnectorRegistry — API

```python
# تسجيل port (في module المقدم)
connector_registry.register_port(ConnectorPort(
    name="employee.get_by_id",
    module="hr",
    handler=hr_module._get_employee_by_id,
    description="..."
))

# استدعاء port (في module المستفيد)
result = connector_registry.call("hr", "employee.get_by_id", employee_id=42)
```

---

## 7. الحفاظ على API Surface متطابق (Frontend لا يتأثر)

### 7.1 الاستراتيجية: Router Prefix Mapping

| Legacy Endpoint | LEGO v2 Router | Prefix | الحالة |
|-----------------|----------------|--------|--------|
| `GET /api/projects` | engineering | `/api/projects` | ✅ نفسه |
| `GET /api/employees` | hr | `/api/employees` | ✅ نفسه |
| `POST /api/auth/login` | auth | `/api/auth/login` | ✅ نفسه |
| `GET /api/contractors` | engineering | `/api/contractors` | ✅ نفسه |
| `POST /api/upload` | core | `/api/upload` | ✅ نفسه |

### 7.2 آلية التسجيل في FastAPI

```python
# main.py (الجديد)
from fastapi import FastAPI
from core.lego_v2.registry import registry

app = FastAPI(...)

# تسجيل جميع modules
from modules.auth import auth_module
from modules.hr import hr_module
from modules.engineering import engineering_module
from modules.core import core_module

for module in [auth_module, hr_module, engineering_module, core_module]:
    module.register()

# تثبيت جميع routers
for router in registry.get_all_routers():
    app.include_router(router)

# التحقق من dependencies
errors = registry.check_dependencies()
if errors:
    raise RuntimeError(f"Module dependency errors: {errors}")
```

### 7.3 Response Shape

- **لا تغيير** في شكل الـ response
- `GenericCRUD.list()` تُرجع `PaginatedResponse` (نفس الشكل)
- `GenericCRUD.get()` تُرجع dict (نفس الشكل بفضل `_to_dict()`)
- Frontend يتوقع نفس الـ JSON structure بالضبط

### 7.4 CORS + Static Files

```python
# main.py
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
```

---

## 8. خطة المجلدات الجديدة

### 8.1 الهيكل الكامل

```
engineering-management-system-3/
│
├── core/                          # Shared infrastructure
│   ├── lego_v2/                   # LEGO v2 framework
│   │   ├── registry/
│   │   │   └── module_registry.py
│   │   ├── event_bus/
│   │   │   └── event_bus.py
│   │   ├── connectors/
│   │   │   └── connector_registry.py
│   │   └── shared/
│   │       └── base_module.py
│   ├── crud.py                    # GenericCRUD (من Legacy)
│   ├── audit.py                   # AuditLog (من Legacy)
│   ├── base.py                    # SQLAlchemy Base + TimestampMixin
│   ├── schemas.py                 # PaginatedResponse, BulkDeleteRequest
│   ├── upload.py                  # File upload router
│   ├── export.py                  # Export functionality
│   └── search.py                  # Global search
│
├── modules/                       # All business modules
│   ├── __init__.py
│   ├── auth/                      # Auth + RBAC module
│   │   ├── __init__.py            # AuthModule(BaseModule)
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── token.py
│   │   ├── crud/
│   │   │   └── user.py
│   │   ├── routers/
│   │   │   └── auth.py            # /api/auth/*
│   │   ├── dependencies.py        # get_current_user, require_role
│   │   ├── utils.py               # JWT, password hash
│   │   └── events/
│   │       └── handlers.py
│   │
│   ├── hr/                        # Human Resources module
│   │   ├── __init__.py            # HRModule(BaseModule)
│   │   ├── models/
│   │   │   └── employee.py
│   │   ├── schemas/
│   │   │   └── employee.py
│   │   ├── crud/
│   │   │   └── employee.py        # GenericCRUD(Employee)
│   │   ├── routers/
│   │   │   └── employee.py        # /api/employees/*
│   │   ├── services/
│   │   │   └── employee_service.py
│   │   └── events/
│   │       └── handlers.py
│   │
│   ├── engineering/               # Engineering module (المكتب الفني)
│   │   ├── __init__.py            # EngineeringModule(BaseModule)
│   │   ├── models/
│   │   │   ├── contractor.py
│   │   │   ├── project.py
│   │   │   ├── phase.py
│   │   │   ├── code.py
│   │   │   ├── work_order.py
│   │   │   ├── work_order_item.py
│   │   │   ├── drawing.py
│   │   │   ├── drawing_revision.py
│   │   │   ├── document.py
│   │   │   └── payment_certificate.py
│   │   ├── schemas/
│   │   │   └── (نفس الملفات)
│   │   ├── crud/
│   │   │   └── (GenericCRUD instances)
│   │   ├── routers/
│   │   │   └── (نفس api.py — مع تعديل imports)
│   │   ├── services/
│   │   │   └── (business logic)
│   │   └── events/
│   │       └── handlers.py
│   │
│   ├── finance/                   # Finance module (مستقبلي)
│   │   └── __init__.py
│   │
│   └── inventory/                 # Inventory module (مستقبلي)
│       └── __init__.py
│
├── db/                            # Database
│   ├── migrations/                # Alembic migrations
│   │   └── (من Legacy)
│   └── seeds/
│       └── (seed data)
│
├── tests/                         # Tests
│   ├── core/                      # Tests for GenericCRUD, EventBus, Connectors
│   ├── modules/                   # Tests per module
│   │   ├── test_auth.py
│   │   ├── test_hr.py
│   │   └── test_engineering.py
│   └── conftest.py                # Shared fixtures (db session, client)
│
├── doc/                           # Documentation
│   ├── architecture/
│   │   ├── LEGO_v2_SPEC.md
│   │   └── LEGACY_MERGE_PLAN.md   # هذا الملف
│   ├── api/
│   └── modules/
│
├── main.py                        # FastAPI app entry point
├── pyproject.toml                 # Dependencies
└── README.md
```

### 8.2 قواعد التسمية

| المستوى | القاعدة | مثال |
|---------|--------|------|
| Module folder | lowercase | `modules/engineering/` |
| Model file | snake_case | `project.py` |
| Router file | snake_case | `project.py` |
| Schema file | snake_case | `project.py` |
| Table name | snake_case + prefix | `eng_projects`, `hr_employees`, `auth_users` |
| Event name | `domain.action` | `project.created`, `payment_certificate.approved` |
| Port name | `entity.action` | `project.get_by_id`, `employee.list_by_department` |

### 8.3 Database Schema Namespacing

لتجنب تضارب أسماء الجداول:

```python
# engineering/models/project.py
class Project(Base, TimestampMixin):
    __tablename__ = "eng_projects"   # prefix = module name

# hr/models/employee.py
class Employee(Base, TimestampMixin):
    __tablename__ = "hr_employees"

# auth/models/user.py
class User(Base, TimestampMixin):
    __tablename__ = "auth_users"
```

---

## 9. خطة التنفيذ (Execution Plan)

### Phase 1: Foundation (أسبوع 1)
1. نقل `core/crud.py`, `core/audit.py`, `core/base.py` من Legacy
2. إنشاء `modules/auth/` (نقل كامل)
3. إنشاء `modules/hr/` (نقل employees)
4. إنشاء `modules/core/` (upload, export)
5. تعديل `main.py` ليستخدم `ModuleRegistry`

### Phase 2: Engineering Module (أسبوع 2)
1. نقل جميع engineering entities إلى `modules/engineering/`
2. تعديل imports
3. تسجيل في `EngineeringModule`
4. إضافة Ports و Adapters

### Phase 3: EventBus + Connectors (أسبوع 3)
1. تسجيل جميع Events
2. كتابة Event Handlers
3. تسجيل جميع Ports
4. اختبار cross-module calls

### Phase 4: API Compatibility + Tests (أسبوع 4)
1. تشغيل Frontend ضد الـ API الجديد
2. تشغيل Legacy tests
3. إضافة tests جديدة للـ modules
4. Performance testing

---

## 10. المخاطر والحلول

| المخاطر | الاحتمال | التأثير | الحل |
|---------|----------|---------|------|
| Breaking API changes | منخفض | عالٍ | Router prefix mapping + response shape freeze |
| Auth regression | منخفض | عالٍ | Agent D pre-flight gate + test_auth.py |
| DB migration فشل | متوسط | عالٍ | Alembic gradual migration + SQLite → PostgreSQL |
| Performance degradation | منخفض | متوسط | GenericCRUD optimization + connection pooling |
| Module circular dependency | منخفض | متوسط | Dependency graph validation في Registry |

---

## 11. القرارات المؤكدة

| القرار | الحالة | السبب |
|--------|--------|-------|
| SQLAlchemy 2.0 (لا SQLModel) | ✅ مؤكد | تكلفة migration عالية، فائدة قليلة |
| GenericCRUD | ✅ مؤكد | أقوى أصول المشروع — 114 سطر فعّالة |
| Async | ✅ مؤكد | SQLAlchemy async + aiosqlite/aiopg |
| LEGO v2 as layer | ✅ مؤكد | لا نستبدل، نبني فوق |
| Module self-registration | ✅ مؤكد | كل module يسجّل نفسه في Registry |
| PostgreSQL تدريجياً | ✅ مؤكد | SQLite → PostgreSQL عبر Alembic |

---

**Document Version**: 1.0  
**Author**: Agent B (Solutions Architect)  
**Date**: 2026-06-09  
**Status**: Approved for implementation
