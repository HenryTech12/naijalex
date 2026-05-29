from typing import TypedDict, Optional, Literal, List
from pydantic import BaseModel

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

class UserContext(BaseModel):
    user_id: str
    business_type: str
    industry: str
    risk_tolerance: str
    prior_document_types: List[str]

class DocumentAnalysisState(TypedDict):
    # inputs
    document_id: str
    user_id: str
    raw_text: str
    language_mode: Literal["english", "pidgin"]
    
    # populated by Context Agent
    user_context: Optional[UserContext]
    document_type: str
    jurisdiction: str
    governing_law: str
    estimated_value: Optional[int]
    
    # populated by Analyst Agent
    clauses: List[ClauseAnalysis]
    overall_risk: Literal["High", "Medium", "Low"]
    summary: str
    
    # populated by Advisor Agent
    top_3_actions: List[str]
    negotiation_package: str
    
    # control
    confidence_score: float
    requires_reprofiling: bool
    retry_count: int
    error: Optional[str]
