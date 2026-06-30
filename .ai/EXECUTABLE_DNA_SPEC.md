# Executable DNA Spec — LEGO v2 Integration: Phase 1-3 Models + Search + Events
## Agent I · نسّاج النسيج · 2026-06-28

---

### المهمة
ربط 10 كيانات جديدة (Phase 1-3) ببنية LEGO v2:
1. تسجيلها في EngineeringModule
2. إضافتها للبحث الشامل
3. تعريف EventBus events + Notification Adapter

---

### 1. المسارات الدقيقة

| الملف | الإجراء |
|-------|---------|
| `modules/engineering/__init__.py` (السطور 23-26) | إضافة 10 models جدد |
| `backend/app/core/search.py` (السطور 12-22) | إضافة 10 entries لـ SEARCHABLE_MODELS |
| `core/lego_v2/event_bus/events.py` **(جديد)** | Event name constants |
| `backend/app/engineering_features/notification_adapter.py` **(جديد)** | EventBus handler → Notification creation |
| `backend/tests/test_lego_v2.py` **(جديد)** | Integration tests |

### 2. التوقيعات والأسماء

#### events.py
```python
# Event name constants
ENGINEERING_EVENTS = {
    "SUBMITTAL_SUBMITTED": "engineering.submittal.submitted",
    "SUBMITTAL_APPROVED": "engineering.submittal.approved",
    "SUBMITTAL_REJECTED": "engineering.submittal.rejected",
    "INSPECTION_COMPLETED": "engineering.inspection.completed",
    "INSPECTION_PASSED": "engineering.inspection.passed",
    "INSPECTION_FAILED": "engineering.inspection.failed",
    "PUNCHLIST_COMPLETED": "engineering.punchlist.completed",
    "PUNCHLIST_VERIFIED": "engineering.punchlist.verified",
    "TRANSMITTAL_SENT": "engineering.transmittal.sent",
    "SAFETY_INCIDENT_INVESTIGATED": "engineering.safety_incident.investigated",
    "SAFETY_OBSERVATION_RESOLVED": "engineering.safety_observation.resolved",
}
```

#### notification_adapter.py
```python
async def handle_engineering_event(event: dict) -> None
# تستقبل event من EventBus، تنشئ Notification + WorkflowLog
# تستخدم _create_notification() + log_action() الموجودين
```

#### engineering __init__.py — إضافة models
```python
from app.engineering_features.models import (
    BOQItem, Contract, IPCHeader, IPCDetail,
    DailyReport, Subcontractor, Schedule, EngDocument,
    SubmittalRegister, InspectionRequest, PunchListItem, Transmittal,
    CompanyBranch, ProjectCategory, ProjectCategoryLink, CostCode,
    SafetyIncident, SafetyObservation,
)
```

#### search.py — إضافة entries
```python
SEARCHABLE_MODELS = {
    ...existing entries...,
    "submittals": (SubmittalRegister, ["submittal_number", "title"], "/engineering/submittals", False),
    "inspections": (InspectionRequest, ["inspection_number", "title"], "/engineering/inspection-requests", False),
    "punch_list": (PunchListItem, ["item_number", "title"], "/engineering/punch-list", False),
    "transmittals": (Transmittal, ["transmittal_number", "title"], "/engineering/transmittals", False),
    "branches": (CompanyBranch, ["name", "code"], "/engineering/branches", False),
    "categories": (ProjectCategory, ["name"], "/engineering/categories", False),
    "cost_codes": (CostCode, ["code", "name"], "/engineering/cost-codes", False),
    "safety_incidents": (SafetyIncident, ["incident_number", "title"], "/engineering/safety-incidents", False),
    "safety_observations": (SafetyObservation, ["observation_number", "title"], "/engineering/safety-observations", False),
}
```

### 3. التجريدات الواجب استخدامها

- `event_bus.subscribe()` في `BaseModule.add_event()` — موجود
- `event_bus.publish()` في `BaseModule.emit_event()` — موجود
- `_create_notification()` في `engineering_features/api.py` line 3020 — موجود
- `log_action()` في `workflow/engine.py` — موجود
- `Notification` model في `notifications/models.py` — موجود

### 4. هيكل جزئي (Skeleton)

**notification_adapter.py:**
```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.notifications.models import Notification
from app.workflow.engine import log_action

async def handle_engineering_event(event: dict) -> None:
    payload = event.get("payload", {})
    entity_type = payload.get("entity_type", "")
    entity_id = payload.get("entity_id")
    action = payload.get("action", "")
    from_status = payload.get("from_status")
    to_status = payload.get("to_status")
    actor_id = payload.get("actor_id")
    actor_name = payload.get("actor_name", "")
    assigned_to = payload.get("assigned_to")
    comment = payload.get("comment", "")
    user_id = payload.get("user_id")

    if not user_id:
        return

    title_map = {
        "submitted": f"{entity_type.replace('_', ' ').title()} Submitted",
        "approved": f"{entity_type.replace('_', ' ').title()} Approved",
        "rejected": f"{entity_type.replace('_', ' ').title()} Rejected",
    }
    title = title_map.get(action, f"{entity_type.replace('_', ' ').title()} {action.replace('_', ' ').title()}")

    async with async_session() as db:
        notif = Notification(user_id=user_id, title=title, message=comment, type="info")
        db.add(notif)
        await db.flush()
        await log_action(db, entity_type, entity_id, action, from_status, to_status, actor_id, actor_name, assigned_to, comment)
        await db.commit()
```

### 5. تحذيرات اتساق

- لا تلمس `api.py` (3172 سطر) — notification_adapter يستخدم نفس الدوال لكن عبر EventBus
- `events.py` يحدد constants فقط — القيم الفعلية تُستخدم عند الاستدعاء من API
- `engineering/__init__.py` imports تضيف فقط، لا تمس الموجود
- `search.py` إضافة entries فقط — لا تغيير في logic

### 6. ⬛ قائمة الامتثال (Compliance Checklist)

☐ imports تطابق نمط SYSTEM_DNA.md (snake_case للـ Python، PascalCase للـ models)
☐ events.py يستخدم upper_case constants (نمط Python)
☐ notification_adapter يستخدم `async_session()` من `app.database` (موجود)
☐ search.py entries تتبع نفس tuple format: `(Model, [fields], base_path, has_detail)`
☐ engineering/__init__.py يضيف models فقط — لا يغير الـ routers
☐ لا إضافة business logic — notification_adapter مجرد bridge
☐ Fabric Score المتوقع: 10/10 — كل الكود يتبع الأنماط الموجودة بالضبط
