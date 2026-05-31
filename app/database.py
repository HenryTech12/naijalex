from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import ssl
from app.config import settings


# Prepare the DB URL and connect_args for asyncpg.
# If the URL contains `sslmode` in its query (common with cloud providers),
# asyncpg.connect does not accept an `sslmode` kwarg — it expects an `ssl`
# parameter or SSLContext. Convert `sslmode=require` into `ssl=True` and
# remove it from the URL so SQLAlchemy doesn't forward it as a keyword.
def _prepare_db_url_and_connect_args(db_url: str):
    parsed = urlparse(db_url)
    if parsed.scheme.startswith("sqlite"):
        return db_url, {}

    qs = parse_qs(parsed.query)
    sslmode = None
    if "sslmode" in qs:
        sslmode = qs.pop("sslmode")[0]

    # Rebuild query string without sslmode
    if qs:
        new_query = urlencode({k: v[0] for k, v in qs.items()})
    else:
        new_query = ""

    cleaned = parsed._replace(query=new_query)
    clean_url = urlunparse(cleaned)

    connect_args = {}
    if sslmode and sslmode.lower() in ("require", "true", "1"):
        # Build an SSLContext for asyncpg. Respect the DB_SSL_VERIFY setting.
        if settings.DB_SSL_VERIFY:
            ctx = ssl.create_default_context()
        else:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ctx

    return clean_url, connect_args


# Create engine eagerly; connection may still fail later when the app starts.
db_url, db_connect_args = _prepare_db_url_and_connect_args(settings.DATABASE_URL)
engine = create_async_engine(db_url, echo=False, connect_args=db_connect_args)

# Session factory (may be replaced at runtime by ensure_engine())
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session


async def ensure_engine():
    """Ensure the configured engine is usable. On failure we do NOT
    automatically fall back to an alternate database — the application will
    raise so the misconfiguration is visible and can be corrected.
    """
    try:
        # Try a short-lived transactional begin to validate connectivity.
        async with engine.begin() as conn:
            pass
        return
    except Exception as e:
        logging.error("Database connection failed and fallbacks are disabled: %s", e)
        # Re-raise to stop application startup
        raise
