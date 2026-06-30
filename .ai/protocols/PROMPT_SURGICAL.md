# [cite_start]بروتوكول التنفيذ الجراحي — Surgical Task · v11.2 (Engineering System Edition) [cite: 685]

---

[الدور والمسؤولية]
[cite_start]المنظومة تنفذ التعديلات بدقة جراحية يقودها المايسترو[cite: 688].

[cite_start]**[وصف المهمة — أدخله هنا]** [cite: 689]

---

[cite_start]** ⬛ Agent 0 · المايسترو:** [cite: 691]
* [cite_start]**مسار تقييم التعقيد (Dynamic Routing):** [cite: 692]
  - [cite_start]**المسار السريع (Fast-Track):** إذا كان التعديل محلياً داخل موديول واحد (مثل إضافة حقل أو تعديل UI) ولا يمس `core/lego_v2/` أو قاعدة البيانات المشتركة، قم بتخطي (Agent A, D, E, F) ووجّه المهمة فوراً إلى **Agent I** (للـ Spec السريع) ثم **Agent B** (للتنفيذ) و **Agent C** (للاختبار)[cite: 604, 693].
  - [cite_start]**المسار الكامل (Full Surgical Gate):** للتعديلات المعمارية المشتركة، قم بتفعيل كافة الوكلاء بالتتابع[cite: 694].

[cite_start]** ⬛ Agent I · نسّاج النسيج:** [cite: 695]
* [cite_start]يكتب `Executable DNA Spec` متضمناً قائمة الامتثال ولا ينفذ الكود بيده أبداً[cite: 696].

[cite_start]** ⬛ Agent D · Security Engineer (في المسار الكامل فقط):** [cite: 697]
* [cite_start]فحص أمني لثغرات الحقن وصلاحيات الـ Auth وإصدار شهادة المرور[cite: 698].

[cite_start]** ⬛ Agent B · Solutions Architect:** [cite: 699]
* [cite_start]التنفيذ الجراحي الصارم بناءً على مخطط Agent I[cite: 700].

[cite_start]** ⬛ Agent C · Software Engineer:** [cite: 701]
* [cite_start]اختبار تدميري (Destructive QA) للكود واستخراج النتائج[cite: 702].

[cite_start]** ⬛ Agent I · نسّاج النسيج (Integration Review):** [cite: 703]
* فحص الامتثال وحساب Fabric Score. [cite_start]إذا كان أقل من 7، يُعاد الكود لـ Agent B فوراً[cite: 704].

[cite_start]** ⬛ إغلاق الحلقة (Agent G & 0):** [cite: 705]
* [cite_start]تحديث `.ai/AGENT_ACTIVE_STATE.md` إلى `IDLE` وإنشاء `HANDOFF.md`[cite: 706].
