import logging
import redis.asyncio as redis
from app.config import settings
from redis.exceptions import RedisError
import logging
import redis.asyncio as redis
from app.config import settings


# Create the redis client from the configured URL. We deliberately do not
# provide an automatic in-memory fallback — configuration must point to a
# working Redis instance for the application to start.
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_redis():
    """Return the configured Redis client. If the client cannot be reached
    the exception will propagate so the application fails fast and the
    misconfiguration is visible immediately.
    """
    # Perform a quick ping to trigger connection/auth errors early
    await redis_client.ping()
    return redis_client
