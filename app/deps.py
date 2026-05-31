from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from app.database import async_session
from app.redis_client import get_redis as _get_redis


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def get_redis() -> Redis:
    """Return a Redis client. Uses the module-level fallback which will provide
    an in-memory stub when a real Redis server is unavailable (useful for tests
    and local development).
    """
    return await _get_redis()
