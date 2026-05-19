# Engineering Management System (ERP)

## [TECH_STACK]

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Python 3.13+ | |
| Framework | FastAPI | 0.136.1 |
| ORM | SQLAlchemy | 2.0.49 |
| Validation | Pydantic | 2.13.4 |
| Auth | python-jose + bcrypt | 3.5.0 / 5.0.0 |
| DB | SQLite + aiosqlite | 0.22.1 |
| Server | uvicorn | 0.47.0 |
| Frontend | React | 19.2.6 |
| UI | MUI (Material) | 9.0.1 |
| Icons | @mui/icons-material | 9.0.1 |
| DataGrid | @mui/x-data-grid | 9.0.0-alpha.4 |
| Charts | recharts | 3.8.1 |
| Router | react-router-dom | 7.15.1 |
| i18n | react-i18next + i18next | 17.0.8 / 26.2.0 |
| HTTP | axios | 1.16.1 |
| Build | Vite | latest |

## [ARCHITECTURE]

```
engineering-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry, CORS, router mounts
│   │   ├── config.py               # Settings via pydantic-settings
│   │   ├── database.py             # SQLAlchemy engine + session
│   │   ├── dependencies.py         # get_db, get_current_user
│   │   ├── core/                   # Shared core layer
│   │   │   ├── base.py             # Declarative base, TimestampMixin
│   │   │   ├── crud.py             # Generic CRUD class (avoid duplication)
│   │   │   ├── schemas.py          # Pagination schema, response wrappers
│   │   │   └── logging.py          # Async non-blocking logger
│   │   ├── auth/                   # Auth module
│   │   │   ├── models.py           # User SQLAlchemy model
│   │   │   ├── schemas.py          # Login/Token/Register schemas
│   │   │   ├── crud.py             # create_user, authenticate
│   │   │   ├── utils.py            # JWT encode/decode, password hashing
│   │   │   └── api.py              # POST /api/auth/login, /register
│   │   ├── contractors/           # Entity module (repeat for all 10)
│   │   │   ├── models.py           # SQLAlchemy model
│   │   │   ├── schemas.py          # Pydantic request/response
│   │   │   ├── crud.py             # DB operations (uses GenericCRUD)
│   │   │   └── api.py              # FastAPI router (CRUD endpoints)
│   │   ├── projects/
│   │   ├── phases/
│   │   ├── codes/
│   │   ├── work_orders/
│   │   ├── work_order_items/
│   │   ├── drawings/
│   │   ├── drawing_revisions/
│   │   ├── documents/
│   │   └── payment_certificates/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # Entry point
│   │   ├── App.jsx                 # Routes + Layout + AuthProvider
│   │   ├── theme.js                # MUI theme (RTL-aware)
│   │   ├── components/
│   │   │   ├── Layout/             # App shell: Sidebar + Header + Content
│   │   │   ├── Sidebar/            # Navigation drawer
│   │   │   ├── DataTable/          # Shared table (search, filter, paginate)
│   │   │   ├── FormDialog/         # Shared create/edit form in modal
│   │   │   ├── ConfirmDialog/      # Delete confirmation
│   │   │   └── StatsCard/          # Dashboard stat card
│   │   ├── pages/
│   │   │   ├── Dashboard/          # Main dashboard with charts + KPIs
│   │   │   ├── Login/              # Login page
│   │   │   ├── Contractors/        # List + Form (same pattern for all)
│   │   │   ├── Projects/
│   │   │   ├── Phases/
│   │   │   ├── Codes/
│   │   │   ├── WorkOrders/
│   │   │   ├── WorkOrderItems/
│   │   │   ├── Drawings/
│   │   │   ├── DrawingRevisions/
│   │   │   ├── Documents/
│   │   │   └── PaymentCertificates/
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + CRUD helpers
│   │   ├── i18n/                   # Translation files (ar/en)
│   │   ├── contexts/               # AuthContext (JWT state)
│   │   ├── hooks/                  # useAuth, usePagination, etc.
│   │   └── utils/                  # formatters, validators
│   ├── package.json
│   └── vite.config.js
└── PROJECT_MAP.md
```

### Entity Relationships (ERD)

```
Contractor ──┬── Project (1:N, contractor_id FK nullable)
             └── WorkOrder (1:N, contractor_id FK)

Project ──┬── ProjectPhase (1:N)
          ├── WorkOrder (1:N) ── WorkOrderItem (1:N)
          ├── Drawing (1:N) ── DrawingRevision (1:N)
          ├── Document (1:N)
          ├── PaymentCertificate (1:N)
          └── ProjectCode (1:N, self-FK parent_id → tree)
```

### API Pattern (uniform for all 10 entities)

```
GET    /api/{entity}?search=&page=&limit=&sort_by=&sort_order=   → paginated list
GET    /api/{entity}/{id}                                        → single item
POST   /api/{entity}/                                            → create
PUT    /api/{entity}/{id}                                        → update
DELETE /api/{entity}/{id}                                        → delete
POST   /api/{entity}/bulk-delete                                 → {"ids": [1,2,3]}
```

### Frontend UI Pattern (uniform for all 10 entities)

```
EntityListPage:
  ┌─────────────────────────────────────┐
  │  [Search...]  [+ New Entity]        │  ← toolbar
  ├─────────────────────────────────────┤
  │  Column1 | Col2 | Col3 | Actions   │  ← DataGrid
  │  ...     | ...  | ...  | ✏️ 🗑️    │
  │  ...     | ...  | ...  | ✏️ 🗑️    │
  ├─────────────────────────────────────┤
  │  Rows per page: [10] < 1-5 of 12 > │  ← pagination
  └─────────────────────────────────────┘

EntityFormDialog:
  ┌─────────────────────────┐
  │  Create/Edit Entity     │
  │  ┌───────────────────┐  │
  │  │ Field 1           │  │
  │  │ Field 2           │  │
  │  │ Field 3           │  │
  │  │ ...               │  │
  │  └───────────────────┘  │
  │  [Cancel]    [Save]     │
  └─────────────────────────┘
```

## [SYSTEM_FLOW]

1. **Auth Flow**: User → POST /api/auth/login → JWT token → stored in localStorage → attached as Authorization header → verified by middleware on each request.
2. **CRUD Flow**: User opens entity page → GET /api/{entity} → DataGrid renders rows → click New → FormDialog (POST) → DataGrid refreshes → click Edit → FormDialog (PUT) → DataGrid refreshes → click Delete → ConfirmDialog (DELETE) → DataGrid refreshes.
3. **Dashboard Flow**: User opens Dashboard → multiple GET /api/{entity}/stats (aggregated counts/charts via backend endpoints) → recharts renders KPIs + charts.
4. **RTL/i18n Flow**: i18next detects language → loads ar/en JSON → MUI ThemeProvider with direction="rtl" → all components re-render.

## [ORPHANS & PENDING]

All MVP items implemented. Deferred for future enhancements:
- Export to Excel/PDF
- Advanced RBAC (permissions per action)
- Audit logging (who did what when)
- WebSocket real-time updates
- Advanced charts drill-down

### Deep Modernization Wave 2 (May 2026)
- **framer-motion**: Page transitions (fade+slide via AnimatePresence), stagger animations on Dashboard cards (6 per row), micro-animations on sidebar toggle (chevron rotation), route exit/enter animations
- **Dark Mode**: Full dark palette (slate 900 bg, slate 800 paper, slate 100 text), system preference detection via `matchMedia`, toggle button in AppBar with sun/moon icon, persisted to localStorage, RTL-aware
- **ThemeContext** (`src/contexts/ThemeContext.jsx`): Manages `mode` state, listens to OS theme change, exposes `toggleMode`
- **Mini Sidebar**: Collapsed mode (72px) shows only icon buttons with tooltips, expands on click via animated chevron in AppBar, preserves all nav items with color-coded icon backgrounds
- **Skeleton Loading**: `DataGridSkeleton` (8-row table mimic with pulsing bars), `StatsCardSkeleton` (card with skeleton text lines) — used in EntityPage initial load and Dashboard before data arrives
- **Empty State** (`EmptyState.jsx`): Inbox icon + title + description + CTA button, shown in EntityPage when no records exist and no search active
- **EntityPage**: Shows skeleton during initial fetch, switches to EmptyState when list is empty, keeps DataGrid for search-no-results case
- **AppBar**: Chevron rotation animation on sidebar toggle, DarkMode/LightMode icon toggle with tooltip
- **Wave 3 Additions**:
  - **NavigationProgress** (`NavigationProgress.jsx`): Gradient loading bar at top of screen during route transitions, triggers on `location.pathname` change, AnimatePresence for smooth enter/exit
  - **ConfirmDialog**: Fade transition, delete icon in title, `color="text.secondary"` description text, `disableElevation` on confirm button
  - **CSV Export**: Download button in DataTable toolbar that serializes visible columns + rows to UTF-8 CSV with BOM, triggers on all data (not just current page)
  - **Inline Validation** (`FormDialog.jsx`): Client-side required-field validation before submit, `error` + `helperText` on each TextField, errors reset on dialog open

### UI/UX Modernization Wave 1 (May 2026)
Complete design system overhaul for a professional, modern experience:

- **Theme** (`theme.js`): Modern gradient-based palette (indigo/cyan/emerald), Inter font, glass-morphism effects, custom shadows, overrides for all major MUI components (buttons with gradient backgrounds, cards with subtle borders, DataGrid with stripped column headers, TextFields with focus glow)
- **Login** (`Login.jsx`): Split-screen layout — dark gradient left panel with branding icons (Engineering, Construction, AccountTree) vs clean white card on slate background; gradient top accent bar
- **Layout** (`Layout.jsx`): Glass-blur AppBar with breadcrumbs, language chip, gradient avatar with full profile dropdown (Profile, Settings, Logout); smooth sidebar transition
- **Sidebar** (`Sidebar.jsx`): Color-coded icon backgrounds per section, gradient active indicator bar, section headers (Overview/Data Management/Operations/Documents), logo area with sub-label, version footer
- **StatsCard** (`StatsCard.jsx`): Glass card with radial gradient accent, icon in colored background chip, animated hover lift, optional trend indicator (↑/↓)
- **Dashboard** (`Dashboard.jsx`): Enhanced KPIs with trend percentages, donut charts with custom legends, gradient-filled AreaChart for budget overview, gradient progress bars, custom tooltips, mini metric summaries
- **DataTable** (`DataTable.jsx`): Modern styled status chips (soft backgrounds, colored borders), icon buttons with colored backgrounds, search bar with icon prefix, filter button, dividers between toolbar and grid
- **FormDialog** (`FormDialog.jsx`): Required vs optional field grouping with section headers, cleaner dialog title with description, divider before actions
- **i18n** (`ar.json`/`en.json`): 14 new translation keys for modern UI elements
- **Font**: Added Inter (English) / Cairo (Arabic) typography stack for modern appearance

### Surgical Fixes Applied
- Fixed DataGrid `localeText` object nesting (arSD.components.MuiDataGrid.defaultProps.localeText)
- Fixed FormDialog: removed duplicate `InputLabelProps`, unused `useEffect` import
- Fixed backend `main.py`: removed duplicate `os.makedirs` in lifespan
- Fixed GenericCRUD: `cast(str)` → `cast(String)` for SQLAlchemy 2.0.49 compat
- Added search debounce (400ms) in EntityPage
- Removed `useCallback` from EntityPage (simplified fetch logic)
- Created `backend/.env` + `backend/.env.example` + `frontend/.env.example` for config
- Fixed `vite.config.js`: hardcoded proxy URL → env-aware via `loadEnv`

