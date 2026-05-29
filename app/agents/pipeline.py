import time
from typing import Literal
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableConfig
from app.agents.state import DocumentAnalysisState
from app.agents.context_agent import context_agent_node
from app.agents.analyst_agent import analyst_agent_node
from app.agents.advisor_agent import advisor_agent_node
from app.database import async_session
from app.models.document import DocumentAnalysis
from sqlalchemy import select
import uuid

def check_confidence(state: DocumentAnalysisState) -> Literal["analyst_agent", "advisor_agent", "context_agent"]:
    if state.get("requires_reprofiling") and state.get("retry_count", 0) < 1:
        return "context_agent"
    if not state.get("clauses"):
        return "analyst_agent"
    return "advisor_agent"

async def save_results_node(state: DocumentAnalysisState) -> dict:
    async with async_session() as session:
        # Calculate processing time
        start_time = state.get("start_time", time.time())
        processing_time = int((time.time() - start_time) * 1000)
        
        analysis = DocumentAnalysis(
            id=uuid.uuid4(),
            document_id=uuid.UUID(state["document_id"]),
            language_mode=state["language_mode"],
            clauses=[c if isinstance(c, dict) else c.model_dump() for c in state["clauses"]],
            overall_risk=state["overall_risk"],
            summary=state["summary"],
            top_3_actions=state["top_3_actions"],
            processing_time_ms=processing_time
        )
        session.add(analysis)
        await session.commit()
        return {"document_analysis_id": str(analysis.id)}

def build_graph():
    builder = StateGraph(DocumentAnalysisState)
    
    builder.add_node("context_agent", context_agent_node)
    builder.add_node("analyst_agent", analyst_agent_node)
    builder.add_node("advisor_agent", advisor_agent_node)
    builder.add_node("save_results", save_results_node)
    
    builder.set_entry_point("context_agent")
    
    builder.add_edge("context_agent", "analyst_agent")
    
    builder.add_conditional_edges(
        "analyst_agent",
        check_confidence,
        {
            "context_agent": "context_agent",
            "analyst_agent": "analyst_agent",
            "advisor_agent": "advisor_agent"
        }
    )
    
    builder.add_edge("advisor_agent", "save_results")
    builder.add_edge("save_results", END)
    
    return builder.compile()

async def run_pipeline(document_id: str, user_id: str, raw_text: str, language_mode: str) -> dict:
    graph = build_graph()
    
    config = RunnableConfig(
        run_name="naijalex_pipeline",
        tags=["naijalex", language_mode],
        metadata={
            "document_id": document_id,
            "user_id": user_id,
            "language_mode": language_mode
        }
    )
    
    inputs = {
        "document_id": document_id,
        "user_id": user_id,
        "raw_text": raw_text,
        "language_mode": language_mode,
        "retry_count": 0,
        "start_time": time.time()
    }
    
    final_state = await graph.ainvoke(inputs, config=config)
    return final_state
