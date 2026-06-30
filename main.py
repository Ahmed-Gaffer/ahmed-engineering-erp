"""
Engineering Management System — Main Application
FastAPI + SQLAlchemy Async + LEGO v2 Modular Architecture
"""

import sys
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BACKEND_DIR = os.path.join(os.path.dirname(__file__), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.config import settings
from app.database import engine
from app.core.base import Base
from app.core.logging import logger
from app.upload import router as upload_router
from app.activities.api import router as activities_router
from app.notifications.api import router as notifications_router

from app.workflow.api import router as workflow_router
from core.lego_v2.registry.module_registry import module_registry
from core.lego_v2.event_bus.event_bus import event_bus
from core.lego_v2.connectors.connector_registry import connector_registry

from modules import auth, contractors, engineering, hr, core as core_module

# Import engineering_features models so they are registered with Base.metadata
from app.engineering_features import models as eng_models

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

FRONTEND_DIR = Path(__file__).resolve().parent / "frontend" / "dist"
INDEX_HTML = FRONTEND_DIR / "index.html"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Engineering Management System v3...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created.")
    dep_errors = module_registry.check_dependencies()
    if dep_errors:
        for err in dep_errors:
            logger.warning("Dependency error: %s", err)
    else:
        logger.info("All module dependencies satisfied.")
    wiring_errors = connector_registry.check_wiring()
    if wiring_errors:
        for err in wiring_errors:
            logger.warning("Connector wiring error: %s", err)
    else:
        logger.info("All connectors wired correctly.")
    logger.info("Registered modules: %s", module_registry.list_modules())
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="360 Engineering ERP",
    description="360 Engineering ERP — APEX Enterprise Platform. LEGO v2 Modular Architecture",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all routers from registered modules
for router in module_registry.get_all_routers():
    app.include_router(router)

# Legacy routers not yet modularized
app.include_router(upload_router)
app.include_router(activities_router)
app.include_router(notifications_router)
app.include_router(workflow_router)


# ─── API Endpoints ───

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "system": "360 Engineering ERP — APEX Enterprise",
        "architecture": "LEGO v2",
        "modules": module_registry.list_modules()
    }


# ─── Frontend SPA Serving ───

if FRONTEND_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/") or full_path.startswith("docs") or full_path.startswith("openapi"):
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        if INDEX_HTML.is_file():
            return FileResponse(str(INDEX_HTML))
        return JSONResponse({"detail": "Not Found"}, status_code=404)
else:
    logger.warning("Frontend dist not found at %s", FRONTEND_DIR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
