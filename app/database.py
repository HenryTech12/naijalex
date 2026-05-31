from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import logging

# Try to create the async engine using the configured DATABASE_URL.
# If the async DB driver (e.g. asyncpg) is not installed on the host
# (common on Windows when build tools are missing), fall back to a
# lightweight sqlite+aiosqlite engine so the app can still start.
try:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
except ModuleNotFoundError as e:
    logging.warning(
        "Database driver not found (%s). Falling back to sqlite+aiosqlite for local dev.\n"
        "To use PostgreSQL, install the appropriate DB driver (e.g. asyncpg) or fix your environment.",
        e,
    )
    # Use a file-based sqlite DB so state persists across runs (use :memory: if you prefer ephemeral)
    engine = create_async_engine("sqlite+aiosqlite:///./naijalex_fallback.db", echo=False)

async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
