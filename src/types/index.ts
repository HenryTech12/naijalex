export type Severity = 'Critical' | 'Caution' | 'Standard';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type LanguageMode = 'english' | 'pidgin';
export type ClauseAction = 'Accept' | 'Negotiate' | 'Remove' | 'Escalate';

export interface ClauseAnalysis {
  clause_id: string;
  title: string;
  original_text: string;
  plain_english: string;
  pidgin_explanation: string;
  severity: Severity;
  risk_type: string;
  legal_reference: string;
  financial_exposure?: number;
  action: ClauseAction;
  replacement_language?: string;
  urgency_rank: number;
  page_number?: number;
}

export interface AnalysisResult {
  id: string;
  document_id: string;
  created_at: string;
  language_mode: LanguageMode;
  clauses: ClauseAnalysis[];
  overall_risk: RiskLevel;
  summary: string;
  top_3_actions: string[];
  risk_card_url?: string;
  processing_time_ms: number;
  status: 'processing' | 'complete';
}

export interface UserProfile {
  id: string;
  business_type: string;
  industry: string;
  phone_number?: string;
}

export interface UploadResponse {
  analysis_id: string;
  status: string;
  estimated_seconds: number;
}
