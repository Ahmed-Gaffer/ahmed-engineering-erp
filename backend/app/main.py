from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, async_session
from app.core.base import Base
from sqlalchemy import select
from app.auth.api import router as auth_router
from app.upload import router as upload_router
from app.core.logging import logger
from app.company_profile.models import CompanyProfile
from core.lego_v2.event_bus.event_bus import event_bus
from core.lego_v2.event_bus.events import ENGINEERING_EVENTS
from app.engineering_features.notification_adapter import handle_engineering_event
import os
import importlib
from pathlib import Path

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ENTITY_MODULES = [
    "contractors", "projects", "phases", "codes",
    "work_orders", "work_order_items",
    "drawings", "drawing_revisions",
    "documents", "payment_certificates",
    "employees",
    "company_profile",
    "engineering_features",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as session:
        result = await session.execute(select(CompanyProfile).limit(1))
        if not result.scalar_one_or_none():
            session.add(CompanyProfile(
                company_name_ar="شركة نجيده للمقاولات العامة والتوريدات",
                company_name_en="Negida Contracting Co.",
                established_year=1987,
                about_ar="شركة نجيده للمقاولات هي شركة متخصصة في خدمات المقاولات المتكاملة، تركز بشكل أساسي على جميع مجالات التشييد والبنية التحتية والطرق والأعمال البحرية والتكريك. تأسست الشركة عام 1987، ومن خلال أكثر من 35 عاماً من الخبرة، نجحت شركة نجيده في التعاقد بنجاح وكفاءة في صناعة المقاولات المصرية المزدهرة. تقوم الشركة بدور رئيسي في المشروعات القومية التي تؤثر بشكل إيجابي على الدخل القومي المصري. تتكون من فريق من المتفوقين الحريصين على تسليم المشاريع في الميزانية وفي الوقت المحدد.",
                about_en="Negida Contracting is a specialized contracting integrated services company primarily focused on all fields of construction, infrastructure, Roads, Marine works and Dredging. The company was established in 1987. Through more than 35 years of experience Negida contracting successfully and efficiently penetrated into the Egyptian booming contracting industry. The Company is undertaking a major role in the national projects that positively impact the Egyptian national income. It's made up of overachievers team who are keen to deliver the projects in budget and on time.",
                vision_ar="أن نكون الشريك الموثوق في بناء مستقبل مصر من خلال التميز في التنفيذ والابتكار في الحلول الهندسية.",
                vision_en="To be the trusted partner in building Egypt's future through excellence in execution and innovation in engineering solutions.",
                mission_ar="تحقيق رضا العملاء من خلال تقديم أعلى مستوى من الخدمات عالية الجودة بأسعار عادلة وتنافسية مع الالتزام الكامل بإجراءات السلامة (السلامة أولاً)، وذلك وفقاً للجدول الزمني المخطط والمراقب المحدد من قبل العميل.",
                mission_en="To achieve customer satisfaction by delivering the highest level of quality services at fair and highly competitive prices with full commitment to safety precautions (Safety First), all within the planned and monitored timeline set by the customer.",
                address="شارع نقابة الزراعيين، شارع شبين الكوم، الإسماعيلية، مصر",
                phone="+20 64 322 3385",
                email="info@negidacontracting.com",
                website="http://negidacontracting.com",
                logo_url="/uploads/negida_logo.png",
            ))
            await session.commit()
            logger.info("Default company profile seeded: Negida Contracting Co.")
    for event_key, event_name in ENGINEERING_EVENTS.items():
        event_bus.subscribe(event_name, handle_engineering_event)
    logger.info("EventBus subscribers registered for %d engineering events", len(ENGINEERING_EVENTS))
    logger.info("DB tables created, upload dir ready")
    yield


app = FastAPI(title="360 - Engineering Management System", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

from app.activities.api import router as activities_router
from app.notifications.api import router as notifications_router
from app.core.export_api import router as export_router
from app.core.search import router as search_router

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(activities_router)
app.include_router(notifications_router)
app.include_router(export_router)
app.include_router(search_router)

for mod_name in ENTITY_MODULES:
    try:
        mod = importlib.import_module(f"app.{mod_name}.api")
        app.include_router(mod.router)
        logger.info("Mounted router: %s", mod_name)
    except Exception as e:
        logger.warning("Could not mount %s: %s", mod_name, e)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


from fastapi.responses import FileResponse
from starlette.staticfiles import StaticFiles as StarletteStaticFiles

class SPAStaticFiles(StarletteStaticFiles):
    """Serves static files from dist/, falls back to index.html for SPA routes."""
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (HTTPException) as e:
            if e.status_code == 404:
                index_path = self.directory / "index.html"
                if index_path.exists():
                    return FileResponse(str(index_path))
            raise

base = Path(__file__).resolve().parent
for candidate in [base.parent.parent / "frontend" / "dist", base.parent / "frontend" / "dist"]:
    if candidate.is_dir():
        app.mount("/", SPAStaticFiles(directory=str(candidate), html=True), name="frontend")
        logger.info("Serving frontend from %s", candidate)
        break
else:
    logger.warning("Frontend dist not found (tried: %s, %s)", base.parent.parent / "frontend" / "dist", base.parent / "frontend" / "dist")
