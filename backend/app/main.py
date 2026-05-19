from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine
from app.core.base import Base
from app.auth.api import router as auth_router
from app.upload import router as upload_router
from app.core.logging import logger
import os
import importlib
from pathlib import Path

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ENTITY_MODULES = [
    "contractors", "projects", "phases", "codes",
    "work_orders", "work_order_items",
    "drawings", "drawing_revisions",
    "documents", "payment_certificates",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB tables created, upload dir ready")
    yield


app = FastAPI(title="Engineering Management System", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(upload_router)

for mod_name in ENTITY_MODULES:
    try:
        mod = importlib.import_module(f"app.{mod_name}.api")
        app.include_router(mod.router)
        logger.info("Mounted router: %s", mod_name)
    except Exception as e:
        logger.warning("Could not mount %s: %s", mod_name, e)


FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
    logger.info("Serving frontend from %s", FRONTEND_DIR)
else:
    logger.warning("Frontend dist not found at %s", FRONTEND_DIR)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
