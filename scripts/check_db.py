import asyncio
import sys
import os
from pathlib import Path
from sqlalchemy.engine import make_url

# Ensure project root is on sys.path so `app` is importable when running this script
project_root = str(Path(__file__).resolve().parents[1])
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.config import settings

async def main():
    url = settings.DATABASE_URL
    # asyncpg expects a DSN like 'postgresql://...'. Convert SQLAlchemy-style
    # 'postgresql+asyncpg://' if present.
    if url.startswith("postgresql+asyncpg://"):
        dsn = url.replace("postgresql+asyncpg://", "postgresql://", 1)
    else:
        dsn = url
    # Ensure SSL mode for cloud Postgres if not already present
    if "sslmode" not in dsn.lower():
        if "?" in dsn:
            dsn = dsn + "&sslmode=require"
        else:
            dsn = dsn + "?sslmode=require"
    parsed = make_url(url)
    display = f"{parsed.username}@{parsed.host}:{parsed.port}/{parsed.database}"
    print(f"Testing DB connection to: {display} (password hidden)")
    try:
        import asyncpg
        conn = await asyncpg.connect(dsn=dsn)
        await conn.close()
        print("Connection successful.")
        return 0
    except Exception as e:
        # Provide actionable, non-sensitive hints
        typ = type(e).__name__
        msg = str(e)
        print(f"Connection failed: {typ}: {msg}")
        if typ == 'InvalidPasswordError' or 'password' in msg.lower():
            print("Hint: authentication failed — check username/password in .env")
        elif 'ssl' in msg.lower() or 'tls' in msg.lower():
            print("Hint: the server may require SSL/SSLmode parameters. Ensure your DATABASE_URL includes the required SSL settings.")
        elif 'refused' in msg.lower() or 'could not connect' in msg.lower():
            print("Hint: network/port issue — confirm host and port are reachable from this machine and not blocked by firewall.")
        else:
            print("Hint: inspect the full exception above or try connecting with psql/pgcli for more details.")
        return 2

if __name__ == '__main__':
    code = asyncio.run(main())
    sys.exit(code)
