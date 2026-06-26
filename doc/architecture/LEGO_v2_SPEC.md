# LEGO v2 — Modular Architecture Specification

## المبدأ الأساسي

كل موديول هو **قطعة LEGO** مستقلة:
- له Models خاصة به
- له Routers خاصة به
- له Services خاصة به
- يُسجّل نفسه في `ModuleRegistry`
- يتواصل مع الموديولات الأخرى عبر `Connectors`
- يرسل/يستقبل أحداث عبر `EventBus`

## المكونات الأساسية

### 1. ModuleRegistry
- يحتفظ بقائمة جميع الموديولات المُسجّلة
- كل موديول يُسجّل نفسه عند التشغيل
- يوفر metadata: الاسم، الإصدار، الـ routers، الـ models، الـ events

### 2. Connectors
- واجهة موحدة للتواصل بين الموديولات
- كل موديول يُعلن عن "ports" (ما يقدمه) و "adapters" (ما يحتاجه من غيره)
- لا يتواصل موديول مع آخر مباشرة — يمر عبر Connector

### 3. EventBus
- نظام أحداث غير متزامن بين الموديولات
- publish/subscribe pattern
- أحداث مثل: `project.created`, `contract.approved`, `ipc.submitted`

## قواعد لا تُكسر

1. **لا import مباشر** بين موديولين — يمر عبر Connector أو EventBus
2. **كل موديول له namespace** خاص في قاعدة البيانات (schema أو prefix)
3. **shared models فقط** في `core/shared` — لا models مشتركة بين موديولين
4. **كل موديول يُسجّل نفسه** — لا تسجيل مركزي

## تسجيل موديول جديد

```python
from core.lego_v2.registry import ModuleRegistry

registry = ModuleRegistry()

registry.register(
    name="engineering",
    version="1.0.0",
    routers=[project_router, contract_router],
    models=[Project, Contract, IPC],
    events=["project.created", "contract.approved"],
    connectors={
        "provides": ["project.get_by_id", "contract.list"],
        "requires": ["hr.employee.get_by_id", "finance.account.get_by_id"]
    }
)
```
