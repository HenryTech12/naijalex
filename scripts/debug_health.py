import asyncio
import traceback
import sys
from pathlib import Path

# Ensure project root is on sys.path when running as a script
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.routers.health import health_check
from app.database import async_session
from app.redis_client import redis_client

async def main():
    try:
        # Acquire a session from the sessionmaker
        async with async_session() as session:
            # Ensure redis client is ready (ping)
            try:
                await redis_client.ping()
            except Exception as e:
                print("Redis ping failed:", e)
                # still proceed to call handler to reproduce error

            result = await health_check(db=session, redis=redis_client)
            print("Health result:", result)
    except Exception as e:
        print("Health invocation raised an exception:")
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(main())
