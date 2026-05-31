import json
import os
import re
from functools import lru_cache
from pathlib import Path

from app.config import settings

_SEED_DIR = Path(__file__).resolve().parents[2] / "knowledge_base" / "seed_data"


@lru_cache(maxsize=1)
def _load_seed_file(filename: str) -> list[dict]:
    path = _SEED_DIR / filename
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z0-9_']+", text.lower()))


def seed_knowledge_base():
    """Keep the knowledge base seed files available.

    The app now reads directly from the JSON seed files at query time, so no
    startup-time vector database initialization is required.
    """
    os.makedirs(_SEED_DIR, exist_ok=True)
    return None


def _score_candidate(document_tokens: set[str], candidate_text: str) -> int:
    candidate_tokens = _tokenize(candidate_text)
    return len(document_tokens & candidate_tokens)


def search_relevant_clauses(document_text: str, top_k: int = 5):
    """Return the most relevant clauses using simple token overlap.

    This keeps startup lightweight and avoids external ML/vector database
    dependencies during deployment.
    """
    clauses = _load_seed_file("nigerian_clauses.json")
    if not clauses:
        return []

    document_tokens = _tokenize(document_text)
    scored = []
    for clause in clauses:
        text = clause.get("common_wording", "")
        score = _score_candidate(document_tokens, text)
        if score > 0:
            scored.append((score, clause))

    scored.sort(key=lambda item: item[0], reverse=True)
    results = []
    for _, clause in scored[:top_k]:
        results.append(
            {
                "text": clause.get("common_wording", ""),
                "metadata": {
                    "type": clause.get("clause_type"),
                    "plain_english": clause.get("plain_english"),
                    "risk_level": clause.get("risk_level"),
                    "legal_ref": clause.get("legal_reference"),
                    "action": clause.get("recommended_action"),
                },
            }
        )
    return results
