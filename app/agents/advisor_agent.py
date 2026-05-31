import json
import re
from openai import AsyncOpenAI, APIStatusError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.agents.state import DocumentAnalysisState
from app.agents.prompts import ADVISOR_AGENT_PROMPT

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
async def call_openai(prompt: str, max_tokens: int) -> str:
    # Return canned advisor output during tests to avoid network
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-test"):
        return json.dumps({
            "updated_clauses": [
                {"clause_id": "c1", "replacement_language": "No late fees beyond reasonable limit."}
            ],
            "top_3_actions": ["Negotiate late fee", "Clarify renewal terms", "Get lawyer review"],
            "negotiation_package": "Sample negotiation text"
        })

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

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
    
    response_text = await call_openai(prompt, 4000)
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
