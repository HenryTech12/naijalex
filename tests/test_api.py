import pytest
import uuid

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] in ["ok", "error"]

@pytest.mark.asyncio
async def test_user_creation(client):
    user_data = {
        "phone_number": "+2348123456789",
        "business_type": "Retail",
        "industry": "Fashion"
    }
    response = await client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["phone_number"] == user_data["phone_number"]
    assert "id" in data

@pytest.mark.asyncio
async def test_document_analyze_endpoint(client):
    # 1. Create user
    user_resp = await client.post("/api/v1/users/", json={"business_type": "Tech"})
    user_id = user_resp.json()["id"]
    
    # 2. Upload file
    files = {'file': ('test.txt', b'Simple contract text', 'text/plain')}
    data = {'user_id': user_id, 'language_mode': 'english'}
    
    response = await client.post("/api/v1/documents/analyze", files=files, data=data)
    assert response.status_code == 200
    assert response.json()["status"] == "processing"
    assert "analysis_id" in response.json()


@pytest.mark.asyncio
async def test_chat_about_document(client, db_session, monkeypatch):
    # 1. Create user
    user_resp = await client.post("/api/v1/users/", json={"business_type": "Test"})
    user_id = user_resp.json()["id"]

    # 2. Insert Document and DocumentAnalysis directly
    import uuid as _uuid
    from app.models.document import Document, DocumentAnalysis

    doc_id = _uuid.uuid4()
    analysis_id = _uuid.uuid4()

    doc = Document(
        id=doc_id,
        user_id=_uuid.UUID(user_id),
        filename="test.txt",
        file_path="/tmp/test.txt",
        file_type="text/plain",
        raw_text="Sample contract",
        ocr_used=False
    )

    analysis = DocumentAnalysis(
        id=analysis_id,
        document_id=doc_id,
        language_mode="english",
        clauses=[{"clause": "sample"}],
        overall_risk="low",
        summary="A short summary",
        top_3_actions=["action1", "action2"],
        processing_time_ms=123
    )

    db_session.add_all([doc, analysis])
    await db_session.commit()

    # 3. Monkeypatch OpenAI AsyncOpenAI to avoid external call
    import types
    from types import SimpleNamespace

    class DummyCompletions:
        async def create(self, *args, **kwargs):
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="Stubbed answer"))])

    class DummyChat:
        def __init__(self):
            self.completions = DummyCompletions()

    class DummyAsyncOpenAI:
        def __init__(self, api_key=None):
            self.chat = DummyChat()

    monkeypatch.setattr("openai.AsyncOpenAI", DummyAsyncOpenAI)

    # 4. Call chat endpoint
    payload = {"question": "What does the clause mean?", "language_mode": "english"}
    res = await client.post(f"/api/v1/documents/chat/{analysis_id}", json=payload)
    assert res.status_code == 200
    assert res.json()["answer"] == "Stubbed answer"
