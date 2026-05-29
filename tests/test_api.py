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
