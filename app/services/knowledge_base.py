import chromadb
from chromadb.utils import embedding_functions
import json
import os
from app.config import settings

# Initialize ChromaDB
client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-mpnet-base-v2"
)

def seed_knowledge_base():
    """Seed ChromaDB with Nigerian legal data if empty."""
    collections = [c.name for c in client.list_collections()]
    
    if "nigerian_clauses" not in collections:
        clause_col = client.create_collection(
            name="nigerian_clauses", 
            embedding_function=embedding_func
        )
        seed_path = "knowledge_base/seed_data/nigerian_clauses.json"
        if os.path.exists(seed_path):
            with open(seed_path, "r") as f:
                clauses = json.load(f)
                ids = [f"clause_{i}" for i in range(len(clauses))]
                documents = [c["common_wording"] for c in clauses]
                metadatas = [
                    {
                        "type": c["clause_type"],
                        "plain_english": c["plain_english"],
                        "risk_level": c["risk_level"],
                        "legal_ref": c["legal_reference"],
                        "action": c["recommended_action"]
                    } for c in clauses
                ]
                clause_col.add(ids=ids, documents=documents, metadatas=metadatas)

    if "nigerian_laws" not in collections:
        law_col = client.create_collection(
            name="nigerian_laws", 
            embedding_function=embedding_func
        )
        seed_path = "knowledge_base/seed_data/nigerian_laws.json"
        if os.path.exists(seed_path):
            with open(seed_path, "r") as f:
                laws = json.load(f)
                ids = [f"law_{i}" for i in range(len(laws))]
                documents = [l["summary"] for l in laws]
                metadatas = [
                    {
                        "name": l["law_name"],
                        "jurisdiction": l["jurisdiction"],
                        "provisions": ", ".join(l["key_provisions"])
                    } for l in laws
                ]
                law_col.add(ids=ids, documents=documents, metadatas=metadatas)

def search_relevant_clauses(document_text: str, top_k: int = 5):
    """Search for similar clauses in the knowledge base."""
    collection = client.get_collection(name="nigerian_clauses", embedding_function=embedding_func)
    results = collection.query(
        query_texts=[document_text[:1000]], # Chroma limits
        n_results=top_k
    )
    
    formatted = []
    if results["documents"]:
        for i in range(len(results["documents"][0])):
            formatted.append({
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i]
            })
    return formatted
