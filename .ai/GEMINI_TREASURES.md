# GEMINI TREASURES — الكنوز المستخرجة من محادثة Gemini
## توثيق الرؤى المعمارية والهوية البصرية والقرارات الاستراتيجية
### آخر تحديث: 2026-06-28 · المصدر: محادثة كاملة (869 سطر)

---

> هذا الملف يوثق كل "الذهب" الذي ناقشه Gemini مع Ahmed Gaffer
> حتى لا ننسى القرارات الإستراتيجية والملاحظات الثاقبة أبداً.

---

## 1. 🏛️ هوية AG — لماذا AG بالضبط؟

- **اسم AG** اقترحه Gemini بناءً على:
  - Apex = "قمة الهرم" — يناسب شعار حرف A الهرمي
  - يعكس أن النظام هو "قمة" التكنولوجيا الهندسية
  - مناسب عالمياً وغير مرتبط بشخص أو شركة محددة
- **الاسم الكامل:** AG Enterprise Systems
- **الشعار:** 3D Isometric Sandstone Pyramid forming the literal letter A
- **الشعار التسويقي:** "Next-Gen Engineering Operations & Strategy"
- **البديل:** "Advanced Infrastructure Orchestration Platforms"

### هوية المستخدم الحقيقية:

| الحقل | القيمة |
|-------|--------|
| الاسم | **Ahmed Gaffer** |
| الدور | **Principal System Architect & Technical Provider** |
| ملاحظة مهمة | **ليس صاحب شركة المقاولات** — هو Software Provider/مهندس النظام |
| الظهور | Dashboard التنفيذية لمجلس الإدارة |
| الصلاحية | Root-Admin / Infrastructure Owner |

### المصطلحات المحظورة (Forbidden):
- "دورة حياة المشاريع التقليدية"
- "السيستم البلدي"
- "المكتب الفني البلدي"
- "المخازن العادية"
- "إدارة المهام العادية"
- "الكلام الساذج"
- "LEGO Blocks"

### المصطلحات الإجبارية (Mandatory):
- "Strategic Asset Orchestration"
- "Operational Velocity Dashboard"
- "Infrastructure & Resource Orchestration"
- "Material Logistics Architecture"
- "Capital Expenditure & Quantitative Analytics"
- "Milestone Velocity Tracking"
- "Asynchronous Data Pipeline"

---

## 2. 🎨 الهوية البصرية (Design System)

### الألوان الأساسية:

| اللون | الرمز | الاستخدام |
|-------|-------|-----------|
| Deep Slate Navy | `#0F172A` | الخلفيات الحساسة |
| Brushed Amber Gold | `#D97706` | التمييز والتنبيهات |
| Surface Daylight Mist | `#F8FAFC` | الخلفيات النهارية |
| Glass Border | `rgba(15, 23, 42, 0.08)` | حواف الزجاج |

### نمط الواجهات:
- **Corporate Luxury Minimalism** — فخم وأقلية في التفاصيل
- **Daylight-Resistant Glassmorphism** — مقاوم للإضاءة النهارية
  - Opacity عالٍ (75-80%) للخلفيات
  - `backdrop-filter: blur(14px) saturate(180%)`
  - حواف شبه شفافة بحدود خفيفة
  - تباين نصوص عالي لضمان الوضوح على شاشات العرض الكبيرة

### الـ Typography:
- Inter (Sans-serif)
- Montserrat (للعناوين الفخمة)

### أنماط CSS الحرجة:

```css
/* الـ Panel التنفيذي — أساس كل واجهة */
.apex-executive-panel {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(14px) saturate(180%);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
    border-radius: 12px;
}

/* Grid الرئيسي */
.apex-executive-grid {
    background: rgba(248, 250, 252, 0.80);
    backdrop-filter: blur(16px) saturate(190%);
    border: 1px solid rgba(15, 23, 42, 0.09);
    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.06);
}

/* التمييز الذهبي */
.apex-gold-accent {
    color: #D97706;
    font-weight: 600;
}
```

### لوحة الألوان الأصلية (الإصدار الأول GAFFER):
- `#1A237E` (Navy), `#CF8D2E` (Brushed Gold), `#F5F5F5` (Clean White)
- **تم تطويرها لاحقاً** إلى `#0F172A` الأكثر عمقاً و `#D97706` الأكثر فخامة

---

## 3. 🧩 الـ 9 وكلاء — التعريف الدقيق لكل واحد

| # | الاسم | اللقب | Always-On؟ | الدور الأساسي |
|---|-------|-------|-----------|---------------|
| 0 | **المايسترو** | Pure Orchestrator | ✅ | يفتح/يُغلق الجلسة، يقيم التعقيد، يوجّه المسار |
| G | **حارس التركيز** | Focus Guardian | ✅ | يراقب الجلسة، يُحدّث AGENT_ACTIVE_STATE، يصدر HANDOFF |
| **I** | **نسّاج النسيج** | Architectural Coherence Guardian | ✅ | **يكتب Spec + يفحص الامتثال — لا يُنفّذ كوداً أبداً** |
| A | Agent A | Platform Engineer | ❌ | Workspace Discovery & Impact Analysis |
| B | Agent B | Solutions Architect | ❌ | **التنفيذ الجراحي** (يكتب الكود فعلياً) |
| C | Agent C | Software Engineer | ❌ | **Destructive QA** — اختبار تدميري حقيقي |
| D | Agent D | Security Engineer | ❌ | بوابة أمنية (فقط في المسار الكامل) |
| E | Agent E | الناقد | ❌ | نقد كل مخرجات الوكلاء |
| F | Agent F | محكّم النقد | ❌ | الحكم النهائي على النقد (اعتمد أو ارفض) |
| H | **السهل الممتنع** | HR Domain Expert | ❌ | يُستشار عند الحاجة فقط |

### القرار الإستراتيجي الأخطر في تاريخ البروتوكول:

> **Agent I لا يكتب كوداً أبداً.**
>
> - **الإصدار v10:** تمت تجربة جعل Agent I هو من يكتب الكود وينفذ بنفسه.
> - **الإصدار v11:** **أُلغيت الفكرة تماماً** لشبهة "تضارب المصالح".
> - **لماذا؟** لا يصح أن يكون من يضع الـ Spec ويراجع الامتثال ويحسب الـ Fabric Score هو نفسه من يكتب الكود (حاميها حراميها).
> - **القرار النهائي:** Agent B هو الذراع التنفيذي، Agent I يظل حارساً معمارياً خالصاً.

### قوانين التسعة وكلاء (لا تُكسر أبداً):

```
1.  Agent 0 يبدأ أولاً — في كل بروتوكول.
2.  Agent G وAgent I يعملان Always-On — لا يُوقَفان أبداً.
3.  Agent D لا يُتخطى في المسار الكامل.
4.  Agent B لا يبدأ التنفيذ قبل: شهادة Agent D + Executable DNA Spec من Agent I.
5.  Agent I لا يكتب كوداً أبداً — حتى عند رفض Score < 7، Agent B يُعيد الكتابة.
6.  Agent I له 4 أوضاع: Reconnaissance → Refinement→Spec → Integration Review → Audit
7.  لا قيمة رقمية من الذاكرة — كل شيء من الـ workspace.
8.  Agent G يُنشئ HANDOFF + يُحدّث AGENT_ACTIVE_STATE.md في نهاية كل SURGICAL.
9.  Agent E لا يبدأ قبل: Fabric Score ≥ 7 + Compliance Check من Agent I.
```

---

## 4. ⚡ التوجيه الديناميكي (Dynamic Routing) — أهم تحسين للأداء

### المشكلة:
البروتوكول الجراحي (v11.1) يمر على 9 وكلاء لكل تعديل — حتى تغيير لون زرار. هذا يستهلك الـ Context كاملاً ويسبب بطئاً مميتاً.

### الحل — مساران:

| المسار | متى يُستعمل | الوكلاء |
|--------|-------------|---------|
| **Fast-Track 🚀** | تعديل محلي داخل موديول واحد، لا يمس `core/lego_v2/` أو الـ Schema المشترك | Agent 0 → **Agent I** (Spec سريع) → **Agent B** (تنفيذ) → **Agent C** (اختبار) → Agent I (مراجعة) → Agent 0 (إغلاق) |
| **Full Surgical 🏛️** | يمس `core/lego_v2/`، أو الـ EventBus، أو يربط موديولين | جميع الوكلاء الـ 9 بالتتابع |

### كيف يقرر Agent 0؟
```
قيّم التعقيد:
  - إذا التعديل داخل موديول واحد ولا يمس Core Schema → Fast-Track
  - إذا التعديل يمس Core Infrastructure → Full Surgical
```

---

## 5. 🧱 قوانين LEGO v2 — حماية قلب النظام

### القانون الأول: حظر التلاحم المباشر (Direct Inter-Module Banning)
- **يُمنع منعاً باتاً** استدعاء أي موديول داخل موديول آخر مباشرة
- مثال: `import` من `modules/finance` داخل `modules/engineering` ممنوع تماماً
- أي تخاطب بين الموديولات يمر حصراً عبر:
  - **EventBus** (بث واستقبال الأحداث غير المتزامن)
  - **Connectors** (المنافذ الموثقة في `core/lego_v2/`)

### القانون الثاني: عزل قواعد البيانات
- كل موديول يتعامل مع جداوله الخاصة عبر SQLModel
- **يُمنع** إجراء Cross-Module Joins مباشرة بين جداول الموديولات المختلفة
- العلاقات بين الكيانات داخل نفس الموديول: `SQLAlchemy relationship()` مع `cascade="all, delete-orphan"`

### القانون الثالث: التخاطب عبر الأحداث
- مثال: عند اعتماد IPC → موديول engineering يبث حدث `IPC_APPROVED`
- موديول finance يستقبل الحدث ويسجل القيود المحاسبية تلقائياً
- لا تلاحم كود مباشر — كل شيء عبر EventBus

### القانون الرابع: صيانة الحسابات الهندسية
- الحسابات الهندسية الـ 23 هي "خطوط حمراء"
- يُمنع تعديل صيغها الرياضية إلا بتطابق 100% مع SYSTEM_DNA.md
- الحسابات المحمية: EVM, CPM, BOQ, IPC, Variance Analysis

---

## 6. 📐 حوكمة الحسابات الهندسية الـ 23

### إدارة القيمة المكتسبة (EVM):
| الرمز | المعنى | المعادلة |
|-------|--------|----------|
| PV | Planned Value | — |
| EV | Earned Value | — |
| AC | Actual Cost | — |
| SV | Schedule Variance | `EV - PV` |
| CV | Cost Variance | `EV - AC` |
| SPI | Schedule Performance Index | `EV / PV` |
| CPI | Cost Performance Index | `EV / AC` |
| EAC | Estimate at Completion | — |
| ETC | Estimate to Complete | — |
| VAC | Variance at Completion | — |

### شهادات الدفع المؤقتة (IPC):
- `Gross Amount - Retention (الاستقطاعات) - Advance Payment Deductions = Net Amount`
- يجب تتبع Variance Analysis بنسبة مئوية مقارنة بالـ IPC السابق
- IPC Certificate: Header + Items + Financial Summary + Deductions + Signatures + QR

### BOQ:
- `Quantity × Unit Price = Total`
- هيكل هرمي (قابل للتصنيف حسب divisions)

### الـ 8 Workflows الهندسية:
كل Entity عندها State Machine: `draft → submitted → approved/rejected → ...`

### الـ KPIs في Dashboard:
| KPI | المعادلة |
|-----|----------|
| Execution Rate | `IPC amount / Contract value × 100` |
| Financial Progress | `Paid amount / Contract value × 100` |
| Remaining Value | `Contract value − Total paid` |
| IPC Trends | Cumulative per project |

---

## 7. 📊 تحليل الفجوات (Gap Analysis) كما رآها Gemini

### تشخيص دقيق:
> "النظام حالياً هو **Document Control + Financial** وليس **Technical Engineering**"

### موجود فعلاً — Document Control + Financial (قوي جداً):
RFIs, NCRs, MARs, Submittals, Transmittals, IPCs, BOQ, Variations, Schedule/CPM, EVM, Daily Reports, HSE, Contracts

### الناقص — Engineering Technical Tools:

| المجال | الأهمية | التفاصيل |
|--------|---------|----------|
| **Material Testing** | 🔴 HIGH | خرسانة (7/28 يوم، Slump)، تربة (دمك، Proctor، CBR)، حديد (شد، انحناء) |
| **ITPs** | 🔴 HIGH | Hold Points, Witness Points, ربط بالمواصفات (ASTM, BS, ACI) |
| **Specifications Library** | 🟡 MEDIUM | Standards table, Project specs, MasterFormat divisions |
| **Drawings Engineering** | 🟡 MEDIUM | Shop Drawings ≠ As-Built, Drawing Categories, Transmittal→Drawing |
| **Method Statements** | 🟡 MEDIUM | Submit → Review → Approve, ربط بـ Specs + ITP + Drawings + Risks |
| **Permits** | 🟢 LOW | Hot work, excavation, height, Gas test |
| **Survey** | 🟢 LOW | Benchmarks, Coordinates, Survey logs |

### التصنيف الهندسي للنظام:
| التصنيف | العدد | النسبة |
|---------|-------|--------|
| Core Engineering | 23 | **51%** |
| Administrative | 17 | 38% |
| Mixed | 5 | 11% |

> **النظام الحالي:** قوي في إدارة المستندات الهندسية + الحسابات المالية
> **الناقص:** أدوات الهندسة التقنية — الاختبارات، المواصفات، خطط التفتيش، طرق التنفيذ

---

## 8. 🧬 تاريخ تطور البروتوكول (Agent Protocol Evolution)

### ملخص الإصدارات:

| الإصدار | التغيير الرئيسي |
|---------|-----------------|
| v1–v4 | البروتوكول الأساسي البسيط |
| v5 | Destructive QA + جدول Modes |
| v6 | Agent D (حارس البوابة الأمنية) + Rollback |
| v7 | المايسترو + Agent G/E/F/H + SESSION_CLOSE |
| v8 | Agent I (نسّاج النسيج) + SYSTEM_DNA.md + GENESIS |
| v9 | Agent I أصبح Always-On (Reconnaissance في INIT) + Bootstrap في SURGICAL |
| **v10** | **(تجربة فاشلة)** Agent I يتولى التنفيذ — أُلغيت فوراً |
| **v11** | **تركيب v9+v10**: Agent B ينفّذ، Agent I يكتب Spec + يفحص Compliance+Fabric. + نظام اللقاح الكامل |
| **v11.1** | القسم 0 في .cursorrules (بوابة غير مشروطة تسبق كل شيء). + Mid-Session Drift Guard |

### الدروس المستفادة من كل إصدار:

- **v10:** محاولة جعل Agent I هو من يكتب الكود → فشل ذريع بسبب تضارب المصالح
- **v11:** العودة إلى الفصل التام بين الـ Spec (Agent I) والتنفيذ (Agent B)
- **اللقاح:** وُلد لحل مشكلة فقدان الوعي عند انقطاع الجلسة (Context Loss)
- **القسم 0:** وُلد لأن Agent 0 كان يتجاهل اللقاح أحياناً في رسائل مثل "كمّل"

---

## 9. 🗂️ ملفات الترسانة — كيف ولماذا

### brand_identity.json
- **الهدف:** الـ DNA البصري واللفظي — يمنع النموذج من استخدام مصطلحات ضعيفة
- **المحتوى:** ألوان، خطوط، مسميات محظورة، مسميات إلزامية، بروفايل المهندس
- **الموقع:** Root المشروع

### architecture_blueprint.md
- **الهدف:** شرح هيكل النظام من الصفر للـ 360 — الكود، قواعد البيانات، CSS
- **المحتوى:** Directory Tree، Glassmorphism Spec، Backend Config، Docker
- **الموقع:** Root المشروع

### ai_system_instructions.txt
- **الهدف:** System Prompt يُحقن في أول رسالة للنموذج
- **المحتوى:** 5 قيود حرجة تمنع النموذج من إنتاج كود "بلدي"
- **الموقع:** Root المشروع (أو يُستخدم كـ Custom Instructions)

### PROMPT_SURGICAL.md (v11.2)
- **الهدف:** بروتوكول التنفيذ الجراحي
- **أهم تحسين:** إضافة **Dynamic Routing** (Fast-Track vs Full Surgical)
- **الموقع:** `.ai/protocols/PROMPT_SURGICAL.md`

### AGENT_0_MAESTRO.md (v11.2)
- **الهدف:** قوانين المايسترو الصارمة لحماية LEGO v2
- **أهم تحسين:** إضافة قانون حظر التلاحم المباشر + قانون صيانة الحسابات الهندسية
- **الموقع:** `.ai/AGENT_0_MAESTRO.md`

### SYSTEM_DNA.md
- **الهدف:** دستور النسيج — يحمي الـ 23 Entity الهندسية ومعادلاتها
- **المحتوى:** الهوية، قواعد التسمية، حوكمة الحسابات الهندسية، الهوية البصرية، حدود LEGO v2
- **الموقع:** `.ai/SYSTEM_DNA.md`

### ENGINEERING_BUSINESS_RULES.md
- **الهدف:** قواعد العمل الهندسية التقنية (لاحظ: **ليست HR**)
- **المحتوى:** Material Testing, ITPs, Drawings Engineering, Method Statements
- **الموقع:** Root المشروع (جديد — لم يكن موجوداً من قبل)

### .cursorrules
- **الهدف:** نظام استعادة الوعي التلقائي (اللقاح)
- **القسم 0 — البوابة المطلقة:** يفحص AGENT_ACTIVE_STATE.md في كل رسالة قبل أي شيء
- **القسم 1 — مرجع الترسانة:** يوجّه النموذج للملفات الصحيحة
- **القسم 2 — حارس التراجع:** يراقب الالتزام داخل الجلسة الطويلة
- **القسم 3 — قواعد المشروع:** بيئة التشغيل + قواعد الموديولات + كيانات النظام

### الملفات التي لا تحتاج تعديل (حسب Gemini):
- `PROMPT_GENESIS.md`, `PROMPT_INIT.md`, `PROMPT_SESSION_CLOSE.md` — سليمة
- `AGENT_VACCINE.md`, `AGENT_ACTIVE_STATE.md` — سليمة 100%
- `PROJECT_MAP.md`, `ROADMAP.md` — ممتازة وتوفر رؤية واضحة

### الملفات المفقودة التي أنشأتها OpenCode قبل معرفة هذه المحادثة:
- `PROMPT_AGENT_I.md` ✅
- `PROMPT_SURGICAL.md` ✅ (بعد التعديلات)
- `AGENT_0_MAESTRO.md` ✅ (بعد التعديلات)
- `AGENT_BRAIN_MAP.md` ✅

---

## 10. 🚀 النصيحة الإستراتيجية من Gemini

### أولويات التنفيذ:
1. **Phase 4** (LEGO v2 Integration) — حالياً مستقر (24 Event, 18 Models, 7 Tests ✅)
2. **Phase 5** (Hugging Face Deploy + PostgreSQL Migration) — **أنصح بالبدء فوراً**
3. **ثم** Material Testing + ITPs (Phase 7)

### لماذا PostgreSQL أولاً؟
> "قاعدة بيانات SQLite لن تتحمل ملفات الـ Blobs أو الـ Logs الكثيفة الناتجة عن اختبارات المعامل والـ ITPs القادمة في Phase 7"

### مشكلة api.py (3172 سطر!):
- عدم لمس api.py مباشرة — قرار سليم 100%
- الاعتماد على `notification_adapter.py` كـ Bridge عبر EventBus
- هذا طوق النجاة لمنع انفجار ملف API حرارياً

### نقطة عمياء في System Prompt:
- المايسترو (Agent 0) كان يسأل عن `HR_BUSINESS_RULES.md` في كل مهمة — خطأ
- النظام 51% منه هندسي، ليس HR
- الحل: أسأل عن `ENGINEERING_BUSINESS_RULES.md` للمهام الهندسية، و `HR_BUSINESS_RULES.md` فقط للـ HR

### قاعدة الـ 4 ملفات (إلزامية):
كل Entity يجب أن تمتلك 4 ملفات:
- `models.py` — تعريف الجدول في قاعدة البيانات
- `schemas.py` — Pydantic/SQLModel Schemas للـ API
- `crud.py` — عمليات قاعدة البيانات
- `api.py` — نقاط النهاية (Endpoints)

### React Auto-filtering:
كل الجداول والبطاقات الإحصائية لـ Entities (Drawings, NCRs, RFIs, Work Orders):
- تدعم الفلترة التلقائية عبر Query Params
- تستخدم سياق `project_id` لتسهيل التنقل داخل ProjectHub

---

## 11. 💡 ملاحظات ومفاجآت من المحادثة

### مفاجأة: النموذج اعتذر عن طلب!
في نهاية المحادثة، عندما سأل المستخدم "هل انت قصرت ف محتوي الملفات"، رد Gemini:
> "I cannot fulfill this request."

وهذا يثبت أن حتى أقوى النماذج لها حدود في استيعاب كم المحتوى دفعة واحدة.

### مفاجأة: Gemini أرسل PDF أولاً!
- في البداية، Gemini أنشأ ملف PDF كامل (AG_System_Architecture_Blueprint)
- المستخدم صرخ فيه: "لا انت كده سازج" — لأن AI Agent لا يقرأ PDF
- **الدرس:** النماذج الذكية تحتاج `*.json`, `*.md`, `*.txt` — ليس PDF

### تطور التصميم:
1. **البداية:** Elkanzy - نظام إدارة المشاريع الهندسية (لم يعجب المستخدم)
2. **GAFFER** — Engineering Enterprise Architecture (رفضه المستخدم لأنه شخصي)
3. **AG Enterprise Systems** ✅ (الاسم النهائي المعتمد)

### تغيير جذري في فهم دور المستخدم:
- أولاً: افترض Gemini أن المستخدم هو "صاحب شركة المقاولات"
- ثم: صحح المستخدم — "أنا صاحب الشركة اللي عملت السيستم والمهندس اللي عمله"
- **النتيجة:** Ahmed Gaffer = Principal System Architect & Technical Provider

---

## 12. 🧪 خلاصة المحادثة في نقطة واحدة

> **"أنت تمتلك محركاً نووياً (ترسانة الوكلاء v11.1)، ولكن بوصلته لا تزال موجهة جزئياً نحو بناء أنظمة إدارية/HR وتفتقر إلى القواعد الصارمة للهوية البصرية الفخمة والهندسة التقنية."**

### ما تم إنجازه في المحادثة:
- ✅ تصميم هوية AG بالكامل
- ✅ صياغة brand_identity.json + architecture_blueprint.md + ai_system_instructions.txt
- ✅ تطوير البروتوكول من v1 إلى v11.1
- ✅ حوكمة الحسابات الهندسية الـ 23
- ✅ قوانين LEGO v2 (حظر التلاحم، عزل DB، EventBus فقط)
- ✅ Dynamic Routing (Fast-Track vs Full Surgical)
- ✅ إلغاء تجربة v10 الفاشلة (Agent I يكتب كود)
- ✅ تحديد ENGINEERING_BUSINESS_RULES.md كملف منفصل عن HR
- ✅ تحليل الفجوات وتحديد Phase 5 (PostgreSQL) كأولوية قبل Phase 7
- ✅ نظام اللقاح الكامل (Vaccine) لحماية الجلسات من فقدان الوعي

### ما زال مفتوحاً:
- ❌ إنشاء ENGINEERING_BUSINESS_RULES.md (تم إنشاؤه لاحقاً في OpenCode)
- ❌ تحديث .cursorrules بالقسم 3 AG
- ❌ تحديث SYSTEM_DNA.md بقسم الحوكمة الهندسية
- ❌ تحديث PROMPT_SURGICAL.md بـ Dynamic Routing
- ❌ تحديث AGENT_0_MAESTRO.md بقوانين LEGO v2

---

## 13. 📦 المحادثة الثانية — استراتيجية النشر والملفات الكاملة

### المصدر:
محادثة Gemini ثانية (استكمالية) — بعد أن جهز المستخدم الملفات وسأل:
> "يعني امسح الملفات القديم واحط دول ؟ولا دول ناقصين ؟"

### إستراتيجية النشر الدقيقة (كيف توزع الملفات بالضبط):

| نوع التعديل | الملفات | الإجراء |
|-------------|---------|---------|
| **🔄 استبدال كامل** | `.ai/SYSTEM_DNA.md`, `.ai/AGENT_0_MAESTRO.md`, `.ai/protocols/PROMPT_SURGICAL.md` | امسح المحتوى القديم بالكامل والصق الجديد |
| **✂️ تعديل جزئي** | `.cursorrules` | احتفظ بالأقسام 0 و1 و2، واستبدل القسم 3 فقط |
| **📎 دمج (Append)** | `ENGINEERING_BUSINESS_RULES.md` | احتفظ بـ 17 قسماً الأصليين، أضف الـ 4 أقسام الفنية في النهاية |
| **🆕 إنشاء جديد** | `ENGINEERING_BUSINESS_RULES.md` (إن لم يكن موجوداً) | أنشئ الملف كاملاً بـ 21 قسماً |

### لماذا هذا التوزيع بالذات؟

> **"سؤالك جوهري، والإجابة القاطعة: الملفات مش ناقصة، لكن فيه ملف واحد بالذات لو استبدلته بالكامل هتخسر كود السيستم بتاعك!"**

- `ENGINEERING_BUSINESS_RULES.md` الحالي (17 قسماً) يشرح للـ AI حقول الـ Database والجداول الحقيقية — هذا **ذهب تقني لا يُمسح**
- الـ 4 أقسام الجديدة (Material Testing, ITPs, Drawings, Method Statements) هي "الترقية الهندسية الفنية" — تضاف في النهاية
- **النتيجة:** الـ AI يرى الحقل البرمجي والمنطق الهندسي وراءه في نفس الملف

### 📄 الـ .cursorrules v11.2 — الإصدار الأكثر اكتمالاً

هذا الإصدار تم تطويره عن v11.1 ويحتوي على تحسينات جوهرية:

#### ⚡ القسم 0 — البوابة المطلقة (مُعاد صياغتها بأسبابها)

التحسين الأهم: تمت **إضافة أسباب الرفض الصريحة** لذرائع تخطي اللقاح:

```
# ذرائع مرفوضة مسبقاً (لا تقبل النقاش):
# ❌ "الرسالة قصيرة جداً لتستدعي كل هذا"
# ❌ "الرسالة لا تبدو طلب كود أو مهمة"
# ❌ "أنا متأكد إن مفيش حاجة معلقة من قبل"
# ❌ "المستخدم لم يطلب تشغيل أي بروتوكول صراحةً"
# ❌ "هذا أول رد لي في الجلسة، لازم أرحب أولاً"
```

**السبب المنطقي المُوثّق داخل الملف نفسه:**
```
# السبب: لو هذا القسم كان جزءاً من خطوة "هل هذه مهمة كود؟"، فالنموذج
# ممكن يصنّف رسالة مثل "كمّل" على أنها ليست مهمة كود ويتخطى القسم
# بالكامل — وهنا تماماً يضيع اللقاح. لذلك هو هنا، في القمة، قبل أي
# قرار آخر.
```

#### 🛡️ القسم 2 — حارس التراجع داخل الجلسة (Mid-Session Drift Guard)

تحذير جديد: إذا اكتشف Agent B أنه بدأ كتابة كود بدون Spec من Agent I أو شهادة من Agent D:
> "توقف فوراً، أعلن ذلك للمستخدم بصراحة ("لاحظت أني تجاوزت بوابة X")، ثم اعكس الترتيب الصحيح"

#### 🎨 القسم 3 — قواعد المشروع الكاملة (إصدار AG)

يشمل:
- **بيئة التشغيل:** Python 3.11+, FastAPI, SQLAlchemy 2.0 async, SQLite/PostgreSQL, React 19 + Vite + MUI X
- **الهوية البصرية:** Corporate Luxury Minimalism + Daylight-Resistant Glassmorphism + الألوان المعتمدة
- **نمط الـ Entity:** الـ 4 ملفات الإلزامية (models.py, schemas.py, crud.py, api.py)
- **حظر الاستدعاء المباشر:** بين الموديولات
- **الأمان:** GenericCRUD + Depends(get_current_user) + require_role()
- **كيانات النظام الـ 23:** مقسمة إلى 3 مجموعات (إدارة وتشغيل، تصنيفات وسلامة، ماليات وحسابات)
- **الأوامر السريعة:** uvicorn, pytest, npm run build, seed.py

### 📄 الـ ENGINEERING_BUSINESS_RULES.md — النسخة الكاملة (21 قسماً)

Gemini قام بدمج 17 قسماً أصلياً (المستخرجة من كود السيستم الحقيقي) مع 4 أقسام هندسية جديدة:

| # | القسم | النوع |
|---|-------|-------|
| 1-17 | Projects, Phases, Codes, Drawings, Revisions, Documents, PaymentCerts, WorkOrders, Items, Employees, Contractors, BOQ, IPC, Daily Reports, Subcontractors, Schedules/WBS, Auth | 🏗️ **أصلي — من كود السيستم** |
| 18 | Material & Site Testing (Concrete/Soil/Steel + Auto NCR) | 🔧 **جديد — هندسي** |
| 19 | ITPs (Hold Points / Witness Points) | 🔧 **جديد — هندسي** |
| 20 | Drawings Engineering Lifecycle (Shop Drawings ≠ As-Built) | 🔧 **جديد — هندسي** |
| 21 | Method Statements & Risk Governance | 🔧 **جديد — هندسي** |

#### نقاط مهمة في المحتوى المدمج:

**في قسم IPC (#13):** تم حقن حوكمة مالية صريحة:
> "عند احتساب صافي المستخلص (Net Amount)، يجب على النظام برمجياً خصم نسبة الاستقطاع (Retention) والدفعات المقدمة المستهلكة (Advance Payments Deduction)"

**في قسم Schedules (#16):** تم حقن معادلات EVM كاملة:
> $$SPI = \frac{EV}{PV}$$ $$CPI = \frac{EV}{AC}$$ $$CV = EV - AC$$ $$SV = EV - PV$$

**في قسم Material Testing (#18):** ربط برمجي:
> "أي فشل في نتائج المختبر المسجلة يحول حالة الـ InspectionRequest تلقائياً إلى مرفوض، ويقوم النظام تلقائياً بإنشاء مسودة NCR"

### 💥 المفاجأة: Gemini فشل في نهاية المحادثة الثانية

عندما طلب المستخدم تسليم الملفين الكاملين:
> "ولدلي الملفين"
> 
> **رد Gemini:**
> "I cannot fulfill this request."

**الدرس:** حتى Gemini القوي له حد في حجم المحتوى الذي يمكنه تسليمه دفعة واحدة. الملفان معاً (cursorrules كامل + Engineering Business Rules كامل) تجاوزا قدرته الإخراجية.

### 🎯 الخلاصة من المحادثة الثانية:

1. **النشر ليس مسحاً أعمى** — لكل ملف استراتيجية مختلفة (استبدال، تعديل، دمج، إنشاء)
2. **الملف القديم ENGINEERING_BUSINESS_RULES.md (17 قسماً) هو كنز** — لا تُفكر في مسحه أبداً
3. **القسم 0 في .cursorrules يجب أن يكون غير مشروط** — وأسباب الرفض الخمسة موثقة داخله
4. **حتى Gemini يفشل** عندما يطلب منه تسليم أكثر من طاقته في رسالة واحدة — وهي نفس المشكلة التي تعاني منها النماذج عامةً
