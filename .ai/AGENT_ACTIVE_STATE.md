# AGENT_ACTIVE_STATE.md — الحالة الحية للنظام
## آخر تحديث: 2026-07-02

status: PRE_FLIGHT
task: "Phase 2.3 — Hierarchical Navigation: EntityDetail pages + detail routes + onView"

gates:
  api_fixes_round: done
  dockerfile_fix: done
  github_push: done
  entity_detail_v1: done (initial)
  entity_detail_refactor_v2: done (useQuery + strict types after protocol violation fix)
  protocol_enforcement: done (HANDOFF.md updated with pre-flight checklist)
  verification_build: passed (0 errors)

notes_for_recovery:
  active_file: "HANDOFF.md"
  critical_lesson: |
    في الجلسة السابقة (2026-07-02)، خالف الكود البروتوكول (FRONTEND_MODERNIZATION_PROTOCOL.md)
    باستخدام useEffect بدلاً من useQuery. تم修正 ذلك في v2.
    قبل أي كود جديد في المستقبل، اقرأ FRONTEND_MODERNIZATION_PROTOCOL.md + SYSTEM_DNA.md أولاً.
  pre_flight_checklist:
    - "اقرأ FRONTEND_MODERNIZATION_PROTOCOL.md كاملاً — حدد Phase المناسب"
    - "اقرأ SYSTEM_DNA.md — القواعد المعمارية"
    - "اقرأ HANDOFF.md — الدروس المستفادة"
    - "استخدم useQuery لا useEffect للـ API calls"
    - "حدد الأنواع (TypeScript) — لا any"
  context: |
    Hierarchical navigation implemented:
    - EntityDetail component (generic, TanStack Query-based)
    - detailRegistry with 30+ entities
    - Detail routes in App.tsx (generated)
    - View button in DataTable + EntityPage
    Build: 0 errors. GitHub pushed. HF Space auto-deploys on push to develop.
