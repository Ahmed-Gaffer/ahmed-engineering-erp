# CRITIQUE.md — سجل المشاكل المفتوحة
## Engineering Management System v3

---

## P0 - حرجة (Critical)

- [ ] **Database Migrations**: New models (SubmittalRegister, InspectionRequest, PunchListItem, Transmittal, CompanyBranch, ProjectCategory, CostCode, SafetyIncident, SafetyObservation) need auto-create tables on startup. Currently no Alembic config.
- [ ] **API Path Duplication**: Some engineeringApi services in `api.js` have duplicate entries. The later entries overwrite correct paths with wrong ones (e.g., `/engineering/inspections` instead of `/engineering/inspection-requests`). ✅ FIXED

## P1 - عالية (High)

- [ ] **Sidebar i18n**: New sidebar sections (classification, hse) need translation keys in both en.json and ar.json
- [ ] **Workflow Actions**: Some workflow endpoints lack `log_action` and `_create_notification` calls. Audit all Phase 2/3 endpoints.
- [ ] **Project Category Links**: No frontend UI exists for linking categories to projects (only backend API).

## P2 - متوسطة (Medium)

- [ ] **Search**: New entities (SubmittalRegister, InspectionRequest, PunchListItem, Transmittal, SafetyIncident, SafetyObservation) not included in search index.
- [ ] **Export**: No Excel/PDF export for new engineering modules.
- [ ] **File Upload**: File upload endpoints not implemented for new modules.
- [ ] **Dashboard Summary**: New entity counts not shown on main dashboard.
- [ ] **Negida Company Data**: Company profile not yet seeded into database.

## P3 - منخفضة (Low)

- [ ] **Soft Delete**: `is_deleted` field not present on any new models.
- [ ] **Tests**: Test coverage < 60%. No tests for new modules.
- [ ] **Docker Compose**: No docker-compose.yml for local dev.
- [ ] **PostgreSQL**: Still on SQLite.
