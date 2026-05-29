from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Literal

class ClauseAnalysis(BaseModel):
    clause_id: str
    title: str
    original_text: str
    plain_english: str
    pidgin_explanation: str
    severity: Literal["Critical", "Caution", "Standard"]
    risk_type: str
    legal_reference: str
    financial_exposure: Optional[int] = None
    action: Literal["Accept", "Negotiate", "Remove", "Escalate"]
    replacement_language: Optional[str] = None
    urgency_rank: int
    page_number: Optional[int] = None

class DocumentAnalysisResponse(BaseModel):
    id: UUID
    document_id: UUID
    created_at: datetime
    language_mode: Literal["english", "pidgin"]
    clauses: List[ClauseAnalysis]
    overall_risk: Literal["High", "Medium", "Low"]
    summary: str
    top_3_actions: List[str]
    risk_card_url: Optional[str] = None
    processing_time_ms: int

    model_config = ConfigDict(from_attributes=True)

class AnalysisRequest(BaseModel):
    user_id: str
    language_mode: Literal["english", "pidgin"] = "english"
