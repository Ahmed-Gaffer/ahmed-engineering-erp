from core.lego_v2.shared.base_module import BaseModule
from app.auth.api import router as auth_router
from app.auth.models import User


class AuthModule(BaseModule):
    def __init__(self):
        super().__init__(name="auth", version="1.0.0", dependencies=[])
        self.add_router(auth_router)
        self.add_model(User)
        self.register()


auth_module = AuthModule()
