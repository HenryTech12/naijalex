import json
from typing import Any, Optional


class InMemoryRedis:
    def __init__(self):
        self._store: dict[str, tuple[Any, Optional[float]]] = {}

    async def ping(self):
        return True

    async def get(self, key: str):
        value = self._store.get(key)
        if not value:
            return None
        return value[0]

    async def set(self, key: str, value, ex: Optional[int] = None):
        self._store[key] = (value, None)
        return True

    async def delete(self, *keys: str):
        removed = 0
        for key in keys:
            if key in self._store:
                del self._store[key]
                removed += 1
        return removed


redis_client = InMemoryRedis()


async def get_redis():
    return redis_client
