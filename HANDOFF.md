# HANDOFF — Engineering Management System v3

## Session: SURGICAL — Agent C: Auth P0 Fixes + Migration Complete

## ما تم في هذه الجلسة

### ✅ P0 — Registration Catch-22 (مُصلح)
- `dependencies.py`: `HTTPBearer(auto_error=False)` + `get_optional_current_user`
- `auth/api.py`: `/register` يستخدم `get_optional_current_user` — أول مستخدم يسجل بدون token
- `test_auth.py`: 13 اختبار (5 جديدة) — كلها تمر

### ✅ P0 — Token Blacklist + Logout (مُضاف)
- `auth/models.py`: `TokenBlacklist` model (jti, expires_at, blacklisted_at)
- `auth/utils.py`: `blacklist_token()`, `is_token_blacklisted()`, `cleanup_blacklist()`
- `auth/api.py`: `POST /api/auth/logout` — يضيف JTI إلى blacklist
- `dependencies.py`: `get_current_user` + `get_optional_current_user` يتحققان من blacklist قبل السماح

### ✅ P0 — Refresh Token (مُصلح)
- `auth/api.py`: `POST /api/auth/refresh` — يستقبل `refresh_token` في body، يتحقق من نوعه (`refresh`)، يُبطِل القديم ويُصدر pair جديد
- `auth/utils.py`: `create_token()` تُضيف `jti` (UUID) لكل token و `type` للتمييز

### ✅ P0 — Rate Limiting (مُضاف)
- `core/rate_limit.py`: `InMemoryRateLimiter` — 5 requests/min على auth endpoints
- `auth/api.py`: `dependencies=[Depends(auth_rate_limit)]` على router level

### ✅ Alembic Migration (جديد)
- `alembic/versions/89e3127f15a0_add_engineering_features_and_token_.py`
- يضيف 8 جداول: `contracts`, `boq_items`, `ipc_headers`, `ipc_details`, `daily_reports`, `subcontractors`, `schedules`, `eng_documents`
- يضيف `token_blacklist`

### ✅ الاختبارات
- 44/44 pass (39 قديم + 5 جديد: login_returns_refresh, refresh_works, refresh_with_access_rejected, logout_blacklists, logout_no_token)

## المهام المعلقة — بالترتيب الإلزامي

1. **[HIGH] Auth على engineering_features**: جميع endpoints في `backend/app/engineering_features/api.py` بلا auth — يحتاج `Depends(get_current_user)` أو `require_role()`
2. **[HIGH] اختبارات engineering_features**: 8 موديلات + API بدون أي اختبارات
3. **[HIGH] Alembic migration**: تشغيل `alembic upgrade head` على قاعدة البيانات الفعلية
4. **[NORMAL] EventBus/Connectors**: مسجلة لكن غير مستخدمة — لا أحداث ولا وصلات بين الموديولات
5. **[NORMAL] modules/finance/ + modules/inventory/**: stubs فارغة
6. **[NORMAL] Docker**: المشروع الجديد بدون Dockerfile (القديم لديه)
7. **[LOW] pyproject.toml**: إصدارات دنيا (`>=`) بينما requirements.txt إصدارات دقيقة (`==`) — قد يسبب تعارض

## حالة الاختبارات
- العدد: 44 (39 قديم + 5 جديد)
- النتيجة: ✅ 44/44 pass
- التغطية: Auth (13), CRUD (10), New Features (21)

## قرارات معمارية مفتوحة
- engineering_features endpoints: إضافة auth أم تركها public كـ internal API؟

## الملفات التي تم تعديلها
- `backend/app/dependencies.py` — HTTPBearer auto_error=False + blacklist check
- `backend/app/auth/api.py` — register optional + refresh/logout + rate limiting
- `backend/app/auth/models.py` — TokenBlacklist model
- `backend/app/auth/utils.py` — blacklist functions + jti in tokens
- `backend/app/auth/schemas.py` — RefreshRequest + refresh_token in TokenResponse
- `backend/app/core/rate_limit.py` — **جديد**: in-memory rate limiter
- `backend/alembic/env.py` — import engineering_features models
- `backend/tests/test_auth.py` — 5 tests جديدة
- `backend/alembic/versions/89e3127f15a0_*.py` — **جديد**: migration

## بيئة العمل
- Target: `E:\خاص احمد جعفر\برمجة\مشاريع\engineering-management-system-3`
- Python: 3.14.0
- FastAPI: 0.137.1
- SQLAlchemy: 2.0.51
- Virtualenv: `.venv`
- Test command: `$env:PYTHONPATH="backend"; pytest backend\tests -v`

## Next
- Agent C: إضافة Auth على engineering_features endpoints
- Agent E: نقد المخرجات
- Agent F: تحديد الأولويات
- Agent G: تحديث HANDOFF بعد كل تعديل
