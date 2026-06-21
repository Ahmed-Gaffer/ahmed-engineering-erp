from core.lego_v2.shared.base_module import BaseModule
from app.employees.api import router as employees_router
from app.employees.models import Employee


class HRModule(BaseModule):
    def __init__(self):
        super().__init__(name="hr", version="1.0.0", dependencies=[])
        self.add_router(employees_router)
        self.add_model(Employee)
        self.register()


hr_module = HRModule()
