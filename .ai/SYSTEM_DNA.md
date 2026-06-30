# SYSTEM_DNA.md — الحمض النووي للنظام
## Engineering Management System v3 · يُحدَّث عند كل تغيير معماري

> هذا الملف هو دستور النسيج للنظام.
> يقرأه Agent I قبل أي تعديل ليضمن أن الكود الجديد أصيل.

---

## 1. هوية النظام
* **الاسم الرسمي**: Engineering Management System v3
* **الاسم التجاري**: 360 - Engineering Management System
* **النوع**: FastAPI Modular Monolith + LEGO v2 Event-Driven
* **المعمارية**: FastAPI + SQLAlchemy 2.0 Async + React 19 + MUI 9
* **الشركة المطورة**: شركة نجيده للمقاولات العامة والتوريدات (Negida Contracting Co.)
* **مهندس المعمارية (Principal Architect)**: Ahmed Gaffer — يظهر اسمه في تذييل Dashboards الرئيسية كـ Principal System Architect & Technical Provider

---

## 2. قواعد التسمية والهيكل (إلزامية)
* **Python**: `snake_case` للملفات والدوال
* **React**: `PascalCase` للملفات والمكونات
* **SQLAlchemy & DB**: `PascalCase` للـ Models، و `snake_case` لجداول قاعدة البيانات
* **الرباعي الإلزامي**: كل Entity يجب أن تمتلك 4 ملفات: `models.py`, `schemas.py`, `crud.py`, `api.py`
* **استثناء**: engineering_features موديول كبير — يستخدم models/schemas/api.py موحدة

---

## 3. حوكمة الحسابات الهندسية (Engineering Math Governance)
يجب الالتزام الصارم بالمعادلات التالية في أي كود خلفي (Backend):
* **إدارة القيمة المكتسبة (EVM)**:
  * مؤشر أداء الجدول الزمني: $SPI = \frac{EV}{PV}$
  * مؤشر أداء التكلفة: $CPI = \frac{EV}{AC}$
  * الانحرافات: $CV = EV - AC$ و $SV = EV - PV$
* **شهادات الدفع المؤقتة (IPCs)**:
  * الصافي = الإجمالي - الاستقطاع (Retention) - استهلاك الدفعة المقدمة - الغرامات - التأمين - الخصومات
* **بنود الكميات (BOQ)**:
  * total_price = quantity × unit_price
* **المسار الحرج (CPM)**:
  * Float = LS - ES (أو LF - EF)
  * المسار الحرج: كل الأنشطة اللتي Float = 0

---

## 4. الهوية البصرية (UI Engine)
* **الطراز العام**: Corporate Luxury Minimalism
* **التأثيرات**: Daylight-Resistant Glassmorphism (خلفية شفافة 75%، blur 14px)
* **الألوان**: Deep Slate Navy #0F172A (خلفيات رئيسية)، Brushed Amber Gold #D97706 (تمييز)
* **الخط**: Inter (إنجليزي)، Cairo (عربي)
* **المرجع**: brand_identity.json في جذر المشروع

---

## 5. حدود الـ LEGO v2 وقواعد العلاقات
* **يُمنع الاستدعاء المباشر (Direct Import) بين الموديولات المختلفة** (مثل engineering و hr)
* التواصل يمر حصراً عبر `core/lego_v2/event_bus` و `Connectors`
* العلاقات تُدار عبر `SQLAlchemy relationship()` مع `cascade="all, delete-orphan"` للأبناء
* **قاعدة ذهبية**: لا Cross-Module Joins — كل موديول يستعلم من جداوله فقط

---

## 6. الملفات المعمارية المرجعية (بالترتيب)
```
1. brand_identity.json              ← الهوية البصرية
2. .cursorrules                     ← اللقاح وقواعد المشروع
3. architecture_blueprint.md        ← المرجع المعماري الكامل
4. ENGINEERING_BUSINESS_RULES.md    ← قواعد العمل الهندسية (256 قاعدة)
5. .ai/AGENT_0_MAESTRO.md           ← المايسترو
6. PROJECT_MAP.md                   ← خريطة المشروع
7. DB_SCHEMA.md                     ← مخطط قاعدة البيانات
```
