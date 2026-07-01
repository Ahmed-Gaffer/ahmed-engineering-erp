# DECISION LOG — Engineering Management System

> **Note:** The original file contained Arabic text that was corrupted by a UTF-8 encoding error (Mojibake). All non-ASCII bytes were replaced with `?`, making the original Arabic content unrecoverable. This clean replacement preserves the document structure and English content.
>
> **Restored:** 2026-07-01

## Document Date: 2026-06-16

---

## 1. Comparison of Old vs New System Architecture

### Old System (`engineering-management-system`)
**Architecture**: Monolith
**Status**: Legacy

| Component | Status |
|-----------|--------|
| Backend (FastAPI + SQLAlchemy Async) | 10 Entities + GenericCRUD |
| Auth + RBAC (JWT + bcrypt) | admin, engineer, viewer roles |
| Audit Logs | Automatic CRUD logging |
| File Upload | 13 endpoints for file handling |
| Export to Excel | Per-entity export |
| Global Search | Contractors, Projects, Employees |
| Notifications | CRUD + unread count |
| Activities Feed | User action tracking |
| Frontend (React 19 + MUI 9 + Vite) | i18n/RTL, Dark Mode, Dashboard |
| Tests (pytest) | 39 tests |
| Alembic Migrations | Schema migrations |
| Modular Architecture | Modular structure |

### New System (`engineering-management-system-3`) — Active Development
**Architecture**: Modular Monolith (LEGO v2)
**Status**: Migration in progress

| Component | Status |
|-----------|--------|
| LEGO v2 Core | ModuleRegistry + EventBus + Connectors |
| Old Backend Legacy | `backend/app/` preserved |
| Frontend Legacy | `frontend/` without node_modules |
| Modules Wrappers | engineering, auth, hr, contractors, core |
| Integration | Pending connection setup |

---

## 2. Critical Issues Found During Migration

### Issue 1: StaticFiles mount conflicts with API routes
**Problem**: `app.mount("/", StaticFiles(html=True))` intercepts all requests
**Cause**: Missing catch-all route before StaticFiles mount at `/`
**Location**: `main.py`

### Issue 2: Double import of Base module
**Problem**: `main.py` imports `from backend.app.core.base import Base` while modules use `from app.core.base import Base` — Python treats these as different modules
**Consequence**: `Base.metadata` becomes empty, tables are not created
**Solution**: Standardize all imports to `from app.xxx import xxx` (add `backend/` prefix to sys.path)
**Location**: `main.py`

### Issue 3: Missing/Obsolute Dependencies
**Problem**: `pyproject.toml` lists `psycopg2`, `sqlmodel`, `passlib` (incorrect/unused) and is missing `aiosqlite`, `pyjwt`, `bcrypt` (required at runtime)
**Solution**: Sync `pyproject.toml` with `backend/requirements.txt`

---

## 3. Current Project Structure

```
engineering-management-system-3/
├── main.py                  # Entry point: LEGO v2 + Legacy backend
├── core/lego_v2/            # LEGO v2 framework
│   ├── registry/
│   ├── connectors/
│   ├── event_bus/
│   └── shared/
├── modules/                 # Business modules
│   ├── engineering/         # 10 entities
│   ├── auth/                # JWT + RBAC
│   ├── hr/                  # Employees
│   ├── contractors/         # Contractors
│   └── core/                # Export, Search, Audit
├── backend/app/             # Legacy backend (10 entities)
├── frontend/                # React SPA
├── tests/                   # 39/39 passing
└── .env                     # SQLite config
```

### API Endpoints: 80 routes + Health + SPA
### Entities: 10 (contractors, projects, phases, codes, work_orders, work_order_items, drawings, drawing_revisions, documents, payment_certificates, employees)

---

## 4. Architecture Decisions

### Decision 1: Keep Legacy Backend Running As-Is
**Rationale**: All 39 existing tests pass. Modifying the legacy backend would risk breaking working functionality.

### Decision 2: LEGO v2 Wraps Rather Than Replaces (Facade)
**Rationale**: The new architecture wraps legacy entities rather than migrating them immediately, allowing incremental adoption.

### Decision 3: SQLite Now, Migrate to PostgreSQL Later
**Rationale**: Faster development iteration. Switch to PostgreSQL by updating `.env` when ready for production.

### Decision 4: Frontend Handled via catch-all Route
**Rationale**: `StaticFiles mount` at `/` serves the SPA while API routes under `/api/` remain accessible.

---

## 5. Implementation Roadmap (Prioritized)

| Priority | Task |
|----------|------|
| P0 Critical | Complete HR Module (models + API + UI) |
| P0 Critical | Wire EventBus between Engineering and HR |
| P1 High | Integrate Alembic Migrations properly |
| P1 High | Build Dashboard with real metrics |
| P2 Medium | Migrate to PostgreSQL |
| P2 Medium | Docker Compose for full deployment |

---

## 6. Development Commands

```bash
cd "E:\Project Path\engineering-management-system-3"
pip install -e ".[dev]"
uvicorn main:app --reload --port 8000
```

### Login:
- **URL**: http://localhost:8000
- **Username**: `admin`
- **Password**: `admin123`
- **API Docs**: http://localhost:8000/docs

### Run Tests:
```bash
$env:PYTHONPATH="backend"
pytest backend/tests/ -v
```
