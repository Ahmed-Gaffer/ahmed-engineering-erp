# LEGO v2 — Legacy Merge Plan (Agent B: Solutions Architect)

> **Note:** The original file contained Arabic text that was corrupted by a UTF-8 encoding error (Mojibake). All non-ASCII bytes were replaced with `?`, making the original Arabic content unrecoverable. This clean replacement preserves the document structure and English content.
>
> **Restored:** 2026-07-01

## Executive Summary

The existing project (`engineering-management-system`) is a working monolith being migrated to the **LEGO v2 modular architecture** with these key technologies:
- SQLAlchemy 2.0 (SQLModel migration planned)
- GenericCRUD (114 methods across all entities)
- Async with `AsyncSession`
- API surface 100% preserved (Frontend unchanged)
- Auth + RBAC + Audit logs + File upload

Migration strategy: **Layer-based** — wrap LEGO v2 infrastructure around existing components without breaking the working system.

---

## 1. Convert Each Entity Folder into a `LegoModule`

### 1.1 Current Structure (Legacy)

```
backend/app/
├── contractors/     -> models.py, schemas.py, crud.py, api.py
├── projects/        -> models.py, schemas.py, crud.py, api.py
├── phases/          -> models.py, schemas.py, crud.py, api.py
├── codes/           -> models.py, schemas.py, crud.py, api.py
├── work_orders/     -> models.py, schemas.py, crud.py, api.py
├── work_order_items/ -> models.py, schemas.py, crud.py, api.py
├── drawings/        -> models.py, schemas.py, crud.py, api.py
├── drawing_revisions/ -> models.py, schemas.py, crud.py, api.py
├── documents/       -> models.py, schemas.py, crud.py, api.py
├── payment_certificates/ -> models.py, schemas.py, crud.py, api.py
├── employees/       -> models.py, schemas.py, crud.py, api.py
├── auth/            -> models.py, schemas.py, crud.py, api.py, utils.py
└── core/            -> crud.py (GenericCRUD), base.py, audit.py, schemas.py
```

### 1.2 Target Structure (LEGO v2)

```
modules/
├── engineering/
│   ├── __init__.py          -> EngineeringModule(BaseModule)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── project.py       -> from projects/models.py (SQLAlchemy 2.0)
│   │   ├── phase.py         -> from phases/models.py
│   │   ├── code.py          -> from codes/models.py
│   │   ├── work_order.py    -> from work_orders/models.py
│   │   ├── work_order_item.py -> from work_order_items/models.py
│   │   ├── drawing.py       -> from drawings/models.py
│   │   ├── drawing_revision.py -> from drawing_revisions/models.py
│   │   ├── document.py      -> from documents/models.py
│   │   ├── payment_certificate.py -> from payment_certificates/models.py
│   │   └── contractor.py    -> from contractors/models.py
│   ├── schemas/
│   │   └── (Pydantic v2 models)
│   ├── crud/
│   │   └── (GenericCRUD instances per entity)
│   ├── routers/
│   │   └── (api.py adapted with module prefix)
│   ├── services/
│   │   └── (business logic extracted from routers)
│   └── events/
│       └── handlers.py      -> EventBus subscribers
├── hr/
│   ├── __init__.py          -> HRModule(BaseModule)
│   ├── models/
│   │   └── employee.py      -> from employees/models.py
│   ├── schemas/
│   ├── crud/
│   ├── routers/
│   └── events/
├── auth/
│   ├── __init__.py          -> AuthModule(BaseModule)
│   ├── models/
│   │   └── user.py          -> from auth/models.py
│   ├── schemas/
│   ├── crud/
│   ├── routers/
│   │   └── auth.py          -> from auth/api.py
│   ├── dependencies.py      -> from app/dependencies.py (get_current_user, require_role)
└── core/
    ├── __init__.py          -> CoreModule(BaseModule)
    ├── crud.py              -> from app/core/crud.py (GenericCRUD)
    ├── audit.py             -> from app/core/audit.py
    ├── base.py              -> from app/core/base.py (SQLAlchemy Base)
    ├── upload.py            -> from app/upload.py
    └── export.py            -> from app/core/export.py
```

### 1.3 Migration Steps

For each entity folder in Legacy:

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Split `models.py` | `modules/<module>/models/<entity>.py` |
| 2 | Split `schemas.py` | `modules/<module>/schemas/<entity>.py` |
| 3 | Split `api.py` | `modules/<module>/routers/<entity>.py` |
| 4 | Split `crud.py` | `modules/<module>/crud/<entity>.py` (GenericCRUD) |
| 5 | Rewrite imports | `from app.X.models` -> `from modules.<module>.models.X` |
| 6 | Register in `__init__.py` | `add_model()`, `add_router()`, `add_event()` |

### 1.4 `EngineeringModule.__init__.py` — Example Implementation

```python
class EngineeringModule(BaseModule):
    name = "engineering"
    version = "1.0.0"
    dependencies = ["auth"]  # auth required for RBAC

    def __init__(self):
        super().__init__()

        # Routers
        self.add_router(contractor_router)   # prefix=/api/contractors
        self.add_router(project_router)      # prefix=/api/projects
        self.add_router(phase_router)        # prefix=/api/phases
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

## 2. Convert `auth` into a Module

### 2.1 Rationale for Auth as a Module

- Auth is a **cross-cutting concern** — all modules depend on it
- RBAC must work cross-module (engineering uses `require_role("engineer")`)
- JWT validation centralised in a single module

### 2.2 `auth` Module Structure

```
modules/auth/
├── __init__.py              -> AuthModule(BaseModule)
├── models/
│   └── user.py              -> User model (SQLAlchemy 2.0)
├── schemas/
│   ├── user.py              -> UserCreate, UserLogin, UserResponse
│   └── token.py             -> TokenPayload
├── crud/
│   └── user.py              -> register_user, login_user
├── routers/
│   └── auth.py              -> /api/auth/register, /api/auth/login, /api/auth/me
├── dependencies.py          -> get_current_user, require_role
├── utils.py                 -> JWT encode/decode, password hash
└── events/
    └── handlers.py          -> user.created, user.login_failed
```

### 2.3 RBAC Cross-Module Usage

```python
# modules/auth/dependencies.py
from fastapi import Depends, HTTPException
from modules.auth.utils import decode_token, get_user_by_id

async def get_current_user(credentials=Depends(HTTPBearer()), db=Depends(get_db)):
    ...  # Token validation logic

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

### 2.4 Auth Module Registration

```python
class AuthModule(BaseModule):
    name = "auth"
    version = "1.0.0"
    dependencies = []  # auth depends on nothing

    def __init__(self):
        super().__init__()
        self.add_router(auth_router)
        self.add_model(User)

        # Port: expose user lookup to other modules
        self.add_port(ConnectorPort(
            name="user.get_by_id",
            module=self.name,
            handler=self._get_user_by_id,
            description="Lookup user by ID"
        ))

        self.add_port(ConnectorPort(
            name="user.verify_token",
            module=self.name,
            handler=self._verify_token,
            description="Verify a JWT token"
        ))
```

---

## 3. Convert `employees` into `hr` Module

### 3.1 Rationale for employees -> hr

- `employees` was a lightweight entity in Legacy
- Under LEGO v2, `hr` module manages a broader domain:
  - employees (core entity)
  - attendance (time tracking)
  - payroll (salary management)
  - leave_requests (vacation tracking)
- Engineering module accesses `hr.get_employee` via Connector

### 3.2 `hr` Module Structure

```
modules/hr/
├── __init__.py              -> HRModule(BaseModule)
├── models/
│   └── employee.py          -> Employee model (SQLAlchemy 2.0)
├── schemas/
│   └── employee.py          -> EmployeeCreate, EmployeeUpdate, EmployeeResponse
├── crud/
│   └── employee.py          -> GenericCRUD(Employee)
├── routers/
│   └── employee.py          -> /api/employees (preserving API surface)
├── services/
│   └── employee_service.py  -> business logic layer
└── events/
    └── handlers.py          -> Event subscribers
```

### 3.3 Preserving the API Surface

```python
# modules/hr/routers/employee.py
router = APIRouter(prefix="/api/employees", tags=["employees"])
# All existing endpoints preserved with same URL and response shape
```

### 3.4 Ports Exposed by hr

```python
# Inside HRModule.__init__
self.add_port(ConnectorPort(
    name="employee.get_by_id",
    module=self.name,
    handler=self._get_employee_by_id,
    description="Lookup employee by ID"
))

self.add_port(ConnectorPort(
    name="employee.list_by_department",
    module=self.name,
    handler=self._list_by_department,
    description="List employees by department"
))
```

---

## 4. Adapt `GenericCRUD` for Module Use

### 4.1 Rationale for GenericCRUD Adaptation

- 114 methods across all entity types
- Features: list (with search, filter, sort, pagination), get, create, update, delete, bulk_delete
- Integrated AuditLog on mutations
- Needs to work as a **shared instance** across all modules

### 4.2 GenericCRUD Location in LEGO v2

```
core/
└── crud.py                  -> GenericCRUD (preserved from Legacy)
```

### 4.3 Per-Module GenericCRUD Usage

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

### 4.4 Audit Logs as Cross-Module Concern

GenericCRUD automatically writes `AuditLog` via `core.audit`:
- All create/update/delete operations across every module
- Centralised in GenericCRUD
- AuditLog table owned by `core` (shared infrastructure)

---

## 5. `EventBus` Between Modules

### 5.1 Concept

- No direct imports between modules to avoid side effects
- A module publishes an event on EventBus; other modules subscribe asynchronously
- Pattern: **Publish/Subscribe** with typed events

### 5.2 Defined Events

| Event | Publisher | Subscribers | Action |
|-------|-----------|-------------|--------|
| `project.created` | engineering | hr, finance, notifications | Assign team members |
| `project.completed` | engineering | finance | Finalise billing |
| `payment_certificate.approved` | engineering | finance | Trigger payment |
| `drawing.approved` | engineering | notifications | Notify stakeholders |
| `employee.created` | hr | auth | Create user account |
| `user.login_failed` | auth | notifications, audit | Security alert |

### 5.3 Example: `project.created` -> Notification

```python
# modules/engineering/routers/project.py
@router.post("/")
async def create_project(data: ProjectCreate, db=Depends(get_db), user=Depends(require_role(...))):
    project = await project_crud.create(db, data, actor_id=user.id)

    # Fire event
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

    # Create notification for relevant users
    await create_notification(
        title=f"New Project: {project_name}",
        body=f"Project #{project_id} has been created",
        recipients=["admin", "engineer"]
    )

# Register subscriber
event_bus.subscribe("project.created", on_project_created)
```

### 5.4 EventBus Integration in `BaseModule`

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

## 6. `Connectors` Between Modules

### 6.1 Concept

- **Synchronous request/response** between modules
- Module A invokes a capability from Module B via Connector
- No direct imports — resolved through `ConnectorRegistry`

### 6.2 Defined Connectors

| Caller | Adapter | Target Port | Use Case |
|--------|---------|-------------|----------|
| engineering | `hr.employee.get_by_id` | hr.employee.get_by_id | Get project manager details |
| engineering | `hr.employee.list_by_department` | hr.employee.list_by_department | List team members |
| finance | `engineering.project.get_by_id` | engineering.project.get_by_id | Check project budget |
| finance | `engineering.contract.get_by_project` | engineering.contract.get_by_project | Get contract details |
| notifications | `auth.user.get_by_id` | auth.user.get_by_id | Get notification recipient |

### 6.3 Example: Engineering Uses hr.get_employee

```python
# modules/engineering/__init__.py
class EngineeringModule(BaseModule):
    def __init__(self):
        super().__init__()

        # Adapter: declare dependency on hr
        self.add_adapter(ConnectorAdapter(
            name="employee_lookup",
            target_module="hr",
            target_port="employee.get_by_id",
            fallback_handler=self._fallback_employee  # if hr unavailable
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

    # Call hr through Connector
    pm = connector_registry.call("hr", "employee.get_by_id", employee_id=project.project_manager_id)

    return {
        "project": project,
        "project_manager": pm
    }
```

### 6.4 ConnectorRegistry API

```python
# Register a port (inside module providing it)
connector_registry.register_port(ConnectorPort(
    name="employee.get_by_id",
    module="hr",
    handler=hr_module._get_employee_by_id,
    description="..."
))

# Call a port (from consuming module)
result = connector_registry.call("hr", "employee.get_by_id", employee_id=42)
```

---

## 7. Preserving API Surface (Frontend Unchanged)

### 7.1 Strategy: Router Prefix Mapping

| Legacy Endpoint | LEGO v2 Router | Prefix | Status |
|-----------------|----------------|--------|--------|
| `GET /api/projects` | engineering | `/api/projects` | Preserved |
| `GET /api/employees` | hr | `/api/employees` | Preserved |
| `POST /api/auth/login` | auth | `/api/auth/login` | Preserved |
| `GET /api/contractors` | engineering | `/api/contractors` | Preserved |
| `POST /api/upload` | core | `/api/upload` | Preserved |

### 7.2 Module Registration in FastAPI

```python
# main.py (simplified)
from fastapi import FastAPI
from core.lego_v2.registry import registry

app = FastAPI(...)

# Register all modules
from modules.auth import auth_module
from modules.hr import hr_module
from modules.engineering import engineering_module
from modules.core import core_module

for module in [auth_module, hr_module, engineering_module, core_module]:
    module.register()

# Mount all module routers
for router in registry.get_all_routers():
    app.include_router(router)

# Validate dependencies
errors = registry.check_dependencies()
if errors:
    raise RuntimeError(f"Module dependency errors: {errors}")
```

### 7.3 Response Shape

- **All endpoints** return the same response as before
- `GenericCRUD.list()` returns `PaginatedResponse` (same pagination)
- `GenericCRUD.get()` returns dict (same schema via `_to_dict()`)
- Frontend requires zero changes to JSON parsing

### 7.4 CORS + Static Files

```python
# main.py
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
```

---

## 8. Project Directory Structure

### 8.1 Full LEGO v2 Layout

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
│   ├── crud.py                    # GenericCRUD (from Legacy)
│   ├── audit.py                   # AuditLog (from Legacy)
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
│   ├── engineering/               # Engineering module (largest)
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
│   │   │   └── (Pydantic v2 models)
│   │   ├── crud/
│   │   │   └── (GenericCRUD instances)
│   │   ├── routers/
│   │   │   └── (api.py adapted with module imports)
│   │   ├── services/
│   │   │   └── (business logic)
│   │   └── events/
│   │       └── handlers.py
│   │
│   ├── finance/                   # Finance module (future)
│   │   └── __init__.py
│   │
│   └── inventory/                 # Inventory module (future)
│       └── __init__.py
│
├── db/                            # Database
│   ├── migrations/                # Alembic migrations
│   │   └── (from Legacy)
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
│   │   └── LEGACY_MERGE_PLAN.md   # This document
│   ├── api/
│   └── modules/
│
├── main.py                        # FastAPI app entry point
├── pyproject.toml                 # Dependencies
└── README.md
```

### 8.2 Naming Conventions

| Convention | Rule | Example |
|------------|------|---------|
| Module folder | lowercase | `modules/engineering/` |
| Model file | snake_case | `project.py` |
| Router file | snake_case | `project.py` |
| Schema file | snake_case | `project.py` |
| Table name | snake_case + prefix | `eng_projects`, `hr_employees`, `auth_users` |
| Event name | `domain.action` | `project.created`, `payment_certificate.approved` |
| Port name | `entity.action` | `project.get_by_id`, `employee.list_by_department` |

### 8.3 Database Schema Namespacing

Prevent table name collisions with module prefixes:

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

## 9. Execution Plan

### Phase 1: Foundation (Week 1)
1. Extract `core/crud.py`, `core/audit.py`, `core/base.py` from Legacy
2. Build `modules/auth/` (highest priority)
3. Build `modules/hr/` (employees only)
4. Build `modules/core/` (upload, export)
5. Rewrite `main.py` to use `ModuleRegistry`

### Phase 2: Engineering Module (Week 2)
1. Migrate all engineering entities to `modules/engineering/`
2. Rewrite imports
3. Wire up `EngineeringModule`
4. Configure Ports and Adapters

### Phase 3: EventBus + Connectors (Week 3)
1. Implement Events
2. Wire Event Handlers
3. Implement Ports
4. Validate cross-module calls

### Phase 4: API Compatibility + Tests (Week 4)
1. Validate Frontend against new API responses
2. Re-run Legacy tests
3. Add tests for new modules
4. Performance testing

---

## 10. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking API changes | Medium | High | Router prefix mapping + response shape freeze |
| Auth regression | Medium | High | Agent D pre-flight gate + test_auth.py |
| DB migration errors | Low | High | Alembic gradual migration + SQLite -> PostgreSQL |
| Performance degradation | Medium | Medium | GenericCRUD optimization + connection pooling |
| Module circular dependency | Medium | Medium | Dependency graph validation in Registry |

---

## 11. Technology Decisions Summary

| Decision | Status | Rationale |
|----------|--------|-----------|
| SQLAlchemy 2.0 (not SQLModel) | Approved | Flexible migration path without ORM lock-in |
| GenericCRUD | Approved | Single source of truth for 114 methods |
| Async | Approved | SQLAlchemy async + aiosqlite/aiopg |
| LEGO v2 as layer | Approved | Non-invasive wrapper around working code |
| Module self-registration | Approved | Each module registers itself with Registry |
| PostgreSQL readiness | Approved | SQLite -> PostgreSQL via Alembic |

---

**Document Version**: 1.0
**Author**: Agent B (Solutions Architect)
**Date**: 2026-06-09
**Status**: Approved for implementation
