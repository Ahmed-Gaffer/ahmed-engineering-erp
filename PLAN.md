# PLAN — LEGO v2 Migration from Legacy EMS

## الهدف
دمج المشروع القديم (`engineering-management-system`) مع البنية المعيارية LEGO v2، مع الحفاظ على كل الميزات العملية.

## المراحل

### Phase 1: Foundation (الأساس)
- [ ] نقل backend بالكامل من المشروع القديم
- [ ] نقل frontend بالكامل
- [ ] إعداد PostgreSQL migration plan
- [ ] إنشاء `core/lego_v2/` infrastructure

### Phase 2: Modularization (التقطيع)
- [ ] تحويل كل entity folder إلى LegoModule مستقل
- [ ] تسجيل كل module في ModuleRegistry
- [ ] إضافة EventBus للتواصل بين modules
- [ ] إضافة Connectors للـ cross-module calls

### Phase 3: Module Separation (الفصل)
- [ ] `engineering` module: projects, phases, codes, drawings, drawing_revisions, documents, payment_certificates, work_orders, work_order_items
- [ ] `hr` module: employees (extract from legacy)
- [ ] `auth` module: JWT + RBAC (extract from legacy)
- [ ] `core` module: GenericCRUD, Audit, Upload, Export

### Phase 4: Integration (الربط)
- [ ] EventBus: `project.created` → hr/notification
- [ ] EventBus: `payment_certificate.approved` → finance
- [ ] Connectors: engineering → hr (get employee by id)
- [ ] Dashboard: cross-module stats

### Phase 5: Polish (التلميع)
- [ ] Tests migration
- [ ] Docker multi-stage
- [ ] Documentation update
- [ ] HANDOFF protocol

## القرارات المعمارية

1. **نحتفظ بـ SQLAlchemy 2.0** — لا ننتقل لـ SQLModel (تكلفة عالية، فائدة قليلة)
2. **نحتفظ بـ GenericCRUD** — هو أقوى ما في المشروع القديم
3. **نحتفظ بـ Async** — SQLAlchemy async + aiosqlite/aiopg
4. **نضيف LEGO v2 كـ layer** — لا نستبدل، نبني فوق
5. **كل module يحتفظ بـ GenericCRUD instance** — لكن يسجّل نفسه في Registry
6. **نحتفظ على Frontend React كما هو** — لا نعيد بناء
7. **نحتفظ على API surface متطابق** — Frontend لا يتأثر
8. **نصلح Auth P0 أثناء التنفيذ** — SECRET_KEY, register catch-22, token revocation

## قرارات المايسترو (post-Agent A & D)

### VETO Decision
- **VETO من Agent D مقبول جزئياً** — نصلح الثغرات الحرجة أثناء التنفيذ
- لا نتوقف، نبني ونصلح في نفس الوقت

### Modularization Plan
```
modules/
├── auth/          ← من app/auth/ (مع إصلاحات أمنية)
├── engineering/   ← projects, phases, codes, drawings, drawing_revisions, documents, payment_certificates, work_orders, work_order_items
├── contractors/   ← من app/contractors/
├── hr/            ← من app/employees/ (مستقبلاً)
├── core/          ← GenericCRUD, Audit, Upload, Export, Search
└── lego_v2/       ← ModuleRegistry, EventBus, Connectors, BaseModule
```

### Execution Order
1. نقل backend + frontend من المشروع القديم
2. إصلاح Auth (SECRET_KEY, register, token revocation)
3. بناء LEGO v2 core (ModuleRegistry, EventBus, Connectors)
4. تحويل كل entity إلى LegoModule
5. اختبارات

- Legacy: `E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system`
- Target: `E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system-3`

## المخاطر

| Risk | Mitigation |
|------|-----------|
| Breaking existing features | Copy first, modify second |
| Auth regression | Agent D pre-flight gate |
| Frontend disconnect | Keep API surface identical |
| DB migration complexity | SQLite → PostgreSQL gradual |

## الوكلاء المطلقون

| Agent | Role | Task |
|-------|------|------|
| G | Focus Guard | Prevent scope creep, track progress |
| A | Platform Engineer | Full legacy scan + inventory |
| B | Solutions Architect | Design merge plan |
| C | Software Engineer | Implement LEGO v2 layer |
| D | Security Engineer | Auth/RBAC audit |
| E | Critic | Find flaws in plan |
| F | Verdict | Prioritize fixes |

---
**Status**: INIT phase — Maestro approved
**Date**: 2026-06-09
