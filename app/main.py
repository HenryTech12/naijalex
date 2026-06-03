from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import health, users, documents, risk_cards, whatsapp
from app import database
from app.services.knowledge_base import seed_knowledge_base
import time
import logging
import os

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("naijalex")

app = FastAPI(
    title="NaijaLex API",
    version="1.0.0",
    description="LLM-powered legal document understanding for Nigerian SMEs"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.2f}s")
    return response

# Routes
app.include_router(health.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(documents.chat_router, prefix="/api/v1")
app.include_router(risk_cards.router, prefix="/api/v1")
app.include_router(whatsapp.router, prefix="/api/v1")

# Static Files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup_event():
    # Ensure engine is usable (may fall back to sqlite on auth/connection errors)
    await database.ensure_engine()

    # Ensure tables exist
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)

    # Seed knowledge base
    seed_knowledge_base()

    logger.info("NaijaLex Backend Started Successfully")

@app.get("/")
async def root():
    return {"message": "Welcome to NaijaLex API", "version": "1.0.0"}
