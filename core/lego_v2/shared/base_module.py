from typing import Any
from core.lego_v2.registry.module_registry import module_registry
from core.lego_v2.event_bus.event_bus import event_bus
from core.lego_v2.connectors.connector_registry import connector_registry


class BaseModule:
    def __init__(self, name: str, version: str = "1.0.0", dependencies: list[str] | None = None):
        self.name = name
        self.version = version
        self.dependencies = dependencies or []
        self._routers = []
        self._models = []
        self._events = []
        self._ports = []
        self._adapters = []

    def add_router(self, router: Any):
        self._routers.append(router)

    def add_model(self, model: Any):
        self._models.append(model)

    def add_event(self, event_name: str, handler: Any):
        self._events.append((event_name, handler))
        event_bus.subscribe(event_name, handler)

    def add_port(self, name: str, handler: Any):
        self._ports.append((name, handler))
        connector_registry.register_port(name, self.name, handler)

    def add_adapter(self, adapter: Any):
        self._adapters.append(adapter)
        connector_registry.register_adapter(self.name, adapter)

    async def emit_event(self, event_name: str, payload: dict | None = None):
        await event_bus.publish({"name": event_name, "source": self.name, "payload": payload or {}})

    def register(self):
        module_registry.register(
            module_name=self.name,
            version=self.version,
            routers=self._routers,
            models=self._models,
            events=[e[0] for e in self._events],
            dependencies=self.dependencies,
        )
