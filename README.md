---
title: Ahmed Engineering Erp
emoji: 🏗️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# Engineering Management System v3

## نظام إدارة المشاريع الهندسية — LEGO v2

### نظرة عامة

نظام متكامل لإدارة المشاريع الهندسية الضخمة، مبني على البنية المعيارية LEGO v2 التي تسمح بفك وتركيب الموديولات بسهولة.

### الموديولات

| الموديول | الحالة | المستخدم |
|----------|--------|----------|
| `engineering` | ✅ جاهز | المكتب الفني |
| `hr` | 📋 مخطط | الموارد البشرية |
| `finance` | 📋 مخطط | المحاسبة |
| `inventory` | 📋 مخطط | المخازن |

### التقنيات

- **Backend**: FastAPI + SQLModel + PostgreSQL
- **Architecture**: LEGO v2 (ModuleRegistry + Connectors + EventBus)
- **Pattern**: Modular Monolith

### التشغيل

```bash
# تثبيت التبعيات
pip install -e ".[dev]"

# تشغيل التطبيق
uvicorn main:app --reload

# الوصول للـ API Docs
open http://localhost:8000/docs
```

### هيكل المشروع

```
engineering-management-system-3/
├── core/lego_v2/           # البنية المعيارية المشتركة
│   ├── registry/            # ModuleRegistry
│   ├── connectors/          # Inter-module connectors
│   ├── event_bus/           # EventBus
│   └── shared/              # Shared utilities
├── modules/                 # الموديولات
│   ├── engineering/         # إدارة المشاريع الهندسية
│   │   ├── models/          # SQLModel models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── routers/         # API endpoints
│   │   └── events/          # Event handlers
│   ├── hr/                  # (مستقبلاً)
│   ├── finance/             # (مستقبلاً)
│   └── inventory/           # (مستقبلاً)
├── db/                      # Migrations & seeds
├── tests/                   # Tests
├── doc/                     # Documentation
└── main.py                  # Application entry point
```

### موديول Engineering

#### الكيانات الرئيسية

1. **Project** — المشروع
2. **Contract** — العقد
3. **BOQItem** — بند كميات
4. **IPCHeader/IPCDetail** — المستخلصات
5. **Drawing** — المخططات
6. **DailyReport** — التقارير اليومية
7. **Subcontractor** — المقاولون الباطن
8. **Schedule** — الجداول الزمنية (WBS)
9. **Document** — المستندات

#### API Endpoints

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/engineering/projects` | POST/GET | إدارة المشاريع |
| `/engineering/projects/{id}/summary` | GET | ملخص المشروع |
| `/engineering/contracts` | POST | إدارة العقود |
| `/engineering/boq-items` | POST | بنود الكميات |
| `/engineering/ipcs` | POST/GET | المستخلصات |
| `/engineering/drawings` | POST/GET | المخططات |
| `/engineering/daily-reports` | POST/GET | التقارير اليومية |
| `/engineering/subcontractors` | POST/GET | المقاولون الباطن |
| `/engineering/schedules` | POST/GET | الجداول الزمنية |
| `/engineering/documents` | POST/GET | المستندات |

### LEGO v2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LEGO v2 Core Infrastructure               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ ModuleRegistry│  │ Connectors  │  │     EventBus        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  engineering  │   │      hr       │   │    finance    │
│   (المكتب الفني)│   │  (الموارد البشرية)│   │   (المالية)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### قواعد LEGO v2

1. **لا import مباشر** بين موديولين
2. **كل موديول له namespace** خاص في قاعدة البيانات
3. **shared models فقط** في `core/shared`
4. **كل موديول يُسجّل نفسه** في ModuleRegistry

### التوثيق

- [LEGO v2 Specification](doc/architecture/LEGO_v2_SPEC.md)
- [Database Schema — Engineering](doc/modules/engineering/DB_SCHEMA.md)
- [Project Map](PROJECT_MAP.md)

---

**الإصدار**: 3.0.0 | **البنية**: LEGO v2
