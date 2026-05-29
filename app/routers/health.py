from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.database import AsyncSession
from app.deps import get_db, get_redis
from redis.asyncio import Redis
from app.config import settings
from anthropic import AsyncAnthropic

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check(
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    health = {"status": "ok", "db": "ok", "redis": "ok", "llm": "ok"}
    
    # Check DB
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        health["db"] = "error"
        health["status"] = "error"
        
    # Check Redis
    try:
        await redis.ping()
    except Exception:
        health["redis"] = "error"
        health["status"] = "error"
        
    # Check LLM (minimal test)
    try:
        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        # We won't actually call it to save credits, just check key
        if not settings.ANTHROPIC_API_KEY:
            health["llm"] = "error"
    except Exception:
        health["llm"] = "error"
        
    return health
