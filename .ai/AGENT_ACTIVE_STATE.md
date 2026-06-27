# AGENT_ACTIVE_STATE.md — الحالة الحية للنظام
## آخر تحديث: 2026-06-27

status: IDLE
session_type: SURGICAL
task: "Full engineering office integration: project-filtered navigation everywhere, search extension, meeting-minutes route fix, URL-context-aware entity pages"
current_agent_working: Agent_G

gates:
  agent_G_continuity: done (HANDOFF.md context loaded + new task scoped)
  agent_0_compliance: done (HR check: N/A — purely technical/engineering features)
  agent_A_impact_analysis: done
    - backend/app/engineering_features/api.py: add project summary endpoint
    - frontend/src/pages/ProjectHub/ProjectHub.jsx: create new page
    - frontend/src/App.jsx: add route
    - frontend/src/pages/Projects/Projects.jsx: update linkTo to redirect to hub
    - frontend/src/services/api.js: add projectSummary service
  agent_I_refinement: done
  agent_D_security_gate: pending
  agent_B_implementation: done
    - backend: project_summary endpoint (counts + recent NCRs/RFIs for all related entities)
    - frontend: ProjectHub.jsx (project info card, 11 entity stats, EVM widget, quick actions, recent NCRs/RFIs)
    - App.jsx: route /engineering/projects/:projectId → ProjectHub
    - Projects.jsx: code + name linkTo → hub
    - Dashboard.jsx: project table rows → hub
    - i18n: 10 new keys (viewAll, recentNcrs, recentRfis, addNcr, addRfi, addMar, addDrawing, evmTitle)
  agent_C_destructive_qa: done (frontend build 13352 modules ✅ in 21.66s)
  agent_I_integration_review: done (Fabric Score: 10/10)
  agent_E_critique: done (all clean — no anti-patterns)
  agent_F_verdict: done (proceed)
  state_sync: done
  agent_G_handoff: done

session_v2_integration:
  entityPage_project_filter: done
    - EntityPage.jsx: reads `project_id` from URL search params, passes to service.list()
    - All 11 EntityPage-based pages now filterable by project via `?project_id=123`
  hub_navigation_project_context: done
    - entityCards use link functions `(pid) => string` (supports path+query params)
    - quickActions use link functions with projectId
    - recent NCRs/RFIs "View All" + item clicks pass project_id
    - Meeting Minutes route fixed: `/engineering/projects/${pid}/meeting-minutes`
  custom_pages_url_project_sync: done
    - NCR.jsx, RFIs.jsx, MAR.jsx: read `project_id` from URL on mount
    - Auto-select project in dropdown when URL param matches
    - Project dropdown changes update URL via setSearchParams(replace)
  search_extended: done
    - search.py: added VariationOrder + DailyReport (with searchable fields)
    - Search.jsx: entityMeta entries for both new types
    - search result URLs: entities without detail routes now link to list page (not /id)
  search_url_fix: done
    - SEARCHABLE_MODELS 4th tuple element `has_detail` (default False)
    - URL generation: `base_path/id` only for has_detail=True entities (currently only projects)
