import asyncio
import sys
from pathlib import Path
project_root = str(Path(__file__).resolve().parents[1])
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from app.config import settings
import redis.asyncio as redis

async def main():
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await client.ping()
        print('Redis OK')
        return 0
    except Exception as e:
        print('Redis connection failed:', type(e).__name__, str(e))
        return 2

if __name__ == '__main__':
    code = asyncio.run(main())
    sys.exit(code)
