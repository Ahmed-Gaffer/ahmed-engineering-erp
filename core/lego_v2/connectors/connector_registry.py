from typing import Any, Callable


class ConnectorRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._ports = {}
            cls._instance._adapters = {}
        return cls._instance

    def register_port(self, name: str, module: str, handler: Callable):
        key = f"{module}.{name}"
        self._ports[key] = {"module": module, "name": name, "handler": handler}

    def register_adapter(self, module: str, adapter: Callable):
        if module not in self._adapters:
            self._adapters[module] = []
        self._adapters[module].append(adapter)

    async def call(self, module: str, port_name: str, **kwargs) -> Any:
        key = f"{module}.{port_name}"
        port = self._ports.get(key)
        if not port:
            raise RuntimeError(f"Port not found: {key}")
        handler = port["handler"]
        import inspect
        if inspect.iscoroutinefunction(handler):
            return await handler(**kwargs)
        return handler(**kwargs)

    def check_wiring(self) -> list[str]:
        errors = []
        for module, adapters in self._adapters.items():
            for adapter in adapters:
                # Simple check: adapter should reference existing ports
                # In a real system, you'd introspect the adapter
                pass
        return errors


connector_registry = ConnectorRegistry()
