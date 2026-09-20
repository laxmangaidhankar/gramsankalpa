from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import get_logger
from app.api.routes import health, villages, satellite, analysis, weather, scores, history, ai, recommendations, reports, farms
from app.services.gee.auth import initialize_gee

from app.services.village_service import load_villages

logger = get_logger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    gemini_ok = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != 'your_gemini_api_key_here')
    logger.info(f"Startup check: GEMINI_API_KEY configured={gemini_ok}")
    try:
        # Reloading villages from data folder.
        load_villages()
        initialize_gee()
    except Exception as e:
        logger.critical(f"CRITICAL: Failed to initialize Earth Engine on startup: {str(e)}")
    yield

app = FastAPI(title="GramSankalpa API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(health.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(satellite.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Welcome to GramSankalpa API"}