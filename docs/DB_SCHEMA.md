# DB_SCHEMA.md — مخطط قاعدة البيانات الكلي
## Engineering Management System v3 · LEGO v2

---

## محرك قاعدة البيانات

- **SQLite** (تطوير) — `sqlite+aiosqlite:///./engineering.db`
- **PostgreSQL** (إنتاج — مخطط) — عبر SQLAlchemy 2.0 async
- **Alembic** للـ migrations (3 إصدارات حالياً)

---

## قواعد التصميم العامة

1. جميع الـ Primary Keys من نوع `Integer` auto-increment
2. جميع التواريخ من نوع `DateTime` أو `Date` من SQLAlchemy
3. المبالغ المالية من نوع `Numeric(15, 2)` أو `Numeric(18, 2)`
4. الـ Enums تُطبَّق كـ `String` محددة الطول مع validation في Pydantic schemas
5. Timestamps: `created_at`, `updated_at` عبر `TimestampMixin`
6. Audit trail عبر `AuditLog` جدول منفصل

---

## الجداول الأساسية

### 1. users (المستخدمون — Auth Module)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| username | String(50) | unique, index |
| email | String(255) | unique |
| hashed_password | String(255) | bcrypt hash |
| role | String(20) | admin, engineer, viewer |
| is_active | Boolean | default true |
| created_at/updated_at | DateTime | TimestampMixin |

### 2. token_blacklist (التوكن الملغاة — Auth Module)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| jti | String(255) | unique, index |
| token_type | String(20) | access, refresh |
| expires_at | DateTime | |
| blacklisted_at | DateTime | |

### 3. contractors (المقاولون)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| name | String(255) | |
| contact_person | String(255) | nullable |
| phone | String(50) | nullable |
| email | String(255) | nullable |
| address | Text | nullable |
| tax_id | String(50) | nullable |
| status | String(20) | active, inactive |
| created_at/updated_at | DateTime | TimestampMixin |

### 4. projects (المشاريع)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| code | String(50) | unique, index |
| name | String(255) | |
| location | String(255) | nullable |
| project_type | String(50) | building, infrastructure, etc. |
| contractor_id | Integer | FK → contractors, nullable |
| start_date | Date | nullable |
| end_date_planned | Date | nullable |
| end_date_actual | Date | nullable |
| status | String(20) | planned, active, etc. |
| budget_estimated | Numeric(15,2) | nullable |
| budget_actual | Numeric(15,2) | nullable |
| client_name | String(255) | nullable |
| consultant_name | String(255) | nullable |
| project_manager | String(255) | nullable |
| notes | Text | nullable |
| created_at/updated_at | DateTime | TimestampMixin |

### 5. project_phases (مراحل المشروع)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| name | String(255) | |
| description | Text | nullable |
| status | String(20) | planned, in_progress, etc. |
| start_date | Date | nullable |
| end_date | Date | nullable |
| order_index | Integer | الترتيب |

### 6. project_codes (أكواد المشروع)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| code | String(100) | |
| description | Text | nullable |

### 7. drawings (المخططات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| drawing_number | String(100) | |
| title | String(255) | nullable |
| discipline | String(50) | architectural, structural, etc. |
| status | String(20) | draft, for_review, etc. |
| file_path | String(500) | nullable |
| created_at/updated_at | DateTime | TimestampMixin |

### 8. drawing_revisions (مراجعات المخططات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| drawing_id | Integer | FK → drawings |
| revision_number | String(20) | |
| status | String(20) | pending, approved, rejected |
| file_path | String(500) | nullable |
| notes | Text | nullable |
| reviewed_by | String(255) | nullable |

### 9. documents (المستندات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| title | String(255) | |
| doc_type | String(50) | correspondence, memo, etc. |
| reference_number | String(100) | nullable |
| file_path | String(500) | nullable |
| status | String(20) | draft, sent, etc. |
| created_at/updated_at | DateTime | TimestampMixin |

### 10. payment_certificates (شهادات الدفع)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| certificate_number | String(100) | |
| amount | Numeric(15,2) | |
| status | String(20) | draft, submitted, etc. |
| payment_date | Date | nullable |
| notes | Text | nullable |

### 11. work_orders (أوامر العمل)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| title | String(255) | |
| description | Text | nullable |
| status | String(20) | open, in_progress, etc. |
| priority | String(20) | low, medium, high, urgent |
| assigned_to | String(255) | nullable |
| due_date | Date | nullable |

### 12. work_order_items (بنود أوامر العمل)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| work_order_id | Integer | FK → work_orders |
| description | Text | |
| item_type | String(50) | material, labor, etc. |
| quantity | Numeric(15,2) | |
| unit_price | Numeric(15,2) | |
| total_price | Numeric(15,2) | |

### 13. employees (الموظفون)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| employee_code | String(50) | unique |
| full_name | String(255) | |
| department | String(100) | nullable |
| position | String(100) | nullable |
| phone | String(50) | nullable |
| email | String(255) | nullable |
| status | String(20) | active, inactive, terminated |

### 14. activities (النشاطات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| user_id | Integer | FK → users |
| action | String(50) | |
| entity_type | String(50) | |
| entity_id | Integer | nullable |
| description | Text | nullable |
| created_at | DateTime | |

### 15. notifications (الإشعارات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| user_id | Integer | FK → users |
| title | String(255) | |
| message | Text | |
| is_read | Boolean | default false |
| link | String(500) | nullable |
| created_at | DateTime | |

### 16. audit_logs (سجل التدقيق)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| user_id | Integer | |
| action | String(20) | create, update, delete |
| entity_type | String(50) | |
| entity_id | Integer | nullable |
| details | Text | nullable |
| created_at | DateTime | |

---

## جداول Engineering Features (موديول المكتب الفني)

### 17. boq_items (بنود الكميات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| item_code | String(50) | |
| description | Text | |
| unit | String(20) | |
| quantity | Numeric(18,4) | |
| unit_price | Numeric(18,4) | |
| total_price | Numeric(18,2) | |
| category | String(100) | nullable |
| parent_id | Integer | FK → boq_items (nullable) |
| is_group | Boolean | default false |

### 18. contracts (العقود)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| contract_number | String(100) | |
| contract_type | String(20) | main, subcontract, etc. |
| party_a | String(255) | |
| party_b | String(255) | |
| sign_date | Date | nullable |
| value | Numeric(18,2) | |
| duration_months | Integer | nullable |
| retention_percent | Numeric(5,2) | |
| advance_payment_percent | Numeric(5,2) | |
| status | String(20) | draft, active, etc. |

### 19. ipc_headers (رؤوس المستخلصات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| contract_id | Integer | FK → contracts |
| ipc_number | String(50) | |
| ipc_period | Integer | |
| start_date | Date | |
| end_date | Date | |
| status | String(20) | draft, submitted, etc. |
| total_amount | Numeric(18,2) | |
| retention_amount | Numeric(18,2) | |
| advance_recovery | Numeric(18,2) | |
| net_amount | Numeric(18,2) | |

### 20. ipc_details (تفاصيل المستخلصات)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| ipc_id | Integer | FK → ipc_headers |
| boq_item_id | Integer | FK → boq_items |
| previous_quantity | Numeric(18,4) | |
| current_quantity | Numeric(18,4) | |
| cumulative_quantity | Numeric(18,4) | |
| percentage | Numeric(5,2) | |
| amount | Numeric(18,2) | |

### 21. daily_reports (التقارير اليومية)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| report_date | Date | |
| weather | String(50) | nullable |
| manpower_count | Integer | nullable |
| equipment_count | Integer | nullable |
| work_description | Text | nullable |
| issues | Text | nullable |
| created_by | String(255) | nullable |

### 22. subcontractors (المقاولون الباطن)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| name | String(255) | |
| trade | String(100) | nullable |
| contract_value | Numeric(18,2) | nullable |
| status | String(20) | active, completed, terminated |

### 23. schedules (الجداول الزمنية — WBS)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| task_name | String(255) | |
| parent_id | Integer | FK → schedules (nullable) |
| start_date | Date | nullable |
| end_date | Date | nullable |
| duration_days | Integer | nullable |
| progress_percent | Numeric(5,2) | |
| status | String(20) | not_started, in_progress, etc. |
| responsible | String(255) | nullable |

### 24. eng_documents (مستندات الهندسة)
| العمود | النوع | الملاحظات |
|--------|-------|-----------|
| id | Integer | PK |
| project_id | Integer | FK → projects |
| title | String(255) | |
| doc_type | String(50) | correspondence, memo, etc. |
| reference_number | String(100) | nullable |
| file_path | String(500) | nullable |
| status | String(20) | draft, sent, etc. |
| created_by | String(255) | nullable |

---

## العلاقات الرئيسية

```
projects
  ├── project_phases (1:N)
  ├── project_codes (1:N)
  ├── work_orders (1:N)
  │     └── work_order_items (1:N)
  ├── drawings (1:N)
  │     └── drawing_revisions (1:N)
  ├── documents (1:N)
  ├── payment_certificates (1:N)
  ├── boq_items (1:N, self-referencing)
  ├── contracts (1:N)
  │     └── ipc_headers (1:N)
  │           └── ipc_details (1:N) → boq_items
  ├── daily_reports (1:N)
  ├── subcontractors (1:N)
  └── schedules (1:N, self-referencing)
```

---

## الـ Migrations

| الإصدار | الوصف |
|---------|-------|
| `d85f1668785b_initial` | الجداول الأساسية (users, contractors, projects, etc.) |
| `76e9ce3563fc_add_audit_logs` | إضافة audit_logs جدول |
| `89e3127f15a0_add_engineering_features_and_token_` | إضافة BOQ, IPC, DailyReports, Subcontractors, Schedules + token_blacklist |
