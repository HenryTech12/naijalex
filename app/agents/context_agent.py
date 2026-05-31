import json
import re
from openai import AsyncOpenAI, APIStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.agents.state import DocumentAnalysisState
from app.agents.prompts import CONTEXT_AGENT_PROMPT

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

def safe_parse_json(text: str) -> dict:
    """Strip markdown fences and safely parse JSON from LLM response."""
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {}

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(APIStatusError)
)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(APIStatusError)
)
async def call_openai(prompt: str, max_tokens: int) -> str:
    # During tests we use a fake API key and return canned responses to avoid network calls
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-test"):
        # Minimal context extraction
        return json.dumps({
            "document_type": "tenancy_agreement",
            "jurisdiction": "Nigeria",
            "governing_law": "Nigerian Law",
            "estimated_value": 1000000,
            "onboarding_questions": None
        })

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

async def context_agent_node(state: DocumentAnalysisState) -> dict:
    prompt = CONTEXT_AGENT_PROMPT.format(
        raw_text=state["raw_text"][:5000], # Limit context
        user_profile=state.get("user_context") or "Unknown"
    )
    
    response_text = await call_openai(prompt, 1000)
    data = safe_parse_json(response_text)
    
    return {
        "document_type": data.get("document_type", "other"),
        "jurisdiction": data.get("jurisdiction", "Unknown"),
        "governing_law": data.get("governing_law", "Unknown"),
        "estimated_value": data.get("estimated_value"),
        "requires_reprofiling": data.get("onboarding_questions") is not None
    }
