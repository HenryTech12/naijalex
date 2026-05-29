import json
import re
from anthropic import AsyncAnthropic, APIStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.agents.state import DocumentAnalysisState
from app.agents.prompts import CONTEXT_AGENT_PROMPT

client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

def safe_parse_json(text: str) -> dict:
    """Strip markdown fences and safely parse JSON from LLM response."""
    # Remove ```json ... ``` or ``` ... ``` fences
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    text = text.rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object/array within the text
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return {}  # Return empty dict as safe fallback

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(APIStatusError)
)
async def call_claude(prompt: str, max_tokens: int) -> str:
    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text

async def context_agent_node(state: DocumentAnalysisState) -> dict:
    prompt = CONTEXT_AGENT_PROMPT.format(
        raw_text=state["raw_text"][:5000], # Limit context
        user_profile=state.get("user_context") or "Unknown"
    )
    
    response_text = await call_claude(prompt, 1000)
    data = safe_parse_json(response_text)
    
    return {
        "document_type": data.get("document_type", "other"),
        "jurisdiction": data.get("jurisdiction", "Unknown"),
        "governing_law": data.get("governing_law", "Unknown"),
        "estimated_value": data.get("estimated_value"),
        "requires_reprofiling": data.get("onboarding_questions") is not None
    }
