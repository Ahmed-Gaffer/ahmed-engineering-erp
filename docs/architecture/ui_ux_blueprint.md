# EMS UI/UX Blueprint — Corporate Luxury Minimalism & Daylight-Resistant Glassmorphism

> هذا الملف يحدد بدقة مواصفات الواجهات البصرية للنظام.
> يجب على أي AI Agent أو مطرب أن يقرأه قبل تعديل أي واجهة.

---

## 1. فلسفة التصميم (Design Philosophy)

| البند | المواصفة |
|-------|----------|
| الطراز العام | Corporate Luxury Minimalism — فخامة مؤسسية بخطوط نظيفة |
| التأثير الأساسي | Daylight-Resistant Glassmorphism — مقاوم للوضع النهاري |
| الجمهور المستهدف | مجلس الإدارة، الاستشاريون، مدراء المشاريع |
| الانطباع | قمة التكنولوجيا والثقة والوضوح |

---

## 2. لوحة الألوان الدقيقة (Color Palette)

| الرمز | الاستخدام | Hex |
|-------|-----------|-----|
| Deep Slate Navy | الخلفيات الرئيسية والعناوين | `#0F172A` |
| Navy Light | الخلفيات الثانوية | `#1E293B` |
| Brushed Amber Gold | التمييز، الأزرار، التنبيهات | `#D97706` |
| Gold Light | Hover states, highlights | `#F59E0B` |
| Surface Mist | خلفية الصفحة الرئيسية | `#F8FAFC` |
| White | البطاقات والنوافذ | `#FFFFFF` |
| Border Subtle | الحدود الخفيفة | `rgba(15, 23, 42, 0.08)` |
| Glass Background | Glassmorphism layer | `rgba(255, 255, 255, 0.75)` |

---

## 3. Glassmorphism المتقدم (Advanced Glassmorphism Spec)

كل بطاقة (Card)، لوحة (Panel)، أو نافذة (Dialog) يجب أن تطبق هذا الـ CSS:

```css
/* البطاقة التنفيذية الأساسية */
.ems-glass-panel {
    background: rgba(255, 255, 255, 0.75); /* شفافية عالية لمقاومة النهار */
    backdrop-filter: blur(14px) saturate(180%);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.05);
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* تحسين Hover للبطاقات */
.ems-glass-panel:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
}

/* الشريط العلوي المميز */
.ems-gold-bar {
    height: 3px;
    background: linear-gradient(90deg, #D97706, #F59E0B);
    border-radius: 0 0 4px 4px;
}

/* النصوص الذهبية */
.ems-gold-text {
    color: #D97706;
    font-weight: 600;
}

/* خلفية الأزرار الأساسية */
.ems-btn-primary {
    background: linear-gradient(135deg, #0F172A, #1E293B);
    color: #FFFFFF;
    border-radius: 8px;
}
```

---

## 4. الطباعة (Typography)

| العنصر | الخط | الحجم | الوزن |
|--------|------|------|-------|
| العناوين الرئيسية | Montserrat | 24-32px | 700 |
| العناوين الثانوية | Inter | 18-20px | 600 |
| النصوص | Inter | 14-16px | 400 |
| الأرقام (KPIs) | Inter | 28-36px | 700 |
| التسميات | Inter | 12-13px | 500 |

---

## 5. مكونات الواجهة (UI Components)

### 5.1 بطاقات الإحصائيات (StatsCard)
- خلفية Glassmorphism (rgba(255,255,255,0.75))
- رقم كبير بلون ذهبي (#D97706)
- أيقونة في خلفية شفافة Navy (#0F172A)
- شريط علوي (Navy لرئيسي، Gold لثانوي)

### 5.2 الأزرار
- Primary: Navy (#0F172A) مع Hover أفتح (#1E293B)
- Secondary: Gold (#D97706) مع Hover أفتح (#F59E0B)
- Icon: لونها Navy (#0F172A) مع خلفية (rgba(15,23,42,0.08))

### 5.3 الجداول (DataGrid)
- خلفية بيضاء نقية (#FFFFFF)
- رأس الجدول: Navy (#0F172A) مع نص أبيض
- تظليل الصفوف: تناوب خفيف (rgba(0,0,0,0.02))
- شريط علوي: Navy (#0F172A)

### 5.4 الشريط الجانبي (Sidebar)
- خلفية: Deep Slate Navy (#0F172A)
- الأيقونات: Amber Gold (#D97706)
- العنصر النشط: خلفية ذهبية خفيفة (rgba(217,119,6,0.12))

### 5.5 صفحة تسجيل الدخول (Login)
- خلفية الصفحة: تدرج Navy → Navy (#0F172A → #1E293B)
- بطاقة الدخول: Glassmorphism (rgba(255,255,255,0.75))
- زرار الدخول: Gold (#D97706)
- مؤشر التبويب (Tab Indicator): تدرج Navy → Gold

---

## 6. حالات الوضع النهاري (Daylight Mode)

لضمان الرؤية تحت إضاءة مجالس الإدارة القوية:
- Glassmorphism opacity: 75% كحد أدنى
- تباين الألوان: WCAG AA compliant
- الظلال: خفيفة ومنتشرة (لا ظلال قاتمة)
- الكاردات: حد خفيف rgba(15,23,42,0.08) لتعريف الحواف

---

## 7. الملفات المرجعية

- `brand_identity.json` — الهوية البصرية واللفظية
- `frontend/src/theme.js` — MUI Theme (يجب أن يطابق هذه المواصفات)
- `architecture_blueprint.md` — المرجع المعماري الكامل
