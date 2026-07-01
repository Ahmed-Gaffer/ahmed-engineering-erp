# LEGO v2 — Modular Architecture Specification

> **Note:** The original file contained Arabic text that was corrupted by a UTF-8 encoding error (Mojibake). All non-ASCII bytes were replaced with `?`, making the original Arabic content unrecoverable. This clean replacement preserves the document structure and English content.
>
> **Restored:** 2026-07-01

## Architecture Overview

This document describes the **LEGO v2** modular architecture:
- One Models per entity
- One Routers per entity
- One Services per entity
- Module registration via `ModuleRegistry`
- Inter-module communication via `Connectors`
- Async/pub-sub messaging via `EventBus`

## Core Components

### 1. ModuleRegistry
- Central registry for all module registrations
- Provides lifecycle hooks for startup/shutdown
- Stores metadata: module name, version, routers, models, events

### 2. Connectors
- Synchronous request/response between modules
- Implements a "ports" (provider) and "adapters" (consumer) pattern
- Each module registers ports; other modules resolve them via ConnectorRegistry

### 3. EventBus
- Asynchronous publish/subscribe between modules
- publish/subscribe pattern
- Standard events: `project.created`, `contract.approved`, `ipc.submitted`

## Architecture Rules

1. **No direct imports** between modules — use Connector or EventBus
2. **Shared namespace** per module — all routes use schema-based prefix
3. **Shared models only** in `core/shared` — no cross-module model references
4. **Lifecycle hooks** for initialize, startup, shutdown phases

## Example Registration

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
