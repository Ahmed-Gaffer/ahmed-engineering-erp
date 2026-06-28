# GAP ANALYSIS — Engineering Management System vs. Real Engineering Systems
## 2026-06-28

---

## الفرق بين "نظام يدير مستندات" و"نظام هندسي حقيقي"

النظام الحالي قوي في **إدارة تدفق المستندات** (RFIs, Submittals, NCRs, IPCs) وفيه حسابات مالية وهندسية (EVM, CPM, BOQ).
لكن لسه ناقصاه **الأدوات الهندسية التقنية** إللي تخلي المهندس يقدر يشتغل جواه من غير ما يفتح برنامج تاني.

---

## ✅ الموجود فعلاً (Document Control + Financial)

| المجال | موجود؟ | مستواه |
|--------|--------|--------|
| RFIs — استفسارات فنية | ✅ | كامل مع workflow + categories |
| NCRs — عدم مطابقة | ✅ | severity + corrective/preventive |
| MARs — اعتماد مواد | ✅ | spec_ref + manufacturers |
| Submittals — التقديمات | ✅ | review cycle + resubmission |
| Transmittals — الإرساليات | ✅ | direction + acknowledge |
| IPCs — شهادات الدفع | ✅ | حسابات مالية + PDF |
| BOQ — بنود الكميات | ✅ | هرمي + Excel |
| Variations — التغييرات | ✅ | cost + schedule impact |
| Schedule — الجدول الزمني | ✅ | CPM + baselines + milestones |
| EVM — إدارة القيمة المكتسبة | ✅ | SPI, CPI, EAC, ETC, VAC |
| Daily Reports — تقارير يومية | ✅ | manpower + equipment |
| HSE — السلامة | ✅ | incidents + observations |
| Contracts — العقود | ✅ | مع IPCs + Variations |

## ❌ الناقص (Engineering Technical Tools)

### 🧪 1. اختبارات المواد — Material Testing (HIGH)
> ده أهم حاجة. كل موقع بناء بيعمل اختبارات يومية للخرسانة والتربة والحديد.

| الناقص | أهميته |
|--------|--------|
| Concrete Tests — اختبارات الخرسانة | مكعبات 7/28 يوم، Slump، قوة الضغط |
| Soil Tests — اختبارات التربة | دمك، Proctor، CBR، كثافة |
| Steel Tests — اختبارات الحديد | شد، انحناء، لحام |
| Lab Requests — طلبات معمل | ربط العينة بـ Inspection Request |
| Test Certificates — شهادات اختبار | النتيجة + Pass/Fail + رابط NCR |

### 📋 2. خطط التفتيش — Inspection Test Plans (ITP) (HIGH)
> بدون ITP، التفتيش بدون مرجع. ITP يحدد إيه اللي يتفحص وإمتى ومعايير القبول.

| الناقص | أهميته |
|--------|--------|
| ITP definition | قائمة بنود التفتيش لكل نشاط |
| Hold Points | نقاط توقف إجبارية |
| Witness Points | نقاط حضور |
| Reference standards | ربط بالمواصفات (ASTM, BS, ACI) |

### 📐 3. المواصفات القياسية — Specifications Library (MEDIUM)
> حالياً `specification_ref` مجرد نص حر. محتاج مكتبة مواصفات حقيقية.

| الناقص | أهميته |
|--------|--------|
| Standards table | ASTM, BS, ACI, SBC, ISO |
| Project specs | مواصفات المشروع |
| Spec sections | تقسيم حسب division (CSI MasterFormat) |

### 🏗 4. ورشة الرسم الهندسي — Drawings Engineering (MEDIUM)
> حالياً الـ Drawing مجرد مستند. محتاج يصنف ويتتبع بشكل هندسي.

| الناقص | أهميته |
|--------|--------|
| Shop Drawings | تفريق عن IFC مع submission/approval |
| As-Built | توثيق التعديلات بعد التنفيذ |
| Drawing Categories | Architect/Struct/MEP مع disciplines فرعية |
| Transmittal → Drawing | ربط الإرساليات بالرسومات |

### 📝 5. المواصفات الفنية للتنفيذ — Method Statements (MEDIUM)
> شرح كيفية تنفيذ العمل — مرجع أساسي للمهندس.

| الناقص | أهميته |
|--------|--------|
| Method Statement workflow | Submit → Review → Approve |
| Reference links | ربط بـ Specs + ITP + Drawings |
| Risks identification | تحليل المخاطر |

### 🚧 6. تصاريح العمل — Permits (LOW)
> تصاريح الأعمال الحرجة (حرارة، حفر، ارتفاع).

| الناقص | أهميته |
|--------|--------|
| PTW system | Hot work, excavation, height |
| Gas test | للعمل في أماكن مغلقة |
| Authorization | توقيع المسؤولين |

### 📏 7. المساحة — Survey (LOW)
> نقاط المرجع المساحية والمناسيب.

| الناقص | أهميته |
|--------|--------|
| Benchmarks | نقاط المرجع الثابتة |
| Coordinates | إحداثيات المشروع |
| Survey logs | سجل القياسات اليومية |

---

## الخلاصة

| التصنيف | العدد |
|---------|-------|
| Entities إدارية بحتة | 17 (38%) |
| Entities هندسية (Document Control) | 15 (33%) |
| Entities هندسية (Engineering Tools) | 8 (18%) |
| **الناقص (Engineering Tools)** | **~15 (33%)** |

**النظام الحالي:** قوي في **إدارة المستندات الهندسية** + **الحسابات المالية**.
**الناقص:** أدوات **الهندسة التقنية** — الاختبارات، المواصفات، خطط التفتيش، طرق التنفيذ.

لما نضيف دول، النظام يبقى **"Engineering System"** كامل مش "Document Control System".
