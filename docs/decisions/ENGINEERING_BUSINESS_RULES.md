# ENGINEERING_BUSINESS_RULES.md — قواعد منطق أعمال الهندسة
## Engineering Management System v3 · المستخلص من واقع النظام والمعايير الهندسية

> ⚠️ **المرجع**: هذا الملف يُقرأ مع `brand_identity.json` (الهوية البصرية في الجذر) و`docs/architecture/architecture_blueprint.md` (المعمارية) لتكوين الصورة الكاملة.
> **المهندس المعماري**: Ahmed Gaffer — Principal System Architect & Technical Provider

---

## 1. المشاريع (Projects)

### الحقول الأساسية
- **code**: كود فريد للمشروع — إجباري، unique index
- **name**: اسم المشروع — إجباري
- **project_type**: `building`, `infrastructure`, `industrial`, `road`, `bridge`
- **status**: `planned`, `active`, `on_hold`, `completed`, `cancelled`
- **contractor_id**: FK → contractors (اختياري)

### قواعد العمل
1. لا يمكن حذف مشروع له phases, codes, work_orders, drawings, documents, payment_certificates مرتبطة (cascade delete)
2. budget_estimated و budget_actual من نوع DECIMAL(15,2)
3. التواريخ: start_date, end_date_planned, end_date_actual

---

## 2. المراحل (Phases)

### الحقول الأساسية
- **project_id**: FK → projects
- **name**: اسم المرحلة
- **status**: `planned`, `in_progress`, `completed`, `delayed`
- **start_date/end_date**: تواريخ البداية والنهاية

### قواعد العمل
1. cascade delete مع project
2. تاريخ البداية يجب أن لا يسبق تاريخ بدء المشروع

---

## 3. أكواد المشاريع (Project Codes)

### الحقول الأساسية
- **project_id**: FK → projects
- **code**: كود التصنيف
- **description**: وصف الكود

---

## 4. المخططات (Drawings)

### الحقول الأساسية
- **project_id**: FK → projects
- **drawing_number**: رقم المخطط
- **discipline**: `architectural`, `structural`, `mechanical`, `electrical`, `civil`, `other`
- **status**: `draft`, `for_review`, `approved`, `rejected`, `as_built`

### قواعد العمل
1. المخطط يمكن أن يكون له مراجعات (DrawingRevisions)
2. cascade delete مع project

---

## 5. مراجعات المخططات (Drawing Revisions)

### الحقول الأساسية
- **drawing_id**: FK → drawings
- **revision_number**: رقم المراجعة
- **status**: `pending`, `approved`, `rejected`
- **file_path**: مسار الملف المُرفق

---

## 6. المستندات (Documents)

### الحقول الأساسية
- **project_id**: FK → projects
- **doc_type**: `correspondence`, `memo`, `instruction`, `variation_order`, `rfi`, `submittal`, `other`
- **status**: `draft`, `sent`, `received`, `approved`, `rejected`

---

## 7. شهادات الدفع (Payment Certificates)

### الحقول الأساسية
- **project_id**: FK → projects
- **certificate_number**: رقم الشهادة
- **status**: `draft`, `submitted`, `approved`, `paid`, `rejected`
- **amount**: قيمة الشهادة (DECIMAL)
- **payment_date**: تاريخ الدفع

---

## 8. أوامر العمل (Work Orders)

### الحقول الأساسية
- **project_id**: FK → projects
- **status**: `open`, `in_progress`, `completed`, `cancelled`
- **priority**: `low`, `medium`, `high`, `urgent`
- assigned_to: الموظف المسؤول

### قواعد العمل
1. أمر العمل يمكن أن يحتوي على بنود (WorkOrderItems)
2. cascade delete مع project

---

## 9. بنود أوامر العمل (Work Order Items)

### الحقول الأساسية
- **work_order_id**: FK → work_orders
- **item_type**: `material`, `labor`, `equipment`, `other`
- **quantity**, **unit_price**, **total_price**

---

## 10. الموظفون (Employees)

### الحقول الأساسية
- **employee_code**: كود الموظف — unique
- **full_name**: الاسم الكامل
- **department**: القسم
- **position**: المسمى الوظيفي
- **status**: `active`, `inactive`, `terminated`

---

## 11. المقاولون (Contractors)

### الحقول الأساسية
- **name**: اسم المقاول
- **contact_person**: شخص الاتصال
- **phone/email**: وسائل الاتصال
- **tax_id**: الرقم الضريبي
- **status**: `active`, `inactive`

---

## 12. بنود الكميات (BOQ — Bill of Quantities)

### الحقول الأساسية
- **project_id**: FK → projects
- **item_code**: كود البند
- **unit**: وحدة القياس
- **quantity**: الكمية
- **unit_price**: سعر الوحدة
- **total_price**: الإجمالي

### قواعد العمل
1. total_price = quantity * unit_price
2. يمكن استيراد/تصدير Excel

---

## 13. المستخلصات (IPC — Interim Payment Certificate)

### الحقول الأساسية
- **project_id**: FK → projects
- **contract_id**: FK → contracts
- **status**: `draft`, `submitted`, `approved`, `paid`, `rejected`
- **ipc_period**: رقم الدورة

### قواعد العمل
1. IPC له تفاصيل (IPCDetail) ترتبط بـ BOQItem
2. كل detail له: previous_quantity, current_quantity, cumulative_quantity, percentage, amount
3. حالات IPC: draft → submitted → approved → paid | rejected
4. **الحوكمة المالية**: عند احتساب صافي المستخلص (Net Amount)، يجب على النظام برمجياً خصم نسبة الاستقطاع (Retention) والدفعات المقدمة المستهلكة (Advance Payments Deduction) للوصول للصافي بدقة هندسية مطلقة.

---

## 14. التقارير اليومية (Daily Reports)

### الحقول الأساسية
- **project_id**: FK → projects
- **report_date**: التاريخ
- **weather**: حالة الطقس
- **manpower_count**: عدد العمال
- **equipment_count**: عدد المعدات
- **work_description**: وصف الأعمال
- **issues**: المشاكل

---

## 15. المقاولون الباطن (Subcontractors)

### الحقول الأساسية
- **project_id**: FK → projects
- **name**: اسم المقاول الباطن
- **trade**: التخصص
- **contract_value**: قيمة العقد
- **status**: `active`, `completed`, `terminated`

---

## 16. الجداول الزمنية (Schedules — WBS)

### الحقول الأساسية
- **project_id**: FK → projects
- **task_name**: اسم المهمة
- **parent_id**: FK → schedules (self-referencing للتسلسل الهرمي)
- **start_date/end_date**: تواريخ البداية والنهاية
- **duration_days**: المدة بالأيام
- **progress_percent**: نسبة الإنجاز
- **status**: `not_started`, `in_progress`, `completed`, `delayed`

### قواعد حوكمة إدارة القيمة المكتسبة (EVM)
عند معالجة الجداول الزمنية والتقدم، يجب أن يعتمد النظام المعادلات الرياضية الهندسية الصارمة التالية لحساب الانحرافات والأداء:
* **مؤشر أداء الجدول الزمني (Schedule Performance Index)**:
  $$SPI = \frac{EV}{PV}$$
* **مؤشر أداء التكلفة (Cost Performance Index)**:
  $$CPI = \frac{EV}{AC}$$
* **الانحرافات الأساسية**:
  انحراف التكلفة: $CV = EV - AC$ ، وانحراف الجدول الزمني: $SV = EV - PV$

---

## 17. المصادقة والأمان (Auth)

### القواعد
1. JWT-based authentication (access token + refresh token)
2. Token blacklist للـ logout
3. Rate limiting: 5 requests/min على auth endpoints
4. Registration: أول مستخدم يسجل بدون token (Catch-22 fix), الباقي يحتاج admin
5. SECRET_KEY من environment variable
6. Roles: `admin`, `engineer`, `viewer`
7. endpoints محمية بـ `require_role()` أو `get_current_user()`

### صلاحيات الوصول
| الدور | الصلاحيات |
|-------|-----------|
| admin | قراءة/كتابة/حذف كل entities + إدارة المستخدمين |
| engineer | قراءة/كتابة entities engineering + تعديل محدود |
| viewer | قراءة فقط |

---

## 18. اختبارات المواد والموقع (Material & Site Testing)
كل طلب تفتيش موقعي (`InspectionRequest`) قد يترتب عليه وجوب إجراء اختبارات معملية صارمة لضمان الجودة:
* **الخرسانة (Concrete Testing)**: النظام يجب أن يسجل قسراً نتائج مقاومة الضغط لكسر المكعبات (عمر 7 أيام وعمر 28 يوماً) بالإضافة لنتائج اختبار الهبوط الموقعي (Slump Test).
* **التربة والتأسيس (Soil Testing)**: تسجيل نسب الدمك الموقعي، ونتائج اختبار بروكتور (Proctor Test) واختبار كاليفورنيا للتحميل (CBR).
* **التأثير البرمجي**: أي فشل في نتائج المختبر المسجلة يحول حالة الـ `InspectionRequest` تلقائياً إلى مرفوض، ويقوم النظام تلقائياً بإنشاء مسودة تقرير حالة عدم مطابقة (NCR - Non-Conformance Report).

---

## 19. خطط الفحص والتدقيق (ITPs - Inspection Test Plans)
* لا يُسمح برفع أو الموافقة على أي طلب تفتيش موقعي ما لم يكن مرتبطاً بـ بند مرجعي مسجل في خطة الفحص والتدقيق الخاصة بالمشروع (ITP).
* يجب تصنيف نقاط التدقيق برمجياً إلى:
  - **نقاط التوقف الإلزامية (Hold Points - HP)**: يمنع النظام تقدم الأعمال أو إغلاق البند هندسياً إلا بعد توقيع واعتماد الاستشاري جراحياً بكود التحقق.
  - **نقاط المراقبة المستمرة (Witness Points - WP)**: تتيح لفريق الجودة الهندسي تسجيل الملاحظات والمراقبة دون إيقاف وتجميد مسار العمل الموقعي.

---

## 20. إدارة ورشة الرسم الهندسي والتعديلات (Drawings Engineering Lifecycle)
* الرسومات التنفيذية ورسومات الورشة (`Shop Drawings`) تعامل برمجياً بدورة حياة معقدة ومستقلة تماماً عن الرسومات النهائية المسلمة بعد التنفيذ الفعلي للفراغات (`As-Built Drawings`).
* يمنع النظام تفعيل أو قبول أي تعديل أو إصدار مراجعة لرسومات الـ `As-Built` ما لم يتم إرفاق المستند السببي المعتمد لها، ويتمثل في طلب معلومات موقعي (`RFI`) أو أمر تغيير معتمد هندسياً (`Variation Order`).

---

## 21. المنهجية الفنية للمواصفات والأمان (Method Statements & Risk Governance)
* تخضع وثائق المواصفات الفنية للعمل (`Method Statements`) لخط سير واعتمادات ثابت: تقديم الوثيقة (`Submit`) ← مراجعتها من المكتب الفني (`Review`) ← اعتمادها من إدارة المشروع والاستشاري (`Approve`).
* يجب إلزامياً ربط كل وثيقة طريقة عمل بملف تحليل المخاطر الموقعية المباشر وتحويلها إلى مراجع سببية مسجلة في شاشات الـ `Safety Observations` لمنع حدوث أي حوادث موقعية ثغراوية.
