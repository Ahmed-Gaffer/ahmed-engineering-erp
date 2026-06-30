# .TASKS_PLAN.md — قائمة المهام
## Engineering Management System v3 · مرتبة حسب الأولوية

---

## أولوية CRITICAL

- [ ] **إصلاح HF Space deploy** — التحقق من HF_TOKEN و HF_SPACE_REPO
- [ ] **GitHub Push** — دفع المشروع وتحديث README.md

## أولوية HIGH

- [x] **تحديث Frontend Theme** — تغيير primary color + إضافة Montserrat للـ headings
- [x] **إنشاء Footer بالتوقيع المعماري** — في Login.jsx + Layout.jsx
- [x] **Auto-NCR على فشل التفتيش** — إنشاء NCR تلقائي عند فشل Inspection
- [x] **Incremental EventBus Adoption** — استبدال جميع استدعاءات `_create_notification()` (32 occurrence) بـ `emit_event()` عبر EventBus
- [x] **هيكلة engineering_features — استخراج crud.py** — إنشاء crud.py مع 34 GenericCRUD + ربط get/update/delete لـ 12 entity
- [x] **بناء بيانات شركة Negida** — seed_demo.py يحتوي 15 مشروع حقيقي + عقود + BOQ + IPCs
- [x] **Integration Testing شامل** — 62/63 ✅ بعد كل التغييرات
- [ ] **PostgreSQL Migration** — الانتقال من SQLite إلى PostgreSQL للإنتاج

## أولوية MEDIUM

- [ ] **إنشاء HR_BUSINESS_RULES.md** — قواعد عمل الموارد البشرية (مطلوب لـ Agent H)
- [ ] **EventBus + Connectors** — تفعيل التواصل بين engineering و finance عبر الأحداث
- [ ] **Alembic auto-migration** — تفعيل الترحيل التلقائي
- [ ] **Soft Delete** — إضافة `is_deleted` لجميع entities
- [x] **تحديث CRITIQUE.md** — إضافة سجل التغييرات الجراحية من الجلسة

## أولوية LOW

- [ ] **Docker Compose** — إنشاء docker-compose.yml للتطوير المحلي
- [ ] **Test Coverage** — رفع التغطية إلى > 60%
- [ ] **إزالة duplicate modules** — تنظيف `modules/auth/auth/` المكرر
- [ ] **activities/ module rebuild** — models/schemas/crud/api كاملة (تم)
- [x] **تعديل Sidebar** — "ERP System" ← "Engineering Intelligence Platform"
- [x] **إصلاح ألوان theme.js** — 8 أخطاء لونية `#215,119,6` ← `#217,119,6`

---

## الملاحظات

- الحالة الحالية: **OPERATIONAL** — النظام شغال على `localhost:8000`
- 62/63 اختبارات ✅ (فشل واحد pre-existing unrelated)
- ✅ EventBus مهاجر بالكامل — 32 استدعاء `_create_notification()` ← `emit_event()`
- ✅ GenericCRUD مربوط لـ 12 entity (get/update/delete)
- ✅ 15 مشروع حقيقي لشركة نجيده للمقاولات في قاعدة البيانات
- ✅ Root cleanup: 15 ملف .md نُقلت إلى `docs/`، dead code أزيل (`db/`, `tests/`, `modules/inventory/`, `modules/finance/`, `modules/hr/employees/`, `core/shared/` empties)
- ✅ Brand identity مضبوط: title ← "360 Engineering ERP | APEX Enterprise"، favicon حقيقي، إخفاء التوقيع من Login
- ✅ Seed scripts موحّدة: `seed_demo.py` فقط
- Users: `admin/admin123`, `engineer/eng123`, `viewer/view123`
