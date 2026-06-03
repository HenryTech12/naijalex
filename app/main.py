from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
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


class CORSErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled exception: {exc}", exc_info=True)
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response


app = FastAPI(
    title="NaijaLex API",
    version="1.0.0",
    description="LLM-powered legal document understanding for Nigerian SMEs"
)

app.add_middleware(CORSErrorMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.2f}s")
    return response

app.include_router(health.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(documents.chat_router, prefix="/api/v1")
app.include_router(risk_cards.router, prefix="/api/v1")
app.include_router(whatsapp.router, prefix="/api/v1")

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup_event():
    await database.ensure_engine()
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)
    seed_knowledge_base()
    logger.info("NaijaLex Backend Started Successfully")

@app.get("/")
async def root():
    return {"message": "Welcome to NaijaLex API", "version": "1.0.0"}