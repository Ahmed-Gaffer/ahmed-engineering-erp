# SYSTEM_DNA.md — الحمض النووي للنظام
## [اسم المشروع] · يُحدَّث عند كل تغيير معماري

> هذا الملف هو دستور النسيج للنظام.
> يقرأه Agent I قبل أي تعديل ليضمن أن الكود الجديد أصيل.
> يُحدَّث كلما تطورت أنماط النظام أو معماريته.
> آخر تحديث: [يُستخرج من workspace]

---

## هوية النظام

- **الاسم**: [...]
- **النوع**: [Modular Monolith / SPA + API / Microservices]
- **المعمارية**: [FastAPI + React / Django + Vue / other]
- **الغرض**: [...]
- **مرحلة التطوير**: [Early / Growth / Mature]

---

## قواعد التسمية — إلزامية

| الكيان | النمط | مثال صحيح | مثال خاطئ |
|--------|-------|-----------|-----------|
| ملفات Python | snake_case | `employee_service.py` | `EmployeeService.py` |
| ملفات React | PascalCase | `EmployeeTable.jsx` | `employeeTable.jsx` |
| دوال Python | snake_case | `get_employee_by_id()` | `getEmployeeById()` |
| مكونات React | PascalCase | `EmployeeTable` | `employee_table` |
| Zustand Stores | useXxxStore | `useEmployeeStore` | `employeeStore` |
| React Query Hooks | useXxx | `useEmployees()` | `fetchEmployees()` |
| SQLModel Tables | PascalCase | `Employee` | `employee` |
| حقول DB | snake_case | `created_at` | `createdAt` |
| API Endpoints | kebab-case | `/api/v1/employees/` | `/api/v1/getEmployees/` |
| TypeScript Types | PascalCase | `EmployeeType` | `employee_type` |

---

## هيكل الملفات — أين يجلس كل نوع؟

```
[backend/]
  app/
    models/       ← SQLModel models فقط — لا business logic
    schemas/      ← Pydantic schemas للـ API فقط
    services/     ← كل business logic هنا
    routers/      ← FastAPI endpoints — thin layer فقط
    utils/        ← shared utilities — لا يعتمد على app logic

[frontend/]
  src/
    stores/       ← Zustand stores — global state فقط
    hooks/        ← React Query hooks — data fetching فقط
    components/   ← Reusable UI components — لا fetch مباشر
    pages/        ← Page-level components — composition فقط
    utils/        ← Pure functions — لا side effects
```

---

## أنماط البيانات — ثلاثية إلزامية

كل entity في النظام يملك ثلاثة ملفات لا أقل:

```
Backend:
  models/employee.py    ← SQLModel (DB)
  schemas/employee.py   ← Pydantic (API)
  services/employee.py  ← Business Logic

Frontend:
  hooks/useEmployees.ts  ← React Query
  stores/employeeStore.ts ← Zustand (إذا shared state)
  components/EmployeeTable.tsx ← UI
```

---

## أنماط معالجة الأخطاء

**Backend — النمط الصحيح:**
```python
if not employee:
    raise HTTPException(status_code=404, detail="Employee not found")
```

**Backend — النمط الخاطئ:**
```python
return None  # ← لا ترجع None أبداً بدون معالجة
return {"error": "not found"}  # ← استخدم HTTPException
```

**Frontend — النمط الصحيح:**
```typescript
const { data, error, isLoading } = useEmployees();
if (error) return <ErrorState message={error.message} />;
if (isLoading) return <LoadingState />;
```

**Frontend — النمط الخاطئ:**
```typescript
try { const data = await fetch(...) } catch(e) { console.log(e) }
// ← لا تستخدم fetch مباشر في components
```

---

## حدود الوحدات — ما تملكه كل وحدة

| الوحدة | مسؤولة عن | ممنوع أن تلمس |
|--------|-----------|----------------|
| [Module A] | [...] | [...] |
| [Module B] | [...] | [...] |

---

## قواعد العلاقات

* كل العلاقات بـ `joinedload` — ممنوع lazy loading.
* لا N+1 queries — تحقق دائماً من explain plan.
* المفاتيح الأجنبية دائماً مُفهرسة.

---

## أنماط محظورة — Anti-patterns لهذا النظام

```
❌ لا business logic في الـ routers
❌ لا SQL مباشر — SQLModel دائماً
❌ لا state في component-level إذا يُشارَك بين components
❌ لا تكرر logic موجودة في services/ — استدعها
❌ لا any في TypeScript
❌ لا تضع utils في أكثر من مكان — utils/ فقط
❌ [أضف anti-patterns خاصة بمشروعك]
```

---

## "طريقة النظام" — كيف يحل هذا النظام المشاكل

[فقرة سردية — 2-3 جمل تصف روح النظام وفلسفته في حل المشاكل]

مثال: "هذا النظام يعتمد على فصل صارم بين طبقات البيانات والمنطق والعرض. كل مشكلة تُحل في طبقتها الصحيحة. البيانات تتحرك من أسفل لأعلى (DB → Service → Router → Frontend) ولا تتحرك أفقياً بين الوحدات."

---

## سجل التغييرات المعمارية

| التاريخ | التغيير | المبرر | من قرر |
|---------|---------|--------|--------|
| [من workspace] | [...] | [...] | [...] |
