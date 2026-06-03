// API Types matching backend schemas

export type Severity = 'Critical' | 'Caution' | 'Standard';
export type RiskLevel = 'High' | 'Medium' | 'Low';
export type LanguageMode = 'english' | 'pidgin';
export type ClauseAction = 'Accept' | 'Negotiate' | 'Remove' | 'Escalate';

// Health Check
export interface HealthResponse {
  status: string;
  db: string;
  redis: string;
  llm: string;
}

// User
export interface CreateUserRequest {
  phone_number: string;
  business_type: string;
  industry: string;
  risk_tolerance?: 'low' | 'medium' | 'high';
  typical_contracts?: string[];
}

export interface UserProfile {
  id: string;
  phone_number: string;
  business_type: string;
  industry: string;
  risk_tolerance?: string;
  typical_contracts?: string[];
  created_at?: string;
}

// Document Analysis
export interface AnalyzeDocumentRequest {
  file: File;
  user_id: string;
  language_mode: LanguageMode;
}

export interface AnalyzeDocumentResponse {
  analysis_id: string;
  status: string;
  estimated_seconds: number;
}

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
  user_id?: string;
  filename?: string;
  created_at: string;
  language_mode: LanguageMode;
  clauses: ClauseAnalysis[];
  overall_risk: RiskLevel;
  summary: string;
  top_3_actions: string[];
  risk_card_url: string | null;
  processing_time_ms: number;
  status: 'processing' | 'complete' | 'failed';
}

export interface DocumentHistoryItem {
  analysis_id: string;
  user_id: string;
  filename: string;
  created_at: string;
  overall_risk: RiskLevel;
  summary: string;
  language_mode: LanguageMode;
  processing_time_ms: number;
  status: 'processing' | 'complete' | 'failed';
}

export interface DocumentHistoryResponse {
  items: DocumentHistoryItem[];
}

export interface ChatRequest {
  question: string;
  language_mode: LanguageMode;
}

export interface ChatResponse {
  answer: string;
}

// Risk Card
export interface RiskCardResponse {
  analysis_id: string;
  risk_card_url: string;
}

// WhatsApp Webhook
export interface WhatsAppWebhookPayload {
  SmsMessageSid: string;
  NumMedia: string;
  ProfileName: string;
  MessageType: string;
  From: string;
  To: string;
  Body: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

// API Explorer Types
export interface EndpointConfig {
  id: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  name: string;
  description: string;
  requestType?: string;
  responseType?: string;
  hasBody: boolean;
  hasFormData: boolean;
  pathParams: string[];
  queryParams: string[];
  sampleRequest?: unknown;
  sampleResponse?: unknown;
}

// Flow State
export interface FlowState {
  userId: string | null;
  businessLabel: string | null;
  analysisRequestId: string | null;
  analysisId: string | null;
  riskCardUrl: string | null;
}
