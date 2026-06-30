# Engineering Management System - Roadmap

## الهدف
تحويل النظام إلى **نظام هندسي متكامل** باستخدام أدوات ومكتبات معروفة (مش اختراع من الصفر).

---

## Phase 1 — IPC Overhaul (المستخلصات) ← نبدأ هنا

### المشكلة دلوقتي
- في **نظامين مستخلصات** منفصلين: `IPCHeader/IPCDetail` (جديد) و `PaymentCertificate` (قديم)
- مفيش **PDF** رسمي للطباعة — بس Excel
- الخصوم مش مفصلة كفاية
- مفيش تتبع تراكمي لكل الـ IPCs على المشروع
- مفيش نسبة إنجاز كلية واضحة

### الحل — باستخدام مكتبات معروفة

| المكتبة | ليه |
|----------|-----|
| **ReportLab** (Python) | إنشاء PDF احترافي — pure Python، شغال من غير C dependencies |
| **openpyxl** (موجود) | تحسين الـ Excel الحالي |
| **Recharts** (موجود) | إضافة رسوم بيانية للمستخلصات |

### التغييرات

#### Models (نموذج بيانات موحد)
```
UnifiedIPC
├── header: project, contract, ipc_number, period, dates
├── status: draft → submitted → approved → rejected → paid
├── financials:
│   ├── total_works
│   ├── materials_on_site
│   ├── gross_amount = total_works + materials_on_site
│   ├── deductions:
│   │   ├── retention (نسبة × gross_amount)
│   │   ├── advance_recovery (دفعة مقدمة)
│   │   ├── fines (غرامات)
│   │   ├── insurance (تأمين)
│   │   └── other_deductions
│   └── net_amount = gross_amount - total_deductions
├── cumulative:
│   ├── previous_total (مجموع كل المستخلصات السابقة)
│   ├── current_due (صافي هذا المستخلص)
│   └── total_to_date (previous_total + current_due)
└── contract_ceiling (سقف العقد)
    ├── total_billed
    └── remaining
```

#### API endpoints
- `POST /api/engineering/ipcs` — إنشاء (مدمج مع الخصوم)
- `GET /api/engineering/ipcs/{id}/pdf` — تحميل PDF رسمي
- `GET /api/engineering/projects/{id}/ipcs/summary` — ملخص مالي تراكمي
- `GET /api/engineering/ipcs/{id}/comparison` — مقارنة مع المستخلصات السابقة

#### PDF (ReportLab)
- ترويسة المشروع + المقاول + الاستشاري + المالك
- جدول بنود المستخلص (الكود، الوصف، الوحدة، السابق، الحالي، cumulative، السعر، القيمة)
- ملخص الخصوم (استقطاع تأمين، دفعة مقدمة، غرامات)
- صافي المستخلص
- مربعات التوقيع (مهندس — مقاول — استشاري — مالك)
- باركود للتحقق

#### UI (React)
- شريط تقدم يوضح: المبلغ الكلي vs المبلغ المصروف
- رسم بياني يوضح تطور المستخلصات (line chart)
- تفاصيل الخصوم في tab منفصل
- جدول مقارنة مع المستخلص السابق

---

## Phase 2 — Gantt Chart (جدول زمني)

### الأدوات
| المكتبة | ليه |
|----------|-----|
| **@mui/x-charts** (موجود) | Gantt مدمج مع Material UI |
| أو **dhtmlx-gantt** | Gantt احترافي (drag & drop، critical path، dependencies) |

### المميزات
- WBS هرمي مع dependencies بين المهام
- Critical Path (المسار الحرج)
- Baseline vs Actual (الجدول المخطط vs الفعلي)
- تحميل PDF/Excel للجدول
- تلوين المهام حسب الحالة

---

## Phase 3 — Workflow Engine (إجراءات الاعتماد)

### الأدوات
| المكتبة | ليه |
|----------|-----|
| **SpiffWorkflow** (Python) | محرك إجراءات خفيف ومتوافق مع BPMN |
| أو **Camunda 8** | احترافي — لكن محتاج infrastructure زيادة |

### المميزات
- تعريف إجراءات اعتماد مرنة (Submit → Review → Approve → Reject)
- إشعارات (in-app + email مستقبلًا)
- Audit trail كامل
- توقيع إلكتروني على المستخلصات والمستندات

---

## Phase 4 — ميزات هندسية متقدمة

### Variation Orders / Change Orders
- تتبع التغييرات على العقود
- أثر التغيير على BOQ والجدول الزمني والميزانية

### RFI (Request for Information)
- استفسارات هندسية مع إجراءات اعتماد + مدة زمنية للرد

### Material Approval (MAR)
- طلب اعتماد المواد مع مرفقات (كتالوج، شهادات)
- مقارنة بالمواصفات

### NCR (Non-Conformance Report)
- تسجيل المخالفات الهندسية
- إجراءات تصحيحية ووقائية

### Earned Value Management (EVM)
- Planned Value (PV)
- Earned Value (EV)
- Actual Cost (AC)
- CPI / SPI — أداء التكلفة والجدول

---

## ترتيب التنفيذ

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

كل Phase بتتبني على اللي قبلها. نبدأ بـ **Phase 1 (IPC Overhaul)** لأنه العمود الفقري للنظام الهندسي.
