# ROADMAP — Engineering Management System
## خطة التطوير الهندسية الشاملة · آخر تحديث: 2026-06-28

---

## ✅ Phase 1 — Engineering Office Modules (4 entities)
| الوحدة | المسار | Workflow |
|--------|--------|----------|
| سجل التقديمات (Submittal Register) | `/engineering/submittals` | draft → submitted → under_review → (approved/rejected → resubmitted/closed) |
| طلبات التفتيش (Inspection Request) | `/engineering/inspection-requests` | planned → submitted → inspected → (passed/failed → reinspection) |
| بنود الملاحظات (Punch List) | `/engineering/punch-list` | open → in_progress → completed → verified → accepted |
| خطابات الإرسال (Transmittal) | `/engineering/transmittals` | draft → sent → received → acknowledged → closed |

## ✅ Phase 2 — Classification + Multi-Branch (3 entities)
| الوحدة | الغرض |
|--------|-------|
| الفروع (Company Branches) | إدارة فروع الشركة (global) |
| التصنيفات (Project Categories) | sector / region / division tags |
| أكواد التكلفة WBS (Cost Codes) | هيكل هرمي للموازنة لكل مشروع |

## ✅ Phase 3 — HSE Module (3 entities)
| الوحدة | المسار | Workflow |
|--------|--------|----------|
| بلاغات السلامة (Safety Incidents) | `/engineering/safety-incidents` | reported → investigating → action_taken → closed |
| ملاحظات السلامة (Safety Observations) | `/engineering/safety-observations` | open → acknowledged → resolved → closed |
| HSE Dashboard | `/engineering/hse/dashboard` | KPIs + severity chart + recent items |

## ✅ Phase 4 — LEGO v2 Integration (Infrastructure)
| المكون | الوصف |
|--------|-------|
| Event definitions | 24 event name constants (`core/lego_v2/event_bus/events.py`) |
| Notification Adapter | EventBus → Notification + WorkflowLog bridge |
| Model Registration | 15 new models registered in EngineeringModule |
| Search Expansion | 19 entity types (10 new + 9 existing) |
| Tests | 7 integration tests (EventBus, ConnectorRegistry, events) |

---

## ⬜ Phase 5 — Deployment & Infrastructure (HIGH)
- [ ] **Fix HF Space deploy** — التحقق من صلاحية HF_TOKEN ونوع HF_TOKEN (حلّي مشكلة الـ 401)
- [ ] **DGITAL Ocean / Self-host** — بديل لـ HF Space لو استمر الفشل
- [ ] **Docker Compose** — للتطوير المحلي
- [ ] **PostgreSQL Migration** — من SQLite إلى PostgreSQL
- [ ] **Docker multi-stage** — image أصغر للـ production

## ⬜ Phase 6 — EventBus Adoption (MEDIUM)
- [ ] استبدال استدعاءات `_create_notification()` المباشرة في `api.py` بـ `emit_event()` تدريجياً
- [ ] إضافة Event handlers في modules تانية (HR, Contractors)
- [ ] Dashboard events: تحديث real-time عند entity status change

## ⬜ Phase 7 — Missing Engineering Features (MEDIUM)
- [ ] Material / Equipment Tracking
- [ ] Budget vs Actual dashboard
- [ ] Project Closeout workflow
- [ ] Resource Planning / Leveling
- [ ] Geo-location for projects (maps integration)

## ⬜ Phase 8 — Quality & Testing (LOW)
- [ ] رفع test coverage > 60%
- [ ] Frontend tests (Jest/Vitest)
- [ ] E2E tests (Playwright)
- [ ] API documentation (OpenAPI/Swagger)

---

## ملفات النظام الهامة
| الملف | الغرض |
|-------|-------|
| `.ai/AGENT_0_MAESTRO.md` | المايسترو — المرجع النهائي للوكلاء |
| `.ai/AGENT_ACTIVE_STATE.md` | الحالة الحية للجلسة الحالية |
| `.ai/AGENT_VACCINE.md` | بروتوكول استعادة الوعي |
| `.ai/SYSTEM_DNA.md` | الحمض النووي للنظام |
| `.ai/ROADMAP.md` | **هذا الملف — خطة التطوير الشاملة (مرجع دائم)** |
| `.ai/HANDOFF.md` | تسليم الجلسة الأخيرة (متغير) |
| `.ai/EXECUTABLE_DNA_SPEC.md` | آخر مخطط تنفيذي دقيق (متغير) |
