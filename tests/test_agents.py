import pytest
from app.agents.pipeline import run_pipeline
from app.models.user import UserProfile
from app.database import async_session
import uuid

@pytest.mark.asyncio
async def test_full_pipeline(db_session):
    # Setup test user
    user = UserProfile(id=uuid.uuid4(), business_type="Real Estate", industry="Agency", phone_number="+2348000000000")
    db_session.add(user)
    await db_session.commit()
    
    raw_text = """
    TENANCY AGREEMENT
    This agreement is made between Landlord and Tenant.
    1. The rent shall be 1,000,000 Naira per annum.
    2. This lease shall automatically renew for another year unless notice is given 90 days before expiration.
    3. The Tenant guarantees the payment personally.
    4. Late payments attract 10% monthly interest.
    """
    
    # Mock LLM response or actually run if API key is set
    # For hackathon tests, we usually mock or use a small model. 
    # Here we'll try to run if key exists, else skip.
    import os
    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("OPENAI_API_KEY not set")
        
    result = await run_pipeline(
        document_id=str(uuid.uuid4()),
        user_id=str(user.id),
        raw_text=raw_text,
        language_mode="pidgin"
    )
    
    assert "clauses" in result
    assert len(result["clauses"]) > 0
    assert result["overall_risk"] in ["High", "Medium", "Low"]
    assert "top_3_actions" in result
