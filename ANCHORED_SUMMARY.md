# Anchored Summary — Engineering Management System

_Last updated: 2026-06-24 | Branch: `develop`_

## Project Status

**ERP System for Negida Contracting Co.** — engineering project management covering contracts, BOQ, IPCs, drawings, documents, schedules, workflow, variation orders, RFIs, and EVM.

## Architecture

- **Backend:** FastAPI + SQLAlchemy async + PostgreSQL (SQLite fallback)
- **Frontend:** React 18 + MUI 5 + Recharts + Framer Motion + i18n (AR/EN)
- **Key libs:** ReportLab (PDF), openpyxl (Excel), APScheduler (tasks), python-multipart

## What Has Been Built

### Phase 1 — IPC Overhaul ✅
- IPCHeader/IPCDetail models with financial calculations
- IPC PDF export via ReportLab
- IPC Excel export via openpyxl
- Full CRUD + status workflow (draft → submitted → approved → paid)

### Phase 2 — Gantt Chart & Scheduling ✅
- Schedule model with tasks, progress, dependencies
- GanttChart component (Milestone, Task, Critical Path bars)
- Full schedules page with CRUD

### Phase 3 — Workflow Engine ✅
- WorkflowLog model + approval action API
- WorkflowTimeline component
- ApprovalDialog component
- Integrated into IPC submit/approve cycle

### Phase 4 — VO, RFI, EVM (this session) ✅
- `VariationOrder` model + API (CRUD with project/contract filter)
- `RFI` model + API (CRUD with priority/status tracking)
- `EVM` report endpoint — PV, EV, AC, SV, CV, SPI, CPI, EAC, ETC, VAC
- Frontend pages: VariationOrders.jsx, RFIs.jsx (full CRUD + project filter)
- Dashboard: VO/RFI stats cards + EVM widget
- Sidebar + breadcrumbs + i18n for new routes
- Migration: auto-creates tables via `Base.metadata.create_all`

## Running the App

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Git Branches

- `stable/v1` — production snapshot (v1.0.0)
- `develop` — all Phase 1-4 work (current)
- GitHub: https://github.com/Ahmed-Gaffer/ahmed-engineering-erp

## Next Steps (Phase 5 candidates)

- Email/SMS notifications
- Advanced reporting with charts
- System administration panel
- Mobile-responsive refinements
