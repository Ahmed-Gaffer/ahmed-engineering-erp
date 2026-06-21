# AGENTS_ROSTER.md — المرجع السريع للترسانة
## نظرة الطائر الكاملة · للمطوّر البشري فقط · لا يُحقن في LLM · v11.1

---

## 🚀 نشر الترسانة على مشروع — جديد أو قائم

**الملفات أدناه (هذه القائمة فقط) هي "الترسانة العامة" القابلة للنسخ
حرفياً لأي مشروع، جديد أو قائم، بغض النظر عن نطاقه (HR أو غيره):**

```
root/
├── .cursorrules                       ← لازم يبقى هنا بالظبط (شرط الأداة)
│                                          القسم 3 فاضي لقواعد مشروعك
└── .ai/
    ├── AGENT_VACCINE.md                ← عام بالكامل
    ├── AGENT_0_MAESTRO.md              ← عام بالكامل
    ├── AGENT_ACTIVE_STATE.md           ← قالب IDLE فاضي
    ├── AGENTS_ROSTER.md                ← هذا الملف، لك أنت فقط
    ├── protocols/
    │   ├── PROMPT_INIT.md              ← عام بالكامل
    │   ├── PROMPT_SURGICAL.md          ← عام بالكامل
    │   ├── PROMPT_SESSION_CLOSE.md     ← عام بالكامل
    │   ├── PROMPT_GENESIS.md           ← عام بالكامل — هو من يبني الباقي
    │   └── PROMPT_AGENT_I.md           ← عام بالكامل
    └── templates/
        └── SYSTEM_DNA_TEMPLATE.md      ← قالب فاضي، Genesis يملأه من كودك
```

---

## التسعة وكلاء

| # | الاسم | اللقب | الدور باختصار |
|---|-------|-------|---------------|
| 0 | المايسترو | Pure Orchestrator | يفتح/يُغلق · مرجع الفصل النهائي |
| G | حارس التركيز | Focus Guardian | Always-On · HANDOFF · يُحدّث AGENT_ACTIVE_STATE.md |
| **I** | **نسّاج النسيج** | **Architectural Coherence Guardian** | **Always-On · يكتب Spec + يفحص الامتثال — لا يُنفّذ** |
| A | Agent A | Platform Engineer | Workspace Discovery · Impact Analysis |
| B | Agent B | Solutions Architect | Documentation · **Surgical Implementation** |
| C | Agent C | Software Engineer | Architecture · Destructive QA |
| D | Agent D | Security Engineer | Pre-flight Gate · VETO POWER |
| E | Agent E | الناقد | Critique every output |
| F | Agent F | محكّم النقد | Verdict: act or ignore |
| H | السهل الممتنع | HR Domain Expert | يُستشار عند الحاجة |

---

## جدول الـ Modes — عبر كل البروتوكولات

| الوكيل | GENESIS | INIT | SURGICAL | SESSION_CLOSE |
|--------|---------|------|----------|---------------|
| Agent 0 | ✅ يقود | ✅ يفتح+يدمج | ✅ يفتح+يُغلق | ✅ يُشغّل |
| Agent G | ✅ Bootstrap | ✅ Continuity Check | ✅ Focus Guard + State Updates | ✅ HANDOFF |
| **Agent I** | **✅ DNA Constitution** | **✅ DNA Reconnaissance** | **✅ Refinement→Spec + Integration Review (Compliance+Fabric)** | **✅ DNA Audit** |
| Agent A | ✅ Reconnaissance | ✅ Workspace Discovery | ✅ Impact Analysis | ❌ |
| Agent B | ✅ Foundation | ✅ Documentation Analysis | ✅ **Surgical Implementation** | ❌ |
| Agent C | ❌ | ✅ Architecture Analysis | ✅ Destructive QA | ❌ |
| Agent D | ✅ Security Audit | 💤 Standby | ✅ Security Gate | ❌ |
| Agent E | ✅ Legacy Critique | ❌ | ✅ Critique | ✅ Pre-close Critique |
| Agent F | ✅ Keep/Discard | ❌ | ✅ Verdict | ✅ Priority Judge |
| Agent H | ✅ Domain Analysis | ✅ HR Context Loading | ✅ consulted by Agent 0 | ❌ |

---

## ترتيب التنفيذ — SURGICAL (v11)

```
[Bootstrap]              ← فقط إذا لم يُسبق ببروتوكول INIT
                          أو عبر استعادة اللقاح (AGENT_ACTIVE_STATE.md)

Agent G                   → Focus Guard + AGENT_ACTIVE_STATE.md → IN_PROGRESS
Agent 0                   → فتح + HR check + task routing
Agent A ‖ Agent I(Refinement→Spec)
                          → Impact Analysis + Executable DNA Spec
                            (يتضمن قائمة امتثال — بالتوازي)
Agent D                   → Security Gate (وحده — VETO أو شهادة مرور)
Agent B ‖ Agent C         → Surgical Implementation (وفق Spec) +
                            Destructive QA (بالتوازي)
Agent I(Review)           → Integration Review:
                            ① Compliance Check (نقطة-بنقطة)
                            ② Fabric Score (≥7)
Agent E                   → Critique (إذا Fabric Score ≥ 7)
Agent F                   → Verdict
Agent 0                   → Validate + Rollback + بوابة الإكمال (10 بنود)
Agent G                   → HANDOFF + AGENT_ACTIVE_STATE.md → IDLE
```

---

## قوانين لا تُكسر

```
1.  Agent 0 يبدأ أولاً — في كل بروتوكول.
2.  Agent G وAgent I يعملان Always-On — لا يُوقَفان أبداً.
3.  Agent I له 4 أوضاع عبر البروتوكولات:
    Reconnaissance (INIT) → Refinement→Spec (SURGICAL-1)
    → Integration Review: Compliance+Fabric (SURGICAL-2) → Audit (SESSION_CLOSE)
    + DNA Constitution (GENESIS).
4.  Agent D لا يُتخطى في SURGICAL.
5.  Agent B لا يبدأ التنفيذ قبل: شهادة Agent D + Executable DNA Spec من Agent I.
6.  Agent E لا يبدأ قبل: Fabric Score ≥ 7 + Compliance Check من Agent I.
7.  Agent I لا يكتب كوداً أبداً — حتى عند رفض Score < 7، Agent B يُعيد.
8.  Agent G يُنشئ HANDOFF + يُحدّث AGENT_ACTIVE_STATE.md في نهاية كل SURGICAL.
9.  SYSTEM_DNA.md يُحدَّث عند اقتراح Agent I لنمط جديد.
10. لا قيمة رقمية من الذاكرة — كل شيء من workspace.
11. لا ملف يُخترع — الغياب يُسجَّل فقط.
12. .cursorrules (القسم 0) يفحص AGENT_ACTIVE_STATE.md في *كل* رسالة
    قبل أي تصنيف لها — بلا استثناء، بلا شرط، بلا حاجة لتدخل المستخدم.
    إن كان IN_PROGRESS، يستدعي القسم الأول من AGENT_VACCINE.md فوراً.
```

---

## تاريخ الإصدارات

| الإصدار | التغيير الرئيسي |
|---------|----------------|
| v1–v4 | البروتوكول الأساسي |
| v5 | Destructive QA + جدول Modes |
| v6 | Agent D (حارس البوابة) + Rollback |
| v7 | المايسترو + Agent G/E/F/H + SESSION_CLOSE |
| v8 | Agent I (نسّاج النسيج) + SYSTEM_DNA.md + GENESIS |
| v9 | Agent I أصبح Always-On (Reconnaissance في INIT) + Bootstrap في SURGICAL |
| v10 | (تجربة) Agent I يتولى التنفيذ — أُلغيت لتضارب المصالح |
| **v11** | **تركيب v9+v10**: Agent B ينفّذ (استقلالية)، Agent I يكتب Executable DNA Spec + يفحص Compliance+Fabric (دقة). **+ نظام اللقاح الكامل**: `.cursorrules` + `AGENT_VACCINE.md` + `AGENT_ACTIVE_STATE.md` — يحل مشكلة فقدان الوعي عند انقطاع الجلسة تلقائياً. |
| **v11.1** | **القسم 0** في `.cursorrules`: بوابة غير مشروطة *تسبق* تصنيف الرسالة (تغلق فجوة كانت تُسقط اللقاح على رسائل مثل "كمّل"). + **Mid-Session Drift Guard** (القسم 2) لتراجع الالتزام *خلال* الجلسة الطويلة نفسها، لا فقط بينها. |
