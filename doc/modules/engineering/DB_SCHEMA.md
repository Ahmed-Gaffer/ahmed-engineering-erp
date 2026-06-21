# DB Schema — Engineering Module

## نظرة عامة

قاعدة البيانات لموديول `engineering` مصممة لإدارة المشاريع الهندسية الضخمة.

## الجداول الرئيسية

### 1. projects (المشاريع)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| code | VARCHAR(50) | كود المشروع الفريد |
| name | VARCHAR(255) | اسم المشروع |
| description | TEXT | وصف المشروع |
| client_id | UUID | معرف العميل (من موديول CRM/Finance لاحقاً) |
| project_type | ENUM | 'building', 'infrastructure', 'industrial', 'road', 'bridge' |
| status | ENUM | 'planning', 'active', 'on_hold', 'completed', 'cancelled' |
| start_date | DATE | تاريخ البدء |
| planned_end_date | DATE | تاريخ الانتهاء المخطط |
| actual_end_date | DATE | تاريخ الانتهاء الفعلي |
| contract_value | DECIMAL(18,2) | قيمة العقد |
| currency | VARCHAR(3) | العملة (EGP, USD, EUR) |
| location | VARCHAR(255) | موقع المشروع |
| engineer_in_charge | VARCHAR(255) | المهندس المسؤول |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2. contracts (العقود)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| contract_number | VARCHAR(100) | رقم العقد |
| contract_type | ENUM | 'main', 'subcontract', 'supply', 'service' |
| party_a | VARCHAR(255) | الطرف الأول |
| party_b | VARCHAR(255) | الطرف الثاني |
| sign_date | DATE | تاريخ التوقيع |
| value | DECIMAL(18,2) | قيمة العقد |
| duration_months | INT | المدة بالشهور |
| retention_percent | DECIMAL(5,2) | نسبة الاستقطاع |
| advance_payment_percent | DECIMAL(5,2) | نسبة الدفعة المقدمة |
| status | ENUM | 'draft', 'active', 'completed', 'terminated' |

### 3. boq_items (بنود الكميات — Bill of Quantities)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| item_code | VARCHAR(50) | كود البند |
| description | TEXT | وصف البند |
| unit | VARCHAR(20) | الوحدة |
| quantity | DECIMAL(18,4) | الكمية التعاقدية |
| unit_price | DECIMAL(18,4) | سعر الوحدة |
| total_price | DECIMAL(18,2) | الإجمالي |
| category | VARCHAR(100) | التصنيف |
| parent_id | UUID | FK -> boq_items (للتسلسل الهرمي) |
| is_group | BOOLEAN | هل هو مجموعة؟ |

### 4. ipc_headers (المستخلصات — Interim Payment Certificates)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| contract_id | UUID | FK -> contracts |
| ipc_number | VARCHAR(50) | رقم المستخلص |
| ipc_period | INT | رقم الدورة |
| start_date | DATE | بداية الفترة |
| end_date | DATE | نهاية الفترة |
| status | ENUM | 'draft', 'submitted', 'approved', 'paid', 'rejected' |
| total_amount | DECIMAL(18,2) | المبلغ الإجمالي |
| retention_amount | DECIMAL(18,2) | مبلغ الاستقطاع |
| advance_recovery | DECIMAL(18,2) | استرداد الدفعة المقدمة |
| net_amount | DECIMAL(18,2) | الصافي |

### 5. ipc_details (تفاصيل المستخلصات)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| ipc_id | UUID | FK -> ipc_headers |
| boq_item_id | UUID | FK -> boq_items |
| previous_quantity | DECIMAL(18,4) | الكمية السابقة |
| current_quantity | DECIMAL(18,4) | الكمية الحالية |
| cumulative_quantity | DECIMAL(18,4) | الكمية التراكمية |
| percentage | DECIMAL(5,2) | نسبة الإنجاز |
| amount | DECIMAL(18,2) | المبلغ |

### 6. drawings (المخططات)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| drawing_number | VARCHAR(100) | رقم المخطط |
| title | VARCHAR(255) | العنوان |
| revision | VARCHAR(10) | رقم المراجعة |
| discipline | ENUM | 'architectural', 'structural', 'mechanical', 'electrical', 'civil' |
| status | ENUM | 'draft', 'for_review', 'approved', 'as_built' |
| file_path | VARCHAR(500) | مسار الملف |
| approved_by | VARCHAR(255) | معتمد من |
| approval_date | DATE | تاريخ الاعتماد |

### 7. daily_reports (التقارير اليومية)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| report_date | DATE | التاريخ |
| weather | VARCHAR(50) | الحالة الجوية |
| manpower_count | INT | عدد العمال |
| equipment_count | INT | عدد المعدات |
| work_description | TEXT | وصف الأعمال |
| issues | TEXT | المشاكل |
| created_by | VARCHAR(255) | أنشأه |

### 8. subcontractors (المقاولون الباطن)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| name | VARCHAR(255) | الاسم |
| trade | VARCHAR(100) | التخصص |
| contract_value | DECIMAL(18,2) | قيمة العقد |
| status | ENUM | 'active', 'completed', 'terminated' |

### 9. schedules (الجداول الزمنية — WBS)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| task_name | VARCHAR(255) | اسم المهمة |
| parent_id | UUID | FK -> schedules |
| start_date | DATE | |
| end_date | DATE | |
| duration_days | INT | |
| progress_percent | DECIMAL(5,2) | |
| status | ENUM | 'not_started', 'in_progress', 'completed', 'delayed' |
| responsible | VARCHAR(255) | المسؤول |

### 10. documents (المستندات)
| العمود | النوع | الوصف |
|--------|-------|-------|
| id | UUID | PK |
| project_id | UUID | FK -> projects |
| title | VARCHAR(255) | العنوان |
| doc_type | ENUM | 'correspondence', 'memo', 'instruction', 'variation_order', 'rfi', 'submittal' |
| reference_number | VARCHAR(100) | الرقم المرجعي |
| file_path | VARCHAR(500) | مسار الملف |
| status | ENUM | 'draft', 'sent', 'received', 'approved', 'rejected' |
| created_by | VARCHAR(255) | |

## العلاقات

```
projects
  ├── contracts (1:N)
  ├── boq_items (1:N)
  ├── ipc_headers (1:N)
  │     └── ipc_details (1:N) -> boq_items
  ├── drawings (1:N)
  ├── daily_reports (1:N)
  ├── subcontractors (1:N)
  ├── schedules (1:N, self-referencing)
  └── documents (1:N)
```

## ملاحظات التصميم

1. جميع الجداول تستخدم UUID كـ Primary Key
2. جميع المبالغ بـ DECIMAL(18,2) أو DECIMAL(18,4) للكميات
3. soft delete غير مطلوب حالياً — hard delete مع audit trail لاحقاً
4. التواريخ بالتنسيق ISO 8601
5. الـ enums تُعرّف في SQLModel كـ Literal strings
