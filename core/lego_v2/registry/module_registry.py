from typing import Any


class ModuleRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._modules = {}
        return cls._instance

    def register(
        self,
        module_name: str,
        version: str = "1.0.0",
        routers: list | None = None,
        models: list | None = None,
        events: list | None = None,
        dependencies: list[str] | None = None,
    ):
        self._modules[module_name] = {
            "name": module_name,
            "version": version,
            "routers": routers or [],
            "models": models or [],
            "events": events or [],
            "dependencies": dependencies or [],
        }

    def get(self, name: str) -> dict | None:
        return self._modules.get(name)

    def list_modules(self) -> list[str]:
        return list(self._modules.keys())

    def get_all_routers(self) -> list[Any]:
        routers = []
        for mod in self._modules.values():
            routers.extend(mod.get("routers", []))
        return routers

    def check_dependencies(self) -> list[str]:
        errors = []
        registered = set(self._modules.keys())
        for mod in self._modules.values():
            for dep in mod.get("dependencies", []):
                if dep not in registered:
                    errors.append(f"Module '{mod['name']}' missing dependency: '{dep}'")
        return errors


module_registry = ModuleRegistry()
