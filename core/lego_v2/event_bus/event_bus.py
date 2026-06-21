from typing import Any, Callable


class EventBus:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._handlers = {}
            cls._instance._history = []
        return cls._instance

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self._handlers:
            self._handlers[event_name] = []
        self._handlers[event_name].append(handler)

    async def publish(self, event: dict):
        event_name = event.get("name")
        self._history.append(event)
        handlers = self._handlers.get(event_name, [])
        for handler in handlers:
            try:
                if hasattr(handler, "__call__"):
                    import inspect
                    if inspect.iscoroutinefunction(handler):
                        await handler(event)
                    else:
                        handler(event)
            except Exception as e:
                # Log but don't break the chain
                print(f"Event handler error for {event_name}: {e}")

    def get_history(self, event_name: str | None = None) -> list[dict]:
        if event_name:
            return [e for e in self._history if e.get("name") == event_name]
        return self._history.copy()


event_bus = EventBus()
