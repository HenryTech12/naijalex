from fastapi import APIRouter
from sqlalchemy import text
from app.config import settings
from openai import AsyncOpenAI

# Import internals directly so the health endpoint can attempt its own
# connections and report errors instead of relying on FastAPI dependency
# resolution (which would convert dependency errors into 500 responses
# with less controlled output).
from app import database
from app.redis_client import redis_client

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    health = {"status": "ok", "db": "ok", "redis": "ok", "llm": "ok"}

    # Check DB by creating a short-lived session and executing a lightweight query
    try:
        async with database.async_session() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        health["db"] = "error"
        health["status"] = "error"
        # include minimal hint for debugging in logs but keep response small
        try:
            import logging
            logging.getLogger("naijalex").warning("Health DB check failed: %s", e)
        except Exception:
            pass

    # Check the local cache stub; no external Redis dependency in SQLite mode.
    try:
        await redis_client.ping()
    except Exception as e:
        health["redis"] = "error"
        health["status"] = "error"
        try:
            import logging
            logging.getLogger("naijalex").warning("Health Redis check failed: %s", e)
        except Exception:
            pass

    # Check LLM minimal: ensure API key is present
    try:
        if not settings.OPENAI_API_KEY:
            health["llm"] = "error"
    except Exception as e:
        health["llm"] = "error"
        try:
            import logging
            logging.getLogger("naijalex").warning("Health LLM check failed: %s", e)
        except Exception:
            pass

    return health
