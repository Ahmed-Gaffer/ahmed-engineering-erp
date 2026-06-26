# DECISION LOG — المقارنة والقرارات النهائية

## التاريخ: 2026-06-16

---

## 1. المقارنة بين المشروع القديم والجديد

### المشروع القديم (`engineering-management-system`)
**البنية**: Monolith تقليدي
**الحالة**: نظام كامل يعمل

| الميزة | الحالة |
|--------|--------|
| Backend (FastAPI + SQLAlchemy Async) | ✅ كامل — 10 Entities مع GenericCRUD |
| Auth + RBAC (JWT + bcrypt) | ✅ كامل — admin, engineer, viewer |
| Audit Logs | ✅ لكل عمليات CRUD |
| File Upload | ✅ 13 نوع ملف هندسي |
| Export to Excel | ✅ لكل entity |
| Global Search | ✅ Contractors, Projects, Employees |
| Notifications | ✅ CRUD + unread count |
| Activities Feed | ✅ سجل جميع العمليات |
| Frontend (React 19 + MUI 9 + Vite) | ✅ كامل — i18n/RTL, Dark Mode, Dashboard |
| Tests (pytest) | ✅ 39 اختبار |
| Alembic Migrations | ✅ موجودة |
| Modular Architecture | ❌ غير موجود |

### المشروع الجديد (`engineering-management-system-3`) — بعد التحليل
**البنية**: Modular Monolith (LEGO v2)
**الحالة**: دمج تم مسبقاً — يحتاج إصلاحات تشغيلية

| الميزة | الحالة |
|--------|--------|
| LEGO v2 Core | ✅ ModuleRegistry + EventBus + Connectors |
| Old Backend منقول | ✅ `backend/app/` كامل |
| Frontend منقول | ✅ `frontend/` كامل مع node_modules |
| Modules Wrappers | ✅ engineering, auth, hr, contractors, core |
| التشغيل | ❌ كان معطلاً — تم الإصلاح |

---

## 2. المشاكل التي تم اكتشافها وإصلاحها

### المشكلة 1: StaticFiles mount يتعارض مع API routes
**السبب**: `app.mount("/", StaticFiles(html=True))` كان يعترض كل الـ requests
**الحل**: استخدام catch-all route بدلاً من StaticFiles mount على `/`
**الملف**: `main.py`

### المشكلة 2: Double import of Base module
**السبب**: `main.py` يستخدم `from backend.app.core.base import Base` بينما الـ modules تستخدم `from app.core.base import Base` — Python يعاملهما كـ module مختلفين
**النتيجة**: `Base.metadata` كان فارغاً — الجداول لم تنشأ
**الحل**: توحيد جميع imports إلى `from app.xxx import xxx` (لأن `backend/` مضاف لـ sys.path)
**الملف**: `main.py`

### المشكلة 3: تباعد التبعيات
**السبب**: `pyproject.toml` يحتوي `psycopg2`, `sqlmodel`, `passlib` (غير مستخدمة) ولا يحتوي `aiosqlite`, `pyjwt`, `bcrypt` (المستخدمة فعلياً)
**الحل**: تحديث `pyproject.toml` ليطابق `backend/requirements.txt`

---

## 3. الوضع النهائي

```
engineering-management-system-3/
├── main.py                  # ✅ نقطة الدخول — LEGO v2 + Legacy backend
├── core/lego_v2/            # ✅ البنية المعيارية
│   ├── registry/
│   ├── connectors/
│   ├── event_bus/
│   └── shared/
├── modules/                 # ✅ الموديولات المسجلة
│   ├── engineering/         # 10 entities
│   ├── auth/                # JWT + RBAC
│   ├── hr/                  # Employees
│   ├── contractors/         # Contractors
│   └── core/                # Export, Search, Audit
├── backend/app/             # ✅ Legacy backend (10 entities)
├── frontend/                # ✅ React SPA (جاهز)
├── tests/                   # ✅ 39/39 passing
└── .env                     # ✅ SQLite config
```

### API Endpoints: 80 route + Health + SPA
### Entities: 10 (contractors, projects, phases, codes, work_orders, work_order_items, drawings, drawing_revisions, documents, payment_certificates, employees)

---

## 4. القرارات المعمارية

### قرار 1: الاحتفاظ بالـ Legacy Backend كما هو
**لماذا؟** يعمل بكفاءة ويمتلك 39 اختباراً ناجحاً. إعادة كتابته ستكون مكلفة دون فائدة تذكر حالياً.

### قرار 2: LEGO v2 كطبقة فوقية (Facade)
**لماذا؟** يسمح بفك وتركيب الموديولات مستقبلاً. الموديولات الحالية تغلف الـ legacy entities فقط.

### قرار 3: SQLite في التطوير — PostgreSQL لاحقاً
**لماذا؟** للبدء السريع. الانتقال لـ PostgreSQL سهل عبر تغيير `.env`.

### قرار 4: Frontend يُخدم عبر catch-all route
**لماذا؟** `StaticFiles mount` على `/` يتعارض مع API routes. الحل الحالي يخدم SPA لغير مسارات API.

---

## 5. الخطوات القادمة (مقترحة)

| الأولوية | المهمة |
|----------|--------|
| 🔴 عالية | إنشاء HR Module كامل (جداول، API، UI) |
| 🔴 عالية | ربط EventBus بين Engineering و HR |
| 🟡 متوسطة | إضافة Alembic Migrations موحدة |
| 🟡 متوسطة | إضافة Dashboard محسّن للمكتب الفني |
| 🟢 منخفضة | PostgreSQL في الإنتاج |
| 🟢 منخفضة | Docker Compose للتشغيل الكامل |

---

## 6. كيفية التشغيل

```bash
cd "E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system-3"
pip install -e ".[dev]"
uvicorn main:app --reload --port 8000
```

### Login:
- **URL**: http://localhost:8000
- **Username**: `admin`
- **Password**: `admin123`
- **API Docs**: http://localhost:8000/docs

### تشغيل الاختبارات:
```bash
$env:PYTHONPATH="backend"
pytest backend/tests/ -v
```
