import json
import re
from anthropic import AsyncAnthropic, APIStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.agents.state import DocumentAnalysisState
from app.agents.prompts import ANALYST_AGENT_PROMPT
from app.services.knowledge_base import search_relevant_clauses

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

async def analyst_agent_node(state: DocumentAnalysisState) -> dict:
    # 1. Search KB
    relevant = search_relevant_clauses(state["raw_text"])
    relevant_str = json.dumps(relevant, indent=2)
    
    # 2. Call LLM
    prompt = ANALYST_AGENT_PROMPT.format(
        document_type=state["document_type"],
        jurisdiction=state["jurisdiction"],
        governing_law=state["governing_law"],
        relevant_clauses=relevant_str,
        raw_text=state["raw_text"][:15000] # Claude can handle more
    )
    
    response_text = await call_claude(prompt, 8000)
    data = safe_parse_json(response_text)
    
    # Defaults for analyst_agent
    clauses = data.get("clauses", [])
    overall_risk = data.get("overall_risk", "Medium")
    summary = data.get("summary", "Analysis incomplete")
    confidence_score = data.get("confidence_score", 1.0)
    
    return {
        "clauses": clauses,
        "overall_risk": overall_risk,
        "summary": summary,
        "confidence_score": confidence_score,
        "requires_reprofiling": confidence_score < 0.7
    }
