import json
import re
from anthropic import AsyncAnthropic, APIStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.agents.state import DocumentAnalysisState
from app.agents.prompts import ADVISOR_AGENT_PROMPT

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

async def advisor_agent_node(state: DocumentAnalysisState) -> dict:
    flagged = [c for c in state["clauses"] if c["severity"] in ["Critical", "Caution"]]
    
    if not flagged:
        return {
            "clauses": state["clauses"],
            "top_3_actions": ["Your contract looks relatively clean. Still review with a lawyer before signing."],
            "negotiation_package": ""
        }
    
    user_ctx = state.get("user_context")
    business_type = getattr(user_ctx, "business_type", None) or "SME"
    industry = getattr(user_ctx, "industry", None) or "General"

    prompt = ADVISOR_AGENT_PROMPT.format(
        language_mode=state["language_mode"],
        flagged_clauses=json.dumps(flagged, indent=2),
        business_type=business_type,
        industry=industry
    )
    
    response_text = await call_claude(prompt, 4000)
    data = safe_parse_json(response_text)
    
    # Merge replacements back into clauses
    updated_clauses = state["clauses"]
    replacements = {u["clause_id"]: u for u in data.get("updated_clauses", [])}
    
    for c in updated_clauses:
        if c["clause_id"] in replacements:
            c["replacement_language"] = replacements[c["clause_id"]].get("replacement_language")
            
    return {
        "clauses": updated_clauses,
        "top_3_actions": data.get("top_3_actions", ["Review contract with a lawyer before signing"]),
        "negotiation_package": data.get("negotiation_package", "")
    }
