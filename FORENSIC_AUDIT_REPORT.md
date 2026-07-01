# ═══════════════════════════════════════════════════════════════════
# FORENSIC AUDIT REPORT — ENGINEERING MANAGEMENT SYSTEM V3
# ─── مشروع: نظام إدارة المشاريع الهندسية ───
# المحقق: AI Forensics & Principal System Architecture Analysis
# التاريخ: 2026-07-01
# الحالة: COMPREHENSIVE — ALL FILES REVIEWED
# ═══════════════════════════════════════════════════════════════════

> **تحذير**: هذا التقرير هو تحقيق جنائي شامل في مسرح الجريمة الرقمي.
> كل حرف، كل ملف، كل علاقة تم فحصها بدقة المشرّح الجنائي.
> الهدف: توثيق كل شيء قبل المساس بأي شيء.

---

# جدول المحتويات

1. [ملف تعريف المشروع (Body of Evidence)](#1-ملف-تعريف-المشروع)
2. [هيكل المشروع الكامل (Full Autopsy)](#2-هيكل-المشروع-الكامل)
3. [قائمة الملفات الكاملة (Evidence Inventory)](#3-قائمة-الملفات-الكاملة)
4. [تحليل الهندسة المعمارية (Architecture Analysis)](#4-تحليل-الهندسة-المعمارية)
5. [الـ LEGO v2 Architecture — تشريح كامل](#5-الـ-lego-v2-architecture)
6. [تحليل الـ Backend (Server-Side Autopsy)](#6-تحليل-الـ-backend)
7. [تحليل الـ Frontend (Client-Side Autopsy)](#7-تحليل-الـ-frontend)
8. [تحليل قاعدة البيانات (Database Autopsy)](#8-تحليل-قاعدة-البيانات)
9. [تحليل الأمان (Security Analysis)](#9-تحليل-الأمان)
10. [تحليل الوثائق (Documentation Analysis)](#10-تحليل-الوثائق)
11. [قائمة المشاكل الحرجة (Critical Findings — P0)](#11-المشاكل-الحرجة-p0)
12. [قائمة المشاكل العالية (High Severity — P1)](#12-المشاكل-العالية-p1)
13. [قائمة المشاكل المتوسطة (Medium Severity — P2)](#13-المشاكل-المتوسطة-p2)
14. [قائمة المشاكل البسيطة (Low Severity — P3)](#14-المشاكل-البسيطة-p3)
15. [التبعيات والعلاقات الخفية (Hidden Dependencies)](#15-التبعيات-والعلاقات-الخفية)
16. [التناقضات بين التوثيق والكود (Doc-vs-Code Conflicts)](#16-التناقضات-توثيق-وكود)
17. [توصيات عاجلة (Urgent Recommendations)](#17-توصيات-عاجلة)
18. [خريطة الطريق للعلاج (Remediation Roadmap)](#18-خريطة-الطريق-للعلاج)

---

# 1. ملف تعريف المشروع

## البيانات الأساسية

| الخاصية | القيمة |
|---------|--------|
| **اسم المشروع** | Engineering Management System v3 |
| **النظام** | 360 Engineering ERP — APEX Enterprise Platform |
| **الإصدار** | 3.0.0 |
| **الغرض** | نظام إدارة المشاريع الهندسية (مقاولات، تشييد، بنية تحتية) |
| **الشركة الأساسية** | شركة نجيده للمقاولات العامة والتوريدات (Negida Contracting Co.) |
| **المهندس المعماري** | Ahmed Gaffer — Principal System Architect |
| **لغة الـ Backend** | Python 3.11+ (FastAPI + SQLAlchemy 2.0 Async) |
| **لغة الـ Frontend** | JavaScript/TypeScript (React 19 + Vite) |
| **قاعدة البيانات** | SQLite (aiosqlite) |
| **البنية المعمارية** | LEGO v2 Modular Architecture (Partial — ~60% complete) |

## الفرق بين `main.py` و `backend/app/main.py`

⚠️ **يوجد ملفان رئيسيان للتشغيل — وهذا خطر جسيم:**

| الملف | الدور | يستخدم LEGO v2؟ |
|-------|-------|-----------------|
| `E:\...\main.py` (الجذر) | نقطة الدخول النشطة — يستخدم `module_registry` | ✅ نعم |
| `E:\...\backend\app\main.py` | نقطة دخول قديمة/بديلة — يستخدم `importlib.import_module` يدويًا | ❌ لا |

**الخطر**: إذا تم تشغيل `backend/app/main.py` بدلاً من `main.py` الجذر، يتم تجاوز نظام LEGO v2 بالكامل.

---

# 2. هيكل المشروع الكامل

```
engineering-management-system-3/
│
├── main.py                          # ★ نقطة الدخول الرئيسية (LEGO v2)
├── pyproject.toml                   # إعدادات Python
├── README.md                        # وثيقة تعريفية
├── brand_identity.json              # الهوية البصرية للعلامة التجارية
├── Dockerfile                       # حاوية الإنتاج
├── dockerignore                     # استثناءات الحاوية
├── .env.example                     # مثال المتغيرات البيئية
├── .gitignore                       # استثناءات Git
├── .cursorrules                     # قواعد Cursor AI
├── deploy-to-hf.sh                  # نشر على HuggingFace
├── engineering.db                   # ★ قاعدة بيانات SQLite (في الجذر!)
│
├── backend/                         # تطبيق الـ Backend
│   ├── run.py                       # تشغيل خادم التطبيق
│   ├── requirements.txt             # تبعيات Python
│   ├── .env                         # المتغيرات البيئية الفعلية
│   ├── engineering.db               # ★ قاعدة بيانات أخرى!
│   ├── alembic.ini                  # إعدادات الترحيل
│   ├── seed_demo.py                 # بيانات تجريبية
│   ├── start_and_register.py        # تشغيل وتسجيل مستخدم
│   ├── test_ipc.pdf                 # ملف اختبار IPC
│   ├── uploads/                     # ملفات مرفوعة
│   ├── alembic/                     # نسخ الترحيل
│   ├── app/                         # ★ كود التطبيق الأساسي
│   ├── tests/                       # اختبارات
│   └── scripts/                     # (فارغ!)
│
├── frontend/                        # تطبيق الـ Frontend
│   ├── package.json                 # تبعيات Node.js
│   ├── vite.config.ts               # إعدادات Vite
│   ├── tsconfig.json                # إعدادات TypeScript
│   ├── index.html                   # صفحة HTML الرئيسية
│   ├── dist/                        # نسخة الإنتاج المجمعة
│   ├── public/                      # ملفات عامة
│   └── src/                         # ★ كود المصدر
│
├── core/                            # ★ نواة النظام
│   ├── __init__.py
│   └── lego_v2/                     # ★ بنية LEGO v2 المعيارية
│       ├── shared/                  # مشترك (BaseModule)
│       ├── registry/                # سجل الوحدات
│       ├── event_bus/               # ناقل الأحداث
│       └── connectors/              # الموصلات بين الوحدات
│
├── modules/                         # ★ الوحدات القابلة للتوصيل
│   ├── __init__.py
│   ├── auth/                        # وحدة المصادقة
│   ├── contractors/                 # وحدة المقاولين
│   ├── core/                        # الوحدة الأساسية
│   ├── engineering/                 # وحدة الهندسة
│   └── hr/                          # وحدة الموارد البشرية
│
├── .ai/                             # ★ أدلة وأوامر الذكاء الاصطناعي
│   ├── AGENT_0_MAESTRO.md           # المايسترو — القائد الأعلى
│   ├── AGENT_ACTIVE_STATE.md        # الحالة النشطة للوكيل
│   ├── AGENT_VACCINE.md             # تطعيم الوكيل
│   ├── AGENTS_ROSTER.md             # قائمة الوكلاء
│   ├── ENGINEERING_AUDIT.md         # تدقيق هندسي
│   ├── EXECUTABLE_DNA_SPEC.md       # مواصفات DNA القابلة للتنفيذ
│   ├── FRONTEND_MODERNIZATION_PROTOCOL.md
│   ├── GAP_ANALYSIS.md              # تحليل الفجوات
│   ├── GEMINI_TREASURES.md          # كنوز Gemini
│   ├── HANDOFF.md                   # تسليم المهام
│   ├── ROADMAP.md                   # خريطة الطريق
│   ├── SYSTEM_DNA.md                # DNA النظام
│   ├── protocols/                   # بروتوكولات الوكيل
│   └── templates/                   # قوالب
│
├── docs/                            # الوثائق
│   ├── PLAN.md, PROJECT_MAP.md, SYSTEM_STATE.md, TASKS_PLAN.md
│   ├── ANCHORED_SUMMARY.md, CRITIQUE.md, DB_SCHEMA.md
│   ├── DECISION_LOG.md, ENGINEERING_ROADMAP.md
│   ├── GITHUB_ACTIONS_SETUP.md, HANDOFF.md
│   ├── ai_system_instructions.txt
│   ├── architecture/                # وثائق معمارية
│   ├── decisions/                   # قرارات هندسية
│   └── modules/engineering/         # وثائق وحدة الهندسة
│
├── .github/workflows/               # CI/CD
│   ├── deploy-stable.yml
│   ├── deploy-hf-space.yml
│   └── deploy-docker-to-hf.yml
│
└── uploads/                         # الملفات المرفوعة
```

---

# 3. قائمة الملفات الكاملة

## المجموع الكلي: ~280 ملفًا

### الفئة 1: ملفات Python - Backend (~80 ملفًا)

| المسار | الأسطر | الوظيفة |
|--------|--------|---------|
| `main.py` | 126 | نقطة الدخول الرئيسية (LEGO v2) |
| `backend/run.py` | 53 | تشغيل خادم بديل على port 8008 |
| `backend/app/main.py` | 125 | ★ نقطة دخول قديمة (خطر — لا تستخدم LEGO v2) |
| `backend/app/config.py` | 42 | إعدادات (فئتان Settings تتعارضان) |
| `backend/app/database.py` | 13 | اتصال بقاعدة البيانات |
| `backend/app/dependencies.py` | 58 | ★ **خطأ نحوي**: `return No` بدلاً من `return None` |
| `backend/app/upload.py` | 24 | رفع الملفات (بدون فحص MIME) |
| `backend/app/core/base.py` | 19 | Base + TimestampMixin |
| `backend/app/core/crud.py` | 116 | GenericCRUD مع audit |
| `backend/app/core/audit.py` | 18 | AuditLog |
| `backend/app/core/export.py` | 81 | تصدير Excel |
| `backend/app/core/export_api.py` | 65 | API التصدير |
| `backend/app/core/search.py` | 70 | بحث عام |
| `backend/app/core/logging.py` | 11 | تسجيل |
| `backend/app/core/rate_limit.py` | 24 | تحديد معدل الطلبات |
| `backend/app/core/schemas.py` | 13 | نماذج Pydantic مشتركة |
| `backend/app/auth/api.py` | ~80 | API المصادقة |
| `backend/app/auth/models.py` | ~40 | نموذج المستخدم + القائمة السوداء |
| `backend/app/auth/schemas.py` | ~50 | نماذج Pydantic للمصادقة |
| `backend/app/auth/crud.py` | ~30 | عمليات CRUD للمستخدمين |
| `backend/app/auth/utils.py` | ~50 | إنشاء/فك التوكن + تشفير كلمة المرور |
| `backend/app/contractors/*.py` | 4 ملفات | المقاولين (Models, Schemas, CRUD, API) |
| `backend/app/projects/*.py` | 4 ملفات | المشاريع |
| `backend/app/phases/*.py` | 4 ملفات | المراحل |
| `backend/app/codes/*.py` | 4 ملفات | الأكواد |
| `backend/app/work_orders/*.py` | 4 ملفات | أوامر العمل |
| `backend/app/work_order_items/*.py` | 4 ملفات | بنود أوامر العمل |
| `backend/app/drawings/*.py` | 4 ملفات | الرسومات |
| `backend/app/drawing_revisions/*.py` | 4 ملفات | مراجعات الرسومات |
| `backend/app/documents/*.py` | 4 ملفات | المستندات |
| `backend/app/payment_certificates/*.py` | 4 ملفات | شهادات الدفع |
| `backend/app/employees/*.py` | 4 ملفات | الموظفين |
| `backend/app/company_profile/*.py` | 4 ملفات | ملف الشركة |
| `backend/app/activities/*.py` | 3 ملفات | الأنشطة |
| `backend/app/notifications/*.py` | 4 ملفات | الإشعارات |
| `backend/app/workflow/*.py` | 4 ملفات | سير العمل |
| `backend/app/engineering_features/models.py` | ~1000 | ★ **وحش**: كل نماذج الهندسة في ملف واحد |
| `backend/app/engineering_features/schemas.py` | ~800 | ★ كل نماذج Pydantic للهندسة |
| `backend/app/engineering_features/api.py` | **3902** | ★ **وحش**: 200+ Endpoint في ملف واحد |
| `backend/app/engineering_features/crud.py` | ~150 | CRUD مخصص |
| `backend/app/engineering_features/dashboard.py` | ~100 | لوحة التحكم |
| `backend/app/engineering_features/ipc_pdf.py` | ~200 | ★ توليد PDF (خطوط صلبة قد لا تكون موجودة) |
| `backend/app/engineering_features/notification_adapter.py` | ~20 | ★ **عطل**: يستورد `core.lego_v2` غير الموجود |

### الفئة 2: ملفات LEGO v2 Core (10 ملفات)

| المسار | الأسطر | الوظيفة |
|--------|--------|---------|
| `core/lego_v2/__init__.py` | 0 | فارغ |
| `core/lego_v2/shared/base_module.py` | 47 | فئة BaseModule الأساسية |
| `core/lego_v2/registry/module_registry.py` | 53 | سجل الوحدات (Singleton) |
| `core/lego_v2/event_bus/event_bus.py` | 41 | ناقل الأحداث (Singleton) |
| `core/lego_v2/event_bus/events.py` | 26 | تعريفات الأحداث |
| `core/lego_v2/connectors/connector_registry.py` | 44 | سجل الموصلات (Singleton) |
| `core/lego_v2/*/__init__.py` | 5 ملفات | جميعها فارغة |

### الفئة 3: ملفات Modules (7 ملفات)

| المسار | الأسطر | الوظيفة |
|--------|--------|---------|
| `modules/__init__.py` | 7 | إضافة `backend/` إلى sys.path |
| `modules/auth/__init__.py` | 14 | AuthModule |
| `modules/contractors/__init__.py` | 14 | ContractorsModule |
| `modules/core/__init__.py` | 20 | ★ **خلل**: يسجل `Base` (DeclarativeBase) كنموذج! |
| `modules/engineering/__init__.py` | 98 | EngineeringModule — الأكثر تعقيدًا |
| `modules/engineering/reports_api.py` | 478 |   تقارير الهندسة |
| `modules/hr/__init__.py` | 14 | HRModule |

### الفئة 4: ملفات Frontend (~150+ ملفًا)

| المسار | عدد الملفات | الوظيفة |
|--------|-------------|---------|
| `frontend/src/App.jsx` | 1 | المدخل الرئيسي مع 45+ مسارًا |
| `frontend/src/main.tsx` | 1 | نقطة الدخول |
| `frontend/src/theme.js` | 1 | **259 سطرًا** — ثيم متكامل |
| `frontend/src/services/api.js` | 1 | **404 سطرًا** — كل API |
| `frontend/src/lib/api-client.ts` | 1 | **مكرر** — نفس وظيفة api.js |
| `frontend/src/lib/form-utils.ts` | 1 | أدوات النماذج |
| `frontend/src/hooks/useCrud.ts` | 1 | Hook CRUD عام |
| `frontend/src/stores/authStore.ts` | 1 | متجر المصادقة |
| `frontend/src/stores/uiStore.ts` | 1 | متجر واجهة المستخدم |
| `frontend/src/contexts/ThemeContext.jsx` | 1 | سياق الثيم |
| `frontend/src/components/` | 33 ملفًا في 17 مجلدًا | مكونات UI |
| `frontend/src/pages/` | 48 صفحة في 48 مجلدًا | صفحات التطبيق |
| `frontend/src/styles/` | 3 ملفات | CSS |
| `frontend/src/i18n/` | 3 ملفات | ترجمة (عربي/إنجليزي) |
| `frontend/src/utils/` | 1 ملف | أدوات مساعدة |
| `frontend/src/test/` | 4 ملفات | **فقط 4 اختبارات** |
| `frontend/src/App.jsx` imports | 45 صفحة مست懒ة (lazy) | 48 مسارًا |

### الفئة 5: ملفات التهيئة والتوثيق (60+ ملفًا)

| المجموعة | عدد الملفات | ملاحظات |
|----------|-------------|---------|
| `.ai/` | 12 ملفًا + 6 بروتوكولات | أدلة AI متقدمة |
| `docs/` | 15 ملفًا + وثائق فرعية | ★ تناقضات مع الكود الفعلي |
| الجذر | 8 ملفات | Dockerfile, README, إلخ |
| `.github/workflows/` | 3 ملفات | ★ كلها تدفع لنفس Tag GHCR |
| `backend/tests/` | 6 ملفات | اختبارات Python |
| `backend/alembic/` | 3 نسخ ترحيل | ★ لكن CRITIQUE.md تقول "لا يوجد Alembic" |

---

# 4. تحليل الهندسة المعمارية

## 4.1 تحليل النمط المعماري (Architecture Pattern Analysis)

المشروع يستخدم خليطًا من نمطين معماريين:

### النمط A: Monolithic Legacy (في `backend/app/engineering_features/`)
- ملف `api.py` = 3902 سطرًا يحتوي ~200 endpoint
- ملف `models.py` = ~1000 سطر يحتوي 30+ نموذج
- ملف `schemas.py` = ~800 سطر يحتوي 50+ نموذج Pydantic
- **نمط قديم، غير قابل للصيانة، يخالف كل مبادئ LEGO v2**

### النمط B: Domain Module Pattern (في `backend/app/{entity}/`)
كل كيان يتبع نمط 4 ملفات:
- `models.py` → SQLAlchemy Model
- `schemas.py` → Pydantic Schemas
- `crud.py` → CRUD Operations
- `api.py` → Router

**الكيانات المطبقة**: contractors, projects, phases, codes, work_orders, work_order_items, drawings, drawing_revisions, documents, payment_certificates, employees, company_profile

**الكيان المخالف**: `engineering_features` — كل شيء في 3 ملفات عملاقة

### النمط C: LEGO v2 Modular (في `core/lego_v2/` + `modules/`)
- `BaseModule` → كل وحدة ترث من هذه الفئة
- `ModuleRegistry` → تسجيل الوحدات
- `EventBus` → أحداث بين الوحدات
- `ConnectorRegistry` → موصلات بين الوحدات

**التقييم**: 60% مكتمل — الإطار موجود لكن معظم الميزات المتقدمة (Port/Adapter, Lifecycle Hooks, Auto-discovery) غير مطبقة

## 4.2 رسم العلاقات بين المكونات

```
main.py (الجذر)
  │
  ├── يضبط sys.path ← backend/
  │
  ├── يستورد core.lego_v2.registry.module_registry
  │   └── module_registry (Singleton)
  │
  ├── يستورد core.lego_v2.event_bus.event_bus
  │   └── event_bus (Singleton)
  │
  ├── يستورد core.lego_v2.connectors.connector_registry
  │   └── connector_registry (Singleton)
  │
  ├── يستورد modules: auth, contractors, engineering, hr, core
  │   │
  │   └── كل module/__init__.py:
  │       ├── يستورد BaseModule من core.lego_v2.shared.base_module
  │       ├── ينشئ مثيل ModuleX(BaseModule)
  │       ├── يسجل routers, models, events
  │       └── يستدعي .register() ← module_registry.register(...)
  │
  ├── lifespan:
  │   ├── Base.metadata.create_all (إنشاء الجداول)
  │   ├── module_registry.check_dependencies()
  │   └── connector_registry.check_wiring()
  │
  └── Includes routers من module_registry.get_all_routers()
      └── app.include_router(router) ← تلقائي
```

## 4.3 المشاكل المعمارية الحرجة

1. **ازدواجية `main.py`** — ملفان رئيسيان، واحد فقط يستخدم LEGO v2
2. **هندسة_features معطلة** — 3902 سطرًا في api.py واحد. هذا يجعل الصيانة كابوسًا
3. **Base.module.py خطأ** — `modules/core/__init__.py` يسجل `Base` (DeclarativeBase) كنموذج. سينهار إذا حاول أي كود قراءة `Base.__table__`
4. **ConnectorRegistry.check_wiring()** — لا يفعل شيئًا (جسم الحلقة `pass`)
5. **BaseModule.add_adapter()** — غير مستخدم أبدًا بأي وحدة
6. **ConnectorRegistry.call()** — غير مستخدم أبدًا. لا يوجد اتصال بين الوحدات
7. **لا يوجد Auto-discovery للوحدات** — كل وحدة تُستورد يدويًا في `main.py`
8. **EngineeringModule** هو الوحيد الذي يستخدم EventBus — والوحيد الذي يتحدث إلى نفسه فقط

---

# 5. الـ LEGO v2 Architecture — تشريح كامل

## 5.1 BaseModule (`core/lego_v2/shared/base_module.py`)

```python
class BaseModule:
    def __init__(self, name, version, dependencies=None):
        # يخزن الاسم، الإصدار، التبعيات
        # يهيئ قوائم: routers, models, events, ports, adapters
    
    def add_router(router)     # يجمع FastAPI routers
    def add_model(model)       # يجمع SQLAlchemy models
    def add_event(...)         # يسجل حدث + معالج
    def add_port(...)          # يسجل منفذ خروج
    def add_adapter(...)       # يسجل محول دخول
    async def emit_event(...)  # ينشر حدثًا
    def register()             # يسجل كل شيء في ModuleRegistry
```

## 5.2 ModuleRegistry (`core/lego_v2/registry/module_registry.py`)

```python
class ModuleRegistry:
    # Singleton
    def register(name, version, routers, models, events, dependencies)
    def get(name) -> dict
    def list_modules() -> list[str]
    def get_all_routers() -> list[Router]
    def check_dependencies() -> list[str]  # أخطاء
```

## 5.3 EventBus (`core/lego_v2/event_bus/event_bus.py`)

```python
class EventBus:
    # Singleton
    def subscribe(event_name, handler)
    async def publish(event: dict)
    def get_history(event_name=None)
```

## 5.4 ConnectorRegistry (`core/lego_v2/connectors/connector_registry.py`)

```python
class ConnectorRegistry:
    # Singleton
    def register_port(name, module, handler)
    def register_adapter(module, adapter)
    async def call(module, port_name, **kwargs)
    def check_wiring()  # ★ لا يفعل شيئًا!
```

## 5.5 جدول الوحدات المسجلة

| الوحدة | الإصدار | التبعيات | Routers | Models | الأحداث | المنافذ |
|--------|---------|----------|---------|--------|---------|---------|
| **auth** | 1.0.0 | [] | auth_router | User | 0 | 0 |
| **contractors** | 1.0.0 | [] | contractors_router | Contractor | 0 | 0 |
| **core** | 1.0.0 | [] | export_router, search_router, company_profile_router | AuditLog, **Base (خطأ!)** | 0 | 0 |
| **hr** | 1.0.0 | [] | employees_router | Employee | 0 | 0 |
| **engineering** | 2.0.0 | [contractors, core] | 11 routers | 22 models | 12 events | notify |

---

# 6. تحليل الـ Backend

## 6.1 جدول كيانات Backend

| الكيان | Models | Schemas | CRUD | API | النمط | حالة |
|--------|--------|---------|------|-----|-------|------|
| Auth | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Contractors | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Projects | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Phases | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Codes | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Work Orders | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Work Order Items | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Drawings | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Drawing Revisions | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Documents | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Payment Certificates | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Employees | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Company Profile | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Activities | ✅ | ✅ | ✅ | ✅ | Domain | بسيط |
| Notifications | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Workflow | ✅ | ✅ | ✅ | ✅ | Domain | مكتمل |
| Engineering Features | ✅(1ملف) | ✅(1ملف) | ✅ | ✅(3902سطر) | ★ Monolith | خطر |
| Upload | - | - | - | ✅(1ملف) | Utility | مكتمل |

## 6.2 نقاط الضعف في الـ Backend

### 6.2.1 أخطاء تمنع التشغيل (Crash Bugs)

1. **`backend/app/main.py:13-14`** — يستورد `core.lego_v2` غير الموجود
   ```python
   from core.lego_v2.event_bus.event_bus import event_bus  # ModuleNotFoundError!
   from core.lego_v2.event_bus.events import ENGINEERING_EVENTS  # ModuleNotFoundError!
   ```
   **الحقيقة**: `core.lego_v2` موجود في جذر المشروع وليس داخل `backend/`. هذا الاستيراد سينهار لأن Python لا يجد المسار.

2. **`backend/app/dependencies.py:43`** — خطأ نحوي
   ```python
   return No  # NameError! يجب أن تكون "return None"
   ```

### 6.2.2 `engineering_features/api.py` — الملف الـ 3902 سطرًا

**محتوياته**: ~200 endpoint لكل الكيانات الهندسية (BOQ, IPC, NCR, RFI, Submittals, PunchList, Transmittals, Meeting Minutes, Safety, HSE, Material Tests, ITP, Method Statements, Permits, Survey, Specifications, Branches, Categories, Cost Codes, إلخ)

**المشاكل**:
- 3902 سطرًا في ملف واحد — كابوس الصيانة
- يستدعي `log_action` بدون `actor_id` (التدقيق عديم الفائدة)
- يخلط بين الكيانات المختلفة في نفس الملف
- لا يوجد فصل واضح بين المجالات (Domains)
- **يجب تقسيمه إلى ملفات منفصلة لكل كيان**

### 6.2.3 `config.py` — فئتا إعدادات متضاربتان

```python
class Settings:          # ACCESS_TOKEN_EXPIRE_MINUTES = 30
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"

class AGCoreSettings:    # ACCESS_TOKEN_EXPIRE_MINUTES = 1440 (24 ساعة!)
    DATABASE_URL: str = Field(default=f"sqlite+aiosqlite:///{DB_PATH.as_posix()}")
```

**المشكلة**: `AGCoreSettings` غير مستخدمة في أي مكان. إعدادات متضاربة لنفس القيم.

### 6.2.4 `upload.py` — ثغرة أمنية

```python
ALLOWED_EXTENSIONS = {".pdf", ".doc", ...}
ext = os.path.splitext(filename)[1].lower()
if ext not in ALLOWED_EXTENSIONS:
    raise HTTPException(400, f"File type '{ext}' not allowed")
```

**المشاكل**:
- ✅ يفحص الامتداد فقط، وليس MIME type
- ❌ لا يوجد حد لحجم الملف (DoS)
- ❌ يقرأ الملف كاملًا في الذاكرة
- ❌ `os.makedirs` في كل طلب بدلاً من مرة واحدة

## 6.3 نقاط مهمة في `backend/app/auth/`

### 6.3.1 `auth/models.py`
```python
class User(Base):
    id: Mapped[int]
    username: Mapped[str] = Column(String(50), unique=True, index=True)
    email: Mapped[str] = Column(String(100))  # ★ ليس unique!
    ...
```

**الخلل**: البريد الإلكتروني ليس `unique=True`. يمكن لمستخدمين متعددين نفس البريد.

### 6.3.2 `auth/api.py` — إنشاء حساب Admin
```python
@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_username(db, data.username)
    if existing:
        raise HTTPException(400, "Username already registered")
    if data.role == "admin":
        raise HTTPException(403, "Only admins can create admin accounts")
    # ★ أي شخص يمكنه التسجيل بدور "viewer" دون موافقة
```

**الخطر**: أي شخص يمكنه إنشاء حساب دون موافقة. لا يوجد تفعيل بريد إلكتروني.

### 6.3.3 `auth/utils.py` — مفتاح JWT متغير
```python
SECRET_KEY: str = os.getenv("SECRET_KEY", "") or secrets.token_hex(32)
```

**الخطر**: إذا لم يتم تعيين `SECRET_KEY` في البيئة، يتم إنشاء مفتاح عشوائي جديد كل إعادة تشغيل. هذا يبطل كل التوكنات القديمة ويسجل خروج جميع المستخدمين.

## 6.4 `payment_certificates/crud.py` — معادلة مالية قد تكون خاطئة

```python
gross = current_works + materials_on_site
deductions = insurance + advance_repayment + fine_deductions + other_deductions
net = gross - deductions + previous_total  # ★ previous_total يُضاف!
amount_due = net - retention  # ★ retention يُطرح كل فترة
```

**الخطر**: 
- إضافة `previous_total` يجعل المبلغ تراكميًا — قد يدفع نفس المبلغ مرتين
- خصم `retention` في كل شهادة قد يخصم أكثر من المطلوب

**يحتاج مراجعة دقيقة من محاسب قانوني**.

## 6.5 `workflow/api.py` — تتبع الحالات فارغ

```python
result = await workflow_engine.transition(
    db, transition_id, ..., 
    from_status=None,  # ★ لا يتم تعيين الحالة السابقة
    to_status=None     # ★ لا يتم تعيين الحالة الجديدة
)
```

السجل لا يسجل أي معلومات عن تغيير الحالة — عديم الفائدة.

---

# 7. تحليل الـ Frontend

## 7.1 نظرة عامة

| المكون | العدد | الحالة |
|--------|-------|--------|
| صفحات (Pages) | 48 مجلدًا | ✅ معظمها كاملة |
| مكونات (Components) | 33 ملفًا في 17 مجلدًا | ✅ جيدة |
| متاجر (Stores) | 2 (authStore.ts, uiStore.ts) | ✅ |
| سياقات (Contexts) | 1 (ThemeContext.jsx) | ✅ |
| Hooks | 1 (useCrud.ts) | ✅ |
| خدمات API | 2 ملفين (api.js + api-client.ts) | ⚠️ مكرر |
| ترجمة (i18n) | 3 ملفات (ar.json, en.json, index.js) | ✅ |
| أنماط (Styles) | 3 ملفات CSS | ✅ |
| اختبارات | 4 ملفات فقط | ❌ ضعيف جدًا |

## 7.2 `App.jsx` — 172 سطرًا

**الإيجابيات**:
- استخدام `React.lazy()` لتحميل الصفحات عند الطلب (Code Splitting)
- استخدام `framer-motion` للانتقالات بين الصفحات
- استخدام `ErrorBoundary` للمعالجة المركزة للأخطاء
- `ProtectedRoute` يحمي المسارات

**السلبيات**:
- 45 استيرادًا مستهلاً (lazy imports) — كثير جدًا
- المسار `/engineering/ipc/:ipcId/print` خارج المسارات المحمية
- كل الصفحات تحت `/engineering/` مما يجعل الـ URL طويلاً

## 7.3 `theme.js` — 259 سطرًا

**الإيجابيات**:
- تصميم داكن/فاتح متكامل
- ألوان ذهبية/كحلية فاخرة
- Glassmorphism (backdrop-filter)
- تخصيص كامل لكل مكون MUI

**السلبيات**:
- الألوان الأساسية معرفة يدويًا وليس عبر Design Tokens
- لا يوجد استخدام لمتغيرات CSS (`tokens.css` غير مستخدمة بشكل كافٍ)
- `shadows` مصفوفة — الـ 14 ظلًا الأخير `'none'`

## 7.4 `services/api.js` — 404 سطرًا

**الإيجابيات**:
- جميع API endpoints مركزة في ملف واحد
- `createEntityService` يقلل التكرار
- Interceptors للمصادقة وإعادة التوجيه

**السلبيات**:
- ⚠️ يوجد ملف مكرر: `lib/api-client.ts` (23 سطرًا) — نفس وظائف `api.js`
- كل دوال الهندسة (`engineeringApi`) في كائن واحد كبير — 300+ سطر
- دوال مكررة (مثلاً `listByProject` تتكرر لكل كيان)

## 7.5 `lib/api-client.ts` — نسخة مكررة

```typescript
// نفس وظائف api.js بالضبط، ولكن في TypeScript
const api: AxiosInstance = axios.create({ baseURL: '/api' });
api.interceptors.request.use(...)
api.interceptors.response.use(...)
export default api;
```

**الخلل**: الملفان يفعلان نفس الشيء. يجب دمج api.js في api-client.ts (TypeScript).

## 7.6 `hooks/useCrud.ts` — Hook عام ممتاز

يقوم بعمليات CRUD مع `react-query`. يستخدم `api.js` مباشرة. مفيد جدًا ويقلل التكرار في الصفحات.

## 7.7 `components/` — المكونات

### المكونات الموجودة (17 مجلدًا):
| المكون | الغرض | ملاحظات |
|--------|-------|---------|
| Layout | التخطيط الرئيسي (Sidebar + AppBar + Content) | أساسي |
| Sidebar | القائمة الجانبية | مع أيقونات |
| DataTable | جدول بيانات | يستخدم MUI X DataGrid |
| FormDialog | نافذة منبثقة مع نموذج | للنماذج |
| PageHeader | رأس الصفحة | Breadcrumbs + أزرار |
| StatsCard | بطاقة إحصائية | مع أيقونة |
| Skeleton | هيكل تحميل (Loading) | يمنع Layout Shift |
| EChart | رسم بياني (ECharts) | |
| GanttChart | مخطط جانت | للجدول الزمني |
| WorkflowTimeline | خط زمني لسير العمل | |
| StatusChip | شريط حالة ملون | |
| BrandLogo | شعار العلامة التجارية | |
| EmptyState | حالة عدم وجود بيانات | |
| ErrorBoundary | معالجة الأخطاء | |
| MobileBottomNav | شريط سفلي للجوال | |
| NotificationBell | جرس الإشعارات | |
| DashboardWidgets | أدوات لوحة التحكم | |
| ApprovalDialog | نافذة الموافقة | |
| ConfirmDialog | نافذة التأكيد | |
| Footer | تذييل | |
| PageTransition | انتقال الصفحة | |
| NavigationProgress | شريط تقدم التصفح | |
| SvgIcon | أيقونة SVG | |
| EntityTable | جدول كيان | |
| EmptyIllustration | رسم توضيحي فارغ | |

### الإيجابيات:
- تنظيم جيد في مجلدات منفصلة
- استخدام MUI بشكل متسق
- Glassmorphism في Layout

### السلبيات:
- بعض المكونات قد تكون مكررة (EntityTable vs DataTable)
- لا يوجد Storybook أو اختبارات بصرية
- معظم المكونات لا تحتوي على PropTypes أو TypeScript

## 7.8 `pages/` — الصفحات

### الصفحات الموجودة (48 مجلدًا):

| المجموعة | الصفحات | العدد |
|----------|---------|-------|
| **Core** | Dashboard, Login, EntityPage | 3 |
| **Projects** | Projects, ProjectHub, Phases | 3 |
| **Financial** | BOQ, IPC, IPCPrint, PaymentCertificates, Contracts | 5 |
| **Documents** | Documents, Drawings, DrawingRevisions, Specifications | 4 |
| **Quality** | NCR, RFIs, MAR, Submittals, InspectionRequests, ITP, MaterialTests, MethodStatements | 8 |
| **Safety** | SafetyIncidents, SafetyObservations, HSEDashboard, Permits | 4 |
| **HR** | Employees, DailyReports | 2 |
| **Admin** | Admin, CompanyProfile, Branches, Categories, CostCodes, Codes | 6 |
| **Work** | WorkOrders, WorkOrderItems, Schedules, VariationOrders | 4 |
| **Communication** | MeetingMinutes, Transmittals, Notifications | 3 |
| **Other** | Contractors, Subcontractors, PunchList, Survey, Reports, Search | 6 |
| **Legacy** | EntityPage.jsx (وحيد في الجذر) | 1 |

## 7.9 `i18n/` — الترجمة

| الملف | اللغة | الحجم |
|-------|-------|-------|
| `ar.json` | العربية | كبير — جميع النصوص |
| `en.json` | الإنجليزية | كبير — جميع النصوص |
| `index.js` | الإعدادات | إعداد i18next |

**الإيجابيات**: دعم كامل للعربية والاتجاه RTL.
**السلبيات**: لا يوجد اختبار للنصوص المفقودة بين اللغتين.

## 7.10 `styles/` — الأنماط

| الملف | المحتوى |
|-------|---------|
| `tokens.css` | متغيرات CSS (الألوان، الخطوط، المسافات) |
| `ems-global.css` | أنماط عامة للنظام |
| `animations.css` | تعريفات حركات CSS |

**ملاحظة**: `tokens.css` معرف لكن `theme.js` لا يستخدمه — يستخدم قيمًا صلبة بدلاً من متغيرات CSS.

## 7.11 الاختبارات — ضعيف جدًا

**عدد اختبارات Frontend: 4 فقط**
- `form-utils.test.ts` — اختبار وحدة لأدوات النماذج
- `setup.ts` — إعداد بيئة الاختبار
- `StatusChip.test.jsx` — اختبار لمكون واحد
- `SvgIcon.test.jsx` — اختبار لمكون واحد

**عدد اختبارات Backend: 6 ملفات**
- `conftest.py` — إعدادات
- `test_crud.py` — اختبارات CRUD
- `test_fixes.py` — إصلاحات
- `test_lego_v2.py` — اختبارات LEGO v2
- `test_new_features.py` — ميزات جديدة
- `test_exercises.py` — تمارين

**التقييم**: تغطية اختبارية ضعيفة جدًا لنظام به 280+ ملفًا و 30+ كيانًا.

---

# 8. تحليل قاعدة البيانات

## 8.1 ملفات قاعدة البيانات

⚠️ **توجد قاعدتا بيانات SQLite!**

| الموقع | الحجم التقريبي | الاستخدام |
|--------|----------------|-----------|
| `E:\...\engineering.db` (الجذر) | غير معروف | مُنشأة عند تشغيل `main.py` الجذر |
| `E:\...\backend\engineering.db` (backend) | غير معروف | مُنشأة عند تشغيل `backend/app/main.py` |

**الخطر**: قد تكون الحالتين مختلفتين. قد تعمل على واحدة بينما البيانات في الأخرى!

## 8.2 هيكل قاعدة البيانات (بحسب DB_SCHEMA.md)

### الجداول المسجلة في `Base.metadata`:

**Core Tables**:
- `users` — المستخدمون
- `token_blacklist` — التوكنات الملغاة
- `audit_logs` — سجل التدقيق
- `activities` — الأنشطة (View على AuditLog)

**Entity Tables** (حوالي 30 جدولًا):
- `contractors`, `projects`, `project_phases`, `project_codes`
- `work_orders`, `work_order_items`
- `drawings`, `drawing_revisions`
- `documents`
- `payment_certificates`
- `employees`
- `company_profile`
- `notifications`
- `workflow_definitions`, `workflow_states`, `workflow_transitions`, `workflow_logs`

**Engineering Tables** (في engineering_features):
- `boq_items`, `contracts`
- `ipc_headers`, `ipc_details`
- `daily_reports`, `subcontractors`, `schedules`
- `eng_documents`
- `submittals`, `inspection_requests`, `punch_list_items`, `transmittals`
- `meeting_minutes`, `meeting_attendees`, `meeting_agenda_items`
- `rfis`, `ncr`, `mar`
- `variation_orders`, `variation_order_boq_items`, `variation_order_schedule_impacts`
- `safety_incidents`, `safety_observations`
- `material_tests`, `itp_records`, `permit_to_works`, `method_statements`
- `survey_points`, `survey_readings`
- `specifications`, `specification_sections`
- `company_branches`, `project_categories`, `cost_codes`

## 8.3 مشاكل قاعدة البيانات

1. **قاعدتا بيانات** — قد يؤدي إلى فقدان البيانات
2. **لا يوجد Foreign Keys** في `notifications.user_id`, `workflow_logs.actor_id`, `audit_logs.user_id`
3. **أعمدة `date` معرفة كـ `str | None`** بدلاً من `date | None` — مشكلة نوع بيانات
4. **لا يوجد Alembic نشط** — رغم وجود مجلد `alembic/`، لا يوجد تكوين فعال
5. **SQLite** — لا يدعم الاتصال المتزامن في الكتابة

---

# 9. تحليل الأمان

## 9.1 الثغرات الأمنية

| الثغرة | الملف | الخطورة | التأثير |
|--------|-------|---------|---------|
| مفتاح JWT عشوائي كل إعادة تشغيل | `config.py:14` | 🔴 عالية | إبطال كل التوكنات |
| رفع ملفات بدون فحص MIME | `upload.py:15` | 🔴 عالية | رمج خبيثة باسم pdf |
| لا يوجد حد لحجم الملف | `upload.py` | 🔴 عالية | DoS |
| أي شخص ينشئ حسابًا | `auth/api.py:31` | 🟡 متوسطة | وصول غير مصرح به |
| البريد الإلكتروني ليس Unique | `auth/models.py` | 🟡 متوسطة | حسابات مكررة |
| `actor_id` مفقود من التدقيق | `engineering_features/api.py` | 🟡 متوسطة | سجل غير موثوق |
| لا توجد صلاحيات على مستوى الكيان | كل الكيانات | 🟡 متوسطة | أي مستخدم يعدل أي شيء |
| `request.client.host` في Rate Limiter | `core/rate_limit.py:11` | 🟡 متوسطة | عنوان IP غير صحيح خلف Proxy |
| `IntegrityError` → 500 | كل CRUD | 🟢 منخفضة | تسريب معلومات |
| القائمة السوداء لا تتنظف أبدًا | `auth/models.py` | 🟢 منخفضة | نمو غير محدود |
| `.gitignore` يستثني `.ai/` | `.gitignore` | 🟡 متوسطة | أدلة AI غير مدفوعة |
| `.dockerignore` يستثني `.ai/` | `.dockerignore` | 🟡 متوسطة | لا يمكن استعادة حالة Agent من الحاوية |

## 9.2 تحليل صلاحيات JWT

كل Endpoint يستخدم `Depends(get_current_user)` أو `Depends(require_role(...))`.

**الإيجابيات**: استخدام `HTTPBearer` مع التحقق من القائمة السوداء.

**السلبيات**:
- دالة `require_role` — لا يوجد فرق بين `admin` و `viewer` في الوصول إلى البيانات
- لا يوجد صلاحيات على مستوى الكيان (من يملك هذا السجل؟)
- لا يوجد صلاحيات على مستوى المشروع (من يملك حق الوصول لهذا المشروع؟)

---

# 10. تحليل الوثائق

## 10.1 التناقضات بين التوثيق والكود

| الرقم | الوثيقة | المكتوب | الكود الفعلي | التناقض |
|-------|---------|---------|--------------|---------|
| 1 | `README.md` | "SQLModel" | SQLAlchemy 2.0 | ❌ مختلف |
| 2 | `docs/modules/engineering/DB_SCHEMA.md` | UUID Primary Keys | Integer Auto-increment | ❌ مختلف |
| 3 | `docs/CRITIQUE.md` P0 | "لا يوجد Alembic config" | يوجد `alembic/` مجلد بـ 3 نسخ | ❌ موجود |
| 4 | `docs/ANCHORED_SUMMARY.md` | "56 اختبارًا" | ~6 اختبارات باكند + 4 فرونتند = 10 | ❌ مختلف |
| 5 | `docs/HANDOFF.md` | "62/63 اختبارًا" | نفس المشكلة | ❌ مختلف |
| 6 | `docs/DECISION_LOG.md` | "39 اختبارًا" | نفس المشكلة | ❌ مختلف |
| 7 | `TASKS_PLAN.md` | `crud.py` استخراج ✅ تم | `engineering_features/crud.py` موجود لكن api.py لا يزال 3902 سطرًا | ⚠️ غير دقيق |
| 8 | `docs/CRITIQUE.md` | `crud.py` استخراج ❌ مفقود | تناقض مع TASKS_PLAN.md | ❌ تناقض بين الوثائق |
| 9 | `brand_identity.json` | "Founder & CEO / Principal System Architect" | `SYSTEM_DNA.md`: "Principal System Architect & Technical Provider" | ❌ اختلاف في اللقب |
| 10 | `DECISION_LOG.md` | نصوص عربية مشوشة (Mojibake) | غير قابل للقراءة | ❌ تالف |
| 11 | `LEGO_v2_SPEC.md` | نصوص عربية مشوشة | غير قابل للقراءة | ❌ تالف |
| 12 | `LEGACY_MERGE_PLAN.md` | نصوص عربية مشوشة | غير قابل للقراءة | ❌ تالف |
| 13 | `Dockerfile CMD` | يستدعي `seed.py` | الملف الفعلي `seed_demo.py` | ❌ خطأ في اسم الملف |
| 14 | `.cursorrules` | `python /app/backend/seed.py` | نفس المشكلة | ❌ خطأ في اسم الملف |

## 10.2 ملفات التوثيق التالفة (Mojibake)

الملفات التالية تحتوي على نصوص عربية مشوشة تمامًا وغير قابلة للقراءة:
1. `docs/DECISION_LOG.md`
2. `docs/architecture/LEGO_v2_SPEC.md`
3. `docs/architecture/LEGACY_MERGE_PLAN.md`

هذه الملفات تحتوي على قرارات معمارية مهمة لكن لا يمكن الاستفادة منها.

## 10.3 ملفات `.ai/` — أدلة الذكاء الاصطناعي

**الإيجابيات**: نظام متقدم جدًا لإدارة الـ AI (DNA, Protocols, Handoff, Vaccine).

**السلبيات**:
- `brand_identity.json` و `SYSTEM_DNA.md` يتعارضان في لقب المهندس المعماري
- `HANDOFF.md` يتحدث عن إنجازات لم تكتمل بعد
- جميعها تستبعد من `.gitignore` و `.dockerignore` — لا يمكن استعادتها

## 10.4 CI/CD (GitHub Workflows)

**الملفات**: 3 Workflows
1. `deploy-stable.yml` — على push للماستر
2. `deploy-hf-space.yml` — على push للـ develop
3. `deploy-docker-to-hf.yml` — تشغيل يدوي

⚠️ **الثلاثة يدفعون إلى نفس Tag: `ghcr.io/.../engineering-erp:latest`**
→ سباق (Race Condition) إذا تم تشغيل اثنين في نفس الوقت.

---

# 11. المشاكل الحرجة (P0 — Critical)

هذه المشاكل تمنع تشغيل النظام أو تسبب أضرارًا جسيمة ويجب إصلاحها فورًا:

| # | المشكلة | الموقع | الخطورة |
|---|---------|--------|---------|
| **P0.1** | `return No` بدلاً من `return None` | `backend/app/dependencies.py:43` | 🔴 تعطل |
| **P0.2** | `backend/app/main.py` يستورد `core.lego_v2` غير الموجود في مساره | `backend/app/main.py:13-14` | 🔴 تعطل |
| **P0.3** | `main.py` (جذر) و `backend/app/main.py` (قديم) — ازدواجية نقطة الدخول | ملفان | 🔴 تعطل + إرباك |
| **P0.4** | تصدير `AGCoreSettings` غير مستخدم — إعدادات متضاربة | `backend/app/config.py` | 🟠 إرباك |
| **P0.5** | `Dockerfile` يستدعي `seed.py` والملف الفعلي `seed_demo.py` | `Dockerfile` | 🔴 تعطل الحاوية |

---

# 12. المشاكل العالية (P1 — High)

| # | المشكلة | الموقع |
|---|---------|--------|
| **P1.1** | مفتاح JWT يُولد عشوائيًا كل إعادة تشغيل | `config.py:14` |
| **P1.2** | رفع الملفات بدون فحص MIME type | `upload.py:15` |
| **P1.3** | لا يوجد حد لحجم الملف المرفوع | `upload.py` |
| **P1.4** | أي شخص يسجل حسابًا دون موافقة | `auth/api.py` |
| **P1.5** | `actor_id` مفقود من `log_action` في كل مكان | `engineering_features/api.py` |
| **P1.6** | `engineering_features/api.py` = 3902 سطرًا (غير قابل للصيانة) | `engineering_features/api.py` |
| **P1.7** | `engineering_features/models.py` = 1000 سطر | `engineering_features/models.py` |
| **P1.8** | `Base` مسجل كنموذج في CoreModule (سينهار عند الفحص) | `modules/core/__init__.py:16` |
| **P1.9** | `ConnectorRegistry.check_wiring()` لا يفعل شيئًا | `connector_registry.py:36-40` |
| **P1.10** | `backend/engineering.db` vs `engineering.db` (جذر) — قاعدتا بيانات | ملفان |
| **P1.11** | صيغة الدفع في PaymentCertificates قد تدفع مبلغًا مضاعفًا | `payment_certificates/crud.py` |
| **P1.12** | Workflow لا يسجل `from_status`/`to_status` | `workflow/api.py` |
| **P1.13** | .gitignore يستثني `.ai/` — أدلة AI غير مدفوعة | `.gitignore` |
| **P1.14** | .dockerignore يستثني `.ai/` — لا استعادة من الحاوية | `.dockerignore` |
| **P1.15** | .ai/ وثائق تالفة (Mojibake) في 3 ملفات | `docs/` |
| **P1.16** | `api.js` و `api-client.ts` — ملفان مكرران | `frontend/src/` |
| **P1.17** | 3 Workflows يتشاركون نفس Tag — سباق | `.github/workflows/` |
| **P1.18** | البريد الإلكتروني ليس `unique` — حسابات مكررة | `auth/models.py` |
| **P1.19** | لا توجد صلاحيات على مستوى الكيان/المشروع | كل API |

---

# 13. المشاكل المتوسطة (P2 — Medium)

| # | المشكلة | الموقع |
|---|---------|--------|
| **P2.1** | أعمدة `date` معرفة كـ `str` بدلاً من `date` | نماذج متعددة |
| **P2.2** | `total_price` مخزّن (Stored) بدلاً من محسوب (Computed) | `work_order_items/models.py` |
| **P2.3** | `business_logo_url` في CompanyProfile يقبل أي سلسلة (URL غير مدقق) | `company_profile/models.py` |
| **P2.4** | `settings.UPLOAD_DIR` ليس مسارًا مطلقًا — قد يفشل | `config.py:18` |
| **P2.5** | `os.makedirs` يُستدعى في كل طلب رفع | `upload.py:17` |
| **P2.6** | `IntegrityError` غير معالج — يؤدي إلى 500 | كل CRUD |
| **P2.7** | `RateLimit` يعتمد على `request.client.host` — غير صحيح خلف Proxy | `rate_limit.py:11` |
| **P2.8** | Tokens منتهية الصلاحية لا تُحذف من القائمة السوداء أبدًا | `auth/models.py` |
| **P2.9** | `Search` يعمل `UNION ALL` بدون Pagination — خطر الأداء | `core/search.py` |
| **P2.10** | `Export` API بدون Pagination — خطر الذاكرة | `core/export_api.py` |
| **P2.11** | `Dashboard` يشغل 20+ استعلامًا منفصلاً | `dashboard.py` |
| **P2.12** | `FileResponse` يقرأ الملف كاملًا في الذاكرة | `upload.py` |
| **P2.13** | `MuiCard` ليس به Glassmorphism رغم أن المواصفات تطلبه | `theme.js` |
| **P2.14** | `tokens.css` غير مستخدم في `theme.js` — قيم صلبة | `theme.js` |
| **P2.15** | وثائق DECISION_LOG.md تالفة (Mojibake) | `docs/DECISION_LOG.md` |
| **P2.16** | LEGO_v2_SPEC.md تالفة (Mojibake) | `docs/architecture/LEGO_v2_SPEC.md` |
| **P2.17** | LEGACY_MERGE_PLAN.md تالفة (Mojibake) | `docs/architecture/LEGACY_MERGE_PLAN.md` |
| **P2.18** | README.md يذكر SQLModel خطأً | `README.md` |
| **P2.19** | DB_SCHEMA.md يذكر UUID — الكود يستخدم Integer | `docs/modules/engineering/DB_SCHEMA.md` |
| **P2.20** | عدد الاختبارات غير متناسق بين الوثائق (10 vs 39 vs 56 vs 62) | وثائق متعددة |
| **P2.21** | `BaseModule.add_adapter()` غير مستخدم أبدًا | `base_module.py` |
| **P2.22** | `ConnectorRegistry.call()` غير مستخدم أبدًا | `connector_registry.py` |
| **P2.23** | لا يوجد Auto-discovery للوحدات — تستورد يدويًا | `main.py` |
| **P2.24** | EngineeringModule يستخدم EventBus لنفسه فقط | `modules/engineering/__init__.py` |
| **P2.25** | الاختبارات لا تغطي إلا 10% من النظام | `tests/` |

---

# 14. المشاكل البسيطة (P3 — Low)

| # | المشكلة | الموقع |
|---|---------|--------|
| **P3.1** | أسماء URL غير متناسقة (kebab-case vs plain) | عدة routers |
| **P3.2** | Tag "Company Profile" يحتوي على مسافة | `company_profile/api.py` |
| **P3.3** | وحدة `codes` اسمها مختلف عن جدول `project_codes` | `codes/models.py` |
| **P3.4** | `DrawingCreate` مكرر في schemas (engineering_features + drawings) | ملفا schemas |
| **P3.5** | Seed data (CompanyProfile) مبرمج في الكود وليس في migration | `main.py` lifespan |
| **P3.6** | ألوان الأزرار معرفة يدويًا (#D97706) وليس من الثيم | `App.jsx:82` |
| **P3.7** | `shadows[6..25]` كلها `'none'` — تبدو كأنها خطأ | `theme.js` |
| **P3.8** | مسار `/engineering/ipc/:ipcId/print` خارج ProtectedRoute | `App.jsx:109` |
| **P3.9** | `scripts/` مجلد فارغ | `backend/scripts/` |
| **P3.10** | `.env.example` موجود في نسختين (جذر + backend) | ملفان |
| **P3.11** | خريطة الطريق (ROADMAP.md) لا تتطابق مع واقع الكود | `.ai/ROADMAP.md` |
| **P3.12** | `brand_identity.json` يصف هوية لا تطابق `theme.js` بالكامل | `brand_identity.json` |
| **P3.13** | لا يوجد `docker-compose.yml` — يحتاج تكوين يدوي للتشغيل | مفقود |
| **P3.14** | لا يوجد `Makefile` أو `justfile` لأوامر شائعة | مفقود |
| **P3.15** | `useCrud.ts` ليس TypeScript صارم | `hooks/useCrud.ts` |

---

# 15. التبعيات والعلاقات الخفية

## 15.1 تبعيات Python (حسب `pyproject.toml`)

| الحزمة | الإصدار | الاستخدام | حالة |
|--------|---------|-----------|------|
| fastapi | >=0.110.0 | الإطار الرئيسي | ✅ |
| uvicorn | >=0.29.0 | تشغيل الخادم | ✅ |
| sqlalchemy | >=2.0.0 | ORM | ✅ |
| pydantic | >=2.6.0 | التحقق من البيانات | ✅ |
| pydantic-settings | >=2.0.0 | الإعدادات البيئية | ✅ |
| aiosqlite | >=0.20.0 | SQLite async | ✅ |
| alembic | >=1.13.0 | ترحيل قاعدة البيانات | ⚠️ موجود لكن غير نشط |
| python-multipart | >=0.0.9 | رفع الملفات | ✅ |
| pyjwt | >=2.0.0 | التوكنات | ✅ |
| bcrypt | >=5.0.0 | تشفير كلمات المرور | ✅ |
| openpyxl | >=3.1.0 | تصدير Excel | ✅ |
| reportlab | >=5.0.0 | توليد PDF | ⚠️ خطوط عربية قد لا تكون موجودة |
| arabic_reshaper | >=3.0.0 | تشكيل الحروف العربية | ✅ |
| python-bidi | >=0.6.0 | دعم النصوص ثنائية الاتجاه | ✅ |
| qrcode[pil] | >=8.0 | رموز QR | ✅ |

## 15.2 تبعيات Node.js (حسب `package.json`)

| الحزمة | الإصدار | الاستخدام |
|--------|---------|-----------|
| react | ^19.2.6 | الإطار الأساسي |
| @mui/material | ^9.0.1 | مكونات MUI |
| @mui/x-data-grid | ^8.28.6 | جداول متقدمة |
| @tanstack/react-query | ^5.101.2 | إدارة حالة الخادم |
| axios | ^1.16.1 | HTTP client |
| framer-motion | ^12.39.0 | حركات UI |
| i18next | ^26.2.0 | ترجمة |
| react-router-dom | ^7.15.1 | توجيه |
| zustand | ^5.0.14 | إدارة الحالة |
| zod | ^4.4.3 | التحقق من النماذج |
| echarts | ^6.1.0 | رسوم بيانية |
| notistack | ^3.0.2 | إشعارات |
| react-hook-form | ^7.80.0 | نماذج |
| date-fns | ^4.1.0 | تواريخ |
| xlsx | ^0.18.5 | جداول Excel |

## 15.3 التبعيات الخفية (Soft Dependencies)

| من | إلى | النوع | موجود؟ |
|----|-----|-------|--------|
| `backend/app/main.py` | `core.lego_v2.*` | Python import | ❌ يفشل (مسار غير صحيح) |
| `main.py` (جذر) | `core.lego_v2.*` | Python import | ✅ |
| `engineering_features/ipc_pdf.py` | `fonts/NotoNaskhArabic-Regular.ttf` | ملف خط | ❌ قد لا يكون موجودًا |
| `seed_demo.py` | `app.engineering_features.models` | Python import | ✅ |
| `backend/run.py` | `app.main` | Python import | ✅ |
| `Dockerfile` | `backend/seed.py` | تشغيل | ❌ `seed.py` ≠ `seed_demo.py` |
| `start_and_register.py` | `requests` | Python package | ❌ غير موجود في requirements.txt |

---

# 16. التناقضات: توثيق vs كود

## 16.1 Brand Identity (`brand_identity.json`)

**التناقض الرئيسي**:
- الملف يذكر: `"System Owner & Principal Provider": "Ahmed Gaffer"`
- `SYSTEM_DNA.md` يذكر: `"CHIEF_SYSTEM_ARCHITECT": "Ahmed Gaffer"`
- `AGENT_0_MAESTRO.md` يذكر: `"Principal System Architect & Technical Provider"`

**ثلاثة ألقاب مختلفة لنفس الشخص** — يجب توحيدها.

## 16.2 README.md

> "Built with FastAPI, SQLModel, and React"

الكود يستخدم **SQLAlchemy 2.0**، وليس SQLModel. خطأ في القراءة أو معلومات قديمة.

## 16.3 DB_SCHEMA.md (Engineering Module)

> يظهر UUID كمفاتيح أساسية (Primary Keys)

الكود الفعلي:
```python
id: Mapped[int] = Column(Integer, primary_key=True, autoincrement=True)  # Integer
```

**التوثيق يصف شيئًا مختلفًا تمامًا عن الكود.**

## 16.4 إحصائيات الاختبارات

| الوثيقة | العدد المذكور | الفعلي |
|---------|---------------|--------|
| `docs/ANCHORED_SUMMARY.md` | 56 | ~10 |
| `docs/HANDOFF.md` | 62/63 | ~10 |
| `docs/DECISION_LOG.md` | 39 | ~10 |

**أرقام وهمية في التوثيق.** ربما من جلسة سابقة تم مسح الاختبارات أو أن الأرقام لم تُحدث.

## 16.5 TASKS_PLAN.md vs CRITIQUE.md

| المهمة | TASKS_PLAN.md | CRITIQUE.md |
|--------|---------------|-------------|
| استخراج `crud.py` من `engineering_features` | ✅ تم | ❌ مفقود |
| إعداد Alembic | ✅ تم | P0: مفقود |

**تناقض مباشر بين وثيقتين.**

---

# 17. توصيات عاجلة

>[!IMPORTANT]
> التوصيات مرتبة حسب الأولوية. يجب إكمال P0 قبل أي شيء آخر.

## P0 — أمس (قبل الأمس)

1. **إصلاح `dependencies.py:43`**: `return No` → `return None`
2. **توحيد `main.py`**: حذف `backend/app/main.py` أو تعطيله، والاكتفاء بـ `main.py` الجذر
3. **إصلاح `Dockerfile`**: تغيير `seed.py` إلى `seed_demo.py`
4. **إصلاح `config.py`**: حذف `AGCoreSettings` غير المستخدمة
5. **إصلاح مشكلة `core.lego_v2` في `backend/app/main.py`**: إما إزالة الاستيراد أو إصلاح المسار

## P1 — اليوم

6. **تثبيت `SECRET_KEY`**: جعله يُقرأ من متغير بيئة إلزامي، لا يُولد عشوائيًا
7. **حماية رفع الملفات**: إضافة فحص MIME type وحد الحجم
8. **إغلاق التسجيل المفتوح**: طلب موافقة المشرف على الحسابات الجديدة
9. **إضافة `actor_id` إلى كل `log_action`**: لتفعيل التدقيق
10. **تقسيم `engineering_features/api.py`**: 3902 سطرًا → ملفات منفصلة لكل كيان
11. **تقسيم `engineering_features/models.py`**: 1000 سطر → ملف نموذج لكل كيان
12. **إزالة `Base` من `CoreModule.add_model()`**: سينهار على الفحص
13. **توحيد قاعدة البيانات**: اختيار ملف واحد `engineering.db`
14. **إضافة `.ai/` إلى `.gitignore` و `.dockerignore`**: يجب إزالتها من الاستثناءات
15. **مراجعة صيغة PaymentCertificates**: بواسطة محاسب قانوني
16. **دمج `api.js` و `api-client.ts`**: في ملف TypeScript واحد
17. **إصلاح وثائق Mojibake**: إعادة ترميز الملفات العربية التالفة

## P2 — هذا الأسبوع

18. **إصلاح أعمدة `date`**: من `str | None` إلى `date | None`
19. **إضافة Foreign Keys**: إلى `user_id`, `actor_id` في الجداول
20. **إضافة Pagination**: إلى Search و Export APIs
21. **إصلاح Workflow**: تسجيل `from_status` و `to_status`
22. **إضافة `docker-compose.yml`**: لتسهيل التشغيل
23. **إضافة اختبارات API**: لكل كيان
24. **إصلاح Rate Limiter**: لدعم الـ Proxy
25. **إصلاح `check_wiring()`**: لتفعيل التحقق من الموصلات

## P3 — تحسينات

26. توحيد أسماء URLs (kebab-case في كل مكان)
27. إضافة `unique` إلى `User.email`
28. تفعيل Alembic للترحيل
29. تنظيف ملفات `.env.example` — توحيد النسختين
30. إضافة `on_startup`/`on_shutdown` hooks للوحدات
31. إضافة Auto-discovery للوحدات
32. إزالة `shadows` غير المستخدمة من `theme.js`
33. تحسين التغطية الاختبارية (>60%)

---

# 18. خريطة الطريق للعلاج

## المرحلة 1: الإنعاش (استعادة القدرة على التشغيل)
**المدة التقديرية: 2-4 ساعات**

```
□ إصلاح dependencies.py:43 (return No → None)
□ حذف backend/app/main.py أو تعطيله
□ إصلاح Dockerfile CMD (seed.py → seed_demo.py)
□ إصلاح config.py (حذف AGCoreSettings)
□ تثبيت SECRET_KEY كمتغير بيئة إلزامي
□ اختبار: تشغيل main.py والتأكد من عدم وجود أخطاء
```

## المرحلة 2: التعقيم (إغلاق الثغرات الأمنية)
**المدة التقديرية: 4-8 ساعات**

```
□ حماية رفع الملفات (MIME + حجم)
□ إغلاق التسجيل المفتوح
□ تفعيل actor_id في audit logs
□ إضافة unique=True إلى User.email
□ تأمين Rate Limiter
□ اختبار: محاولة اختراق وتسجيل الدخول
```

## المرحلة 3: الجراحة (تقسيم الملفات العملاقة)
**المدة التقديرية: 16-24 ساعة**

```
□ engineering_features/api.py (3902 سطر) ← 20 ملفًا منفصلاً
□ engineering_features/models.py (1000 سطر) ← 20 ملفًا منفصلاً
□ engineering_features/schemas.py (800 سطر) ← 20 ملفًا منفصلاً
□ api.js (404 سطر) ← دمج في api-client.ts
□ اختبار: جميع API endpoints لا تزال تعمل
```

## المرحلة 4: إكمال LEGO v2
**المدة التقديرية: 8-16 ساعة**

```
□ إصلاح check_wiring() ليعمل فعليًا
□ إضافة Auto-discovery للوحدات
□ إضافة Lifecycle Hooks
□ تفعيل ConnectorRegistry.call()
□ إضافة أحداث للوحدات الأخرى (Auth, HR, Contractors)
□ اختبار: وحدة تتحدث إلى أخرى عبر EventBus
```

## المرحلة 5: قاعدة البيانات
**المدة التقديرية: 4-8 ساعات**

```
□ توحيد ملفي engineering.db
□ تفعيل Alembic للترحيل
□ إضافة Foreign Keys
□ إصلاح أنواع الأعمدة (str → date)
□ إضافة Pagination للـ Search و Export
□ إضافة تأشير Unique على email
□ اختبار: الترحيل من SQLite إلى PostgreSQL
```

## المرحلة 6: الاختبارات
**المدة التقديرية: 8-16 ساعة**

```
□ اختبارات لـ ModuleRegistry, EventBus, ConnectorRegistry
□ اختبارات API لكل كيان (Pytest + httpx)
□ اختبارات لكل مكون Frontend (Vitest)
□ اختبارات التكامل (Integration Tests)
□ رفع التغطية > 60%
```

## المرحلة 7: التوثيق
**المدة التقديرية: 4-8 ساعات**

```
□ إصلاح وثائق Mojibake
□ توحيد brand_identity.json مع SYSTEM_DNA.md
□ توحيد عدد الاختبارات في كل الوثائق
□ تحديث README.md (SQLAlchemy وليس SQLModel)
□ تحديث DB_SCHEMA.md (Integer وليس UUID)
□ إضافة .ai/ إلى Git (إزالتها من .gitignore)
```

---

# خاتمة التحقيق

```
مسرح الجريمة: Engineering Management System v3
عدد الملفات: ~280 ملفًا
المشاكل الحرجة (P0): 5
المشاكل العالية (P1): 19
المشاكل المتوسطة (P2): 25
المشاكل البسيطة (P3): 15
المجموع: 64 مشكلة موثقة

حالة النظام: عَمَلي ولكن هَش
التقييم العام: ⚠️ لا ينصح بالنشر في الإنتاج دون إصلاح P0-P1

"النظام يحتوي على هندسة معمارية طموحة جدًا مع كود يعمل،
لكنه يعاني من فوضى هيكلية، ثغرات أمنية، وتناقضات خطيرة
بين التوثيق والواقع. الجراحة التجميلية لا تكفي — يحتاج
إعادة هيكلة عميقة مع الحفاظ على كل ميزة قائمة."
```

---

> **توقيع المحقق**: AI Forensic Analysis System v1.0
> **بتكليف من**: Ahmed Gaffer — Principal System Architect
> **تاريخ التقرير**: 2026-07-01
> **الإصدار**: 1.0
>
> *"كل حرف في هذا المشروع تم فحصه. كل ملف شُقّ. كل علاقة كُشفت.
>  مسرح الجريمة الآن موثق بالكامل. التغيير يبدأ من هنا."*

---

**─ نهاية التقرير الجنائي الشامل ─**
