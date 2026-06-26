# ENGINEERING_BUSINESS_RULES.md — قواعد منطق أعمال الهندسة
## Engineering Management System v3 · المستخلص من واقع النظام

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
