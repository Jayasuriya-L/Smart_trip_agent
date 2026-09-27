import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.routers import chat_router, trips_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("smarttrip")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SmartTrip AI Backend...")
    try:
        await create_tables()
        logger.info("Database tables verified.")
    except Exception as e:
        logger.warning(f"Could not auto-create tables on startup (DB might be offline): {e}")
    yield
    logger.info("Shutting down SmartTrip AI Backend...")


app = FastAPI(
    title="SmartTrip AI Backend API",
    description="Python FastAPI backend powered by Groq LLM and PostgreSQL for AI travel planning.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat_router)
app.include_router(trips_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SmartTrip AI Backend",
        "environment": settings.app_env,
    }
