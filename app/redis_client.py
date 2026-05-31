import logging
import redis.asyncio as redis
from app.config import settings
from redis.exceptions import RedisError

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


class _InMemoryRedis:
    """A tiny async in-memory Redis-like stub used for tests/local dev when a real
    Redis server is unavailable. Implements the subset of async methods used by
    the application: get, set, delete, ping.
    """
    def __init__(self):
        self.store = {}

    async def get(self, key):
        return self.store.get(key)

    async def set(self, key, value, ex=None):
        # ignore expiration in this stub
        self.store[key] = value
        return True

    async def delete(self, key):
        return self.store.pop(key, None) is not None

    async def ping(self):
        return True


async def get_redis():
    """Return a usable async redis client. If the configured Redis server cannot
    be reached (common in local dev without Redis running), fall back to an
    in-memory stub so routes and tests can run without an external Redis.
    """
    try:
        # Try a quick ping to detect unreachable Redis
        await redis_client.ping()
        return redis_client
    except RedisError as e:
        logging.warning("Redis unavailable (%s). Using in-memory fallback.", e)
        return _InMemoryRedis()
