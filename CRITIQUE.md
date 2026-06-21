# CRITIQUE.md — سجل المشاكل المفتوحة
## Engineering Management System v3 · آخر تحديث: 2026-06-21 (Genesis + SURGICAL)

---

## 🟡 متوسطة — تؤثر على الصيانة والتطوير

| # | المشكلة | الموقع | المقترح |
|---|---------|--------|---------|
| 1 | EventBus مسجّل لكن لا توجد أحداث مشتركة بين الموديولات | `core/lego_v2/event_bus/` | إضافة events مثل `project.created`, `payment.approved` |
| 2 | Connectors مسجّلين لكن لا توجد ports/adapters مستخدمة | `core/lego_v2/connectors/` | تعريف ports للتواصل بين engineering → hr |
| 3 | لا يوجد docker-compose.yml للتطوير المحلي | الجذر | إنشاء docker-compose.yml مع python + postgres |
| 4 | لا يوجد `.env.example` | الجذر | إنشاء ملف example للمتغيرات البيئية |

## 🟢 خفيفة — تحسينات مستقبلية

| # | المشكلة | الموقع | المقترح |
|---|---------|--------|---------|
| 5 | Sidebar لا يحتوي على Notes/Gallery/Rooms/Sweets Budget | `frontend/src/components/Sidebar/` | إضافة الأقسام المطلوبة |
| 6 | لا يوجد Soft Delete في GenericCRUD | `backend/app/core/crud.py` | إضافة is_deleted filter |
| 7 | Alembic auto-generation غير مُفعل | `backend/alembic/` | تكوين auto-migration |
| 8 | Search مقتصر على engineering module | `backend/app/core/search.py` | توسيع لـ HR, finance, inventory |
| 9 | Export مقتصر على engineering module | `backend/app/core/export_api.py` | توسيع لكل الموديولات |
| 10 | SQLite للـ dev — PostgreSQL مطلوب للإنتاج | `backend/app/config.py` | إضافة PostgreSQL support |

## ✅ مَحلولة

| # | المشكلة | الحل | في الجلسة |
|---|---------|------|-----------|
| 1 | SECRET_KEY ثابت في الكود | أصبح من environment variable | SURGICAL — Auth P0 |
| 2 | Registration Catch-22 | أول مستخدم يسجل بدون token | SURGICAL — Auth P0 |
| 3 | لا يوجد Logout/Token Revocation | Token blacklist + refresh token | SURGICAL — Auth P0 |
| 4 | لا يوجد Rate Limiting | 5 requests/min على auth | SURGICAL — Auth P0 |
| 5 | Frontend DataTable localeText خطأ | إصلاح MUI X v8 API | SURGICAL — Frontend |
| 6 | Alembic migration ناقص | إضافة engineering_features + token_blacklist | SURGICAL — Migration |
| 7 | كود مكرر: `modules/auth/auth/` | حذف المجلد (6 ملفات، لم يكن مستخدماً) | SURGICAL — Genesis Follow-up |
| 8 | كود مكرر: `modules/core/core/` | حذف المجلد (9 ملفات، لم يكن مستخدماً) | SURGICAL — Genesis Follow-up |
| 9 | كود مكرر: `modules/contractors/contractors/` | حذف المجلد (5 ملفات، لم يكن مستخدماً) | SURGICAL — Genesis Follow-up |
