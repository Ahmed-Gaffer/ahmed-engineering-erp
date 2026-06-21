# SYSTEM_DNA.md — الحمض النووي للنظام
## Engineering Management System v3 · يُحدَّث عند كل تغيير معماري

> هذا الملف هو دستور النسيج للنظام.
> يقرأه Agent I قبل أي تعديل ليضمن أن الكود الجديد أصيل.
> يُحدَّث كلما تطورت أنماط النظام أو معماريته.
> آخر تحديث: 2026-06-21 (Genesis Protocol v11.1)

---

## هوية النظام

- **الاسم**: Engineering Management System v3
- **النوع**: Modular Monolith (LEGO v2)
- **المعمارية**: FastAPI + SQLAlchemy 2.0 Async + React 19
- **الغرض**: نظام إدارة المشاريع الهندسية للمكتب الفني
- **مرحلة التطوير**: Growth

---

## قواعد التسمية — إلزامية

| الكيان | النمط | مثال صحيح | مثال خاطئ |
|--------|-------|-----------|-----------|
| ملفات Python | snake_case | `employee_service.py` | `EmployeeService.py` |
| ملفات React | PascalCase | `EmployeeTable.jsx` | `employeeTable.jsx` |
| دوال Python | snake_case | `get_employee_by_id()` | `getEmployeeById()` |
| مكونات React | PascalCase | `EmployeeTable` | `employee_table` |
| API Routers | APIRouter prefix | `/api/projects` | `/api/getProjects` |
| SQLAlchemy Tables | PascalCase | `Project` | `project` |
| جداول DB | snake_case | `projects` | `Projects` |
| حقول DB | snake_case | `created_at` | `createdAt` |
| API Endpoints | kebab-case | `/api/payment-certificates/` | `/api/paymentCertificates/` |

---

## هيكل الملفات — أين يجلس كل نوع؟

```
[backend/app/]
  app/
    <entity>/           ← 4 ملفات إلزامية لكل entity:
      models.py         ← SQLAlchemy models فقط
      schemas.py        ← Pydantic schemas للـ API
      crud.py           ← GenericCRUD instance
      api.py            ← FastAPI endpoints (thin layer)

[modules/]
  <module_name>/
    __init__.py         ← LegoModule wrapper (imports from app.<entity>)
    <module_name>/      ← معادلة duplicate (مخطط للإزالة)

[core/lego_v2/]
  registry/             ← ModuleRegistry (singleton)
  event_bus/            ← EventBus (pub/sub)
  connectors/           ← ConnectorRegistry (ports + adapters)
  shared/               ← BaseModule, shared models/schemas/utils

[frontend/src/]
  components/           ← Reusable UI components
  pages/                ← Page-level components
  services/             ← API services (axios)
  contexts/             ← React Context (Auth, Theme)
  utils/                ← Helper functions
```

---

## أنماط البيانات — الرباعي الإلزامي لكل Entity

كل entity في النظام الخلفي يملك 4 ملفات لا أقل:

```
Backend:
  models/<entity>.py       ← SQLAlchemy model (Base + TimestampMixin)
  schemas/<entity>.py      ← Pydantic (Create/Update/Response)
  crud/<entity>.py         ← GenericCRUD(model) instance
  api/<entity>.py          ← FastAPI router

Frontend:
  services/api.js          ← createEntityService(path) pattern (لا ملف منفصل)
  pages/<Entity>/<Entity>.jsx  ← صفحة كاملة (DataTable + FormDialog)
```

---

## أنماط معالجة الأخطاء

**Backend — النمط الصحيح:**
```python
if not obj:
    raise HTTPException(status_code=404, detail="Project not found")
```

**Backend — النمط الخاطئ:**
```python
return None
return {"error": "not found"}
```

**Frontend — النمط الصحيح:**
```jsx
const { data, error, isLoading } = useQuery(...);
if (error) return <ErrorState />;
if (isLoading) return <LoadingState />;
```

**Frontend — النمط الخاطئ:**
```jsx
fetch('/api/...').then(...)  // لا fetch مباشر — استخدم api.js
```

---

## حدود الوحدات — ما تملكه كل وحدة

| الوحدة | مسؤولة عن | ممنوع أن تلمس |
|--------|-----------|----------------|
| engineering | Projects, Phases, Codes, Drawings, Documents, Payments, WorkOrders, BOQ, IPC, DailyReports, Subcontractors, Schedules | Auth, Users, HR |
| auth | Users, Login, Register, Tokens, Roles | Entity CRUD, Business logic |
| contractors | Contractors management | Project-specific data |
| hr | Employees management | Engineering entities |
| core | GenericCRUD, Audit, Upload, Export, Search, Rate Limit | Domain entities |

---

## قواعد العلاقات

- كل العلاقات عبر SQLAlchemy `relationship()` في models
- use `cascade="all, delete-orphan"` للعلاقات الأب-ابن
- المفاتيح الأجنبية تُعرّف صراحة في `ForeignKey()`
- lazy loading مسموح به في العلاقات البسيطة
- GenericCRUD يتعامل مع query-level fetching

---

## أنماط محظورة — Anti-patterns لهذا النظام

```
❌ لا import مباشر بين موديولين — استخدم Connectors + EventBus
❌ لا business logic في الـ routers
❌ لا state في component-level إذا يُشارَك بين components
❌ لا تكرر logic موجودة في GenericCRUD
❌ لا تستخدم fetch مباشر في components — استخدم api.js
❌ لا تضع utils في أكثر من مكان — app/core/ فقط و shared/utils/
❌ لا تكتب SQL خام — SQLAlchemy ORM دائماً
❌ لا تترك SECRET_KEY في الكود — استخدم environment variable
```

---

## "طريقة النظام" — كيف يحل هذا النظام المشاكل

هذا النظام يعتمد على بنية Modular Monolith معيارية (LEGO v2) حيث كل موديول مستقل بذاته، يتواصل مع الآخرين عبر EventBus للتوجيه غير المتزامن وConnectors للاستدعاء المباشر. كل entity تتبع نمط GenericCRUD الذي يوفّر CRUD موحد مع Search, Pagination, Sorting, Audit. طبقة الـ API رقيقة (thin layer) — كل المنطق في models/schemas/crud. الفرونت يتصل بالـ API عبر axios service واحد مع Bearer token تلقائي.

---

## سجل التغييرات المعمارية

| التاريخ | التغيير | المبرر | من قرر |
|---------|---------|--------|--------|
| 2026-06-09 | Initial LEGO v2 migration | دمج المشروع القديم مع البنية المعيارية | Maestro |
| 2026-06-09 | Auth P0 fixes (SECRET_KEY, token blacklist, rate limiting) | ثغرات أمنية حرجة | Agent D + Maestro |
| 2026-06-09 | Frontend DataTable fixes (MUI X v8 API) | توافق localeText + paginationModel | Agent B |
| 2026-06-21 | Genesis Protocol — توثيق DNA | تأسيس النظام على أرض صلبة | Maestro |
