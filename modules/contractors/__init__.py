from core.lego_v2.shared.base_module import BaseModule
from app.contractors.api import router as contractors_router
from app.contractors.models import Contractor


class ContractorsModule(BaseModule):
    def __init__(self):
        super().__init__(name="contractors", version="1.0.0", dependencies=[])
        self.add_router(contractors_router)
        self.add_model(Contractor)
        self.register()


contractors_module = ContractorsModule()
