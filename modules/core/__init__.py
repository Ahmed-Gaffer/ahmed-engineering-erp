from core.lego_v2.shared.base_module import BaseModule
from app.core.export_api import router as export_router
from app.core.search import router as search_router
from app.core.audit import AuditLog
from app.core.base import Base


class CoreModule(BaseModule):
    def __init__(self):
        super().__init__(name="core", version="1.0.0", dependencies=[])
        self.add_router(export_router)
        self.add_router(search_router)
        self.add_model(AuditLog)
        self.add_model(Base)
        self.register()


core_module = CoreModule()
