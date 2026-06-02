import pytest
import asyncio
import os

# Set environment variables for testing BEFORE importing the app
os.environ["OPENAI_API_KEY"] = "sk-test-key"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["REDIS_URL"] = "redis://localhost:6379/1"
os.environ["LANGCHAIN_API_KEY"] = "test"

import sys
import types

# Stub heavy external libs to avoid import errors during tests
for mod in ("pdfplumber", "docx", "pytesseract", "pdf2image", "PIL", "pdf2image.pdfinfo", "PIL.Image"):
    if mod not in sys.modules:
        sys.modules[mod] = types.ModuleType(mod)

# Provide commonly-used attributes to the stubbed modules
sys.modules["pdf2image"].convert_from_path = lambda *args, **kwargs: []
sys.modules["docx"].Document = lambda *args, **kwargs: types.SimpleNamespace(paragraphs=[], tables=[])
sys.modules["pytesseract"].image_to_string = lambda *args, **kwargs: ""
sys.modules["PIL"].Image = types.SimpleNamespace()

from httpx import AsyncClient
from app.main import app
from app.database import Base, engine, async_session
from sqlalchemy import text

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def db_setup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def db_session():
    async with async_session() as session:
        yield session
