from redis.asyncio import Redis
import json
from typing import Optional

class SessionService:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def get_state(self, phone_number: str) -> str:
        state = await self.redis.get(f"state:{phone_number}")
        return state or "awaiting_document"

    async def set_state(self, phone_number: str, state: str):
        await self.redis.set(f"state:{phone_number}", state, ex=86400) # 24h

    async def save_context(self, phone_number: str, context: dict):
        await self.redis.set(f"context:{phone_number}", json.dumps(context), ex=86400)

    async def get_context(self, phone_number: str) -> Optional[dict]:
        data = await self.redis.get(f"context:{phone_number}")
        return json.loads(data) if data else None

    async def clear_context(self, phone_number: str):
        await self.redis.delete(f"state:{phone_number}")
        await self.redis.delete(f"context:{phone_number}")
