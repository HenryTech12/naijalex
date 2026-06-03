import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type {
  AnalysisResult,
  ChatRequest,
  ChatResponse,
  CreateUserRequest,
  DocumentHistoryItem,
  DocumentHistoryResponse,
  HealthResponse,
  LanguageMode,
  RiskCardResponse,
  UserProfile,
  WhatsAppWebhookPayload,
  AnalyzeDocumentResponse,
  ClauseAnalysis,
} from '../types';

export type ApiMode = 'live' | 'demo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://naijalex.quikdb.net';
const DEMO_STORE_KEY = 'naijalex_demo_store';
const MODE_KEY = 'naijalex_mode';

const AUTH_TOKEN_KEY = 'naijalex_auth_token';

const liveApi = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

liveApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem(AUTH_TOKEN_KEY)
    : null;
  // Only attach if token is a real non-empty string
  if (token && token !== 'null' && token !== 'undefined' && token.length > 0) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

liveApi.interceptors.response.use(
  (response) => {
    // Warn if a user-creation response is missing id
    if (response.config.url?.includes('/users/') && response.data && !response.data.id) {
      console.warn('[NaijaLex] User response missing id field:', response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('[NaijaLex] API error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

type DemoAnalysisRecord = AnalysisResult & {
  filename: string;
  readyAt: number;
};

interface DemoStore {
  users: Record<string, UserProfile>;
  analyses: Record<string, DemoAnalysisRecord>;
}

const defaultClauseTemplates: ClauseAnalysis[] = [
  {
    clause_id: 'c1',
    title: 'Auto-renewal and notice period',
    original_text:
      'This agreement automatically renews for successive terms unless either party gives 90 days written notice before expiration.',
    plain_english: 'The contract renews by itself unless you cancel in writing 90 days before it ends.',
    pidgin_explanation: 'Dis contract go renew by itself unless you write letter 90 days before e expire.',
    severity: 'Caution',
    risk_type: 'Renewal trap',
    legal_reference: 'Section 7.2',
    action: 'Negotiate',
    replacement_language:
      'This agreement will not renew automatically. Any renewal must be confirmed in writing by both parties at least 30 days before expiration.',
    urgency_rank: 1,
    page_number: 2,
  },
  {
    clause_id: 'c2',
    title: 'Liquidated damages',
    original_text:
      'The supplier shall pay liquidated damages of 25% of the total contract value for any delay beyond the delivery date.',
    plain_english: 'This clause creates a heavy penalty for late delivery.',
    pidgin_explanation: 'If delivery late, dem fit charge heavy penalty against supplier.',
    severity: 'Critical',
    risk_type: 'Penalty exposure',
    legal_reference: 'Section 10.4',
    financial_exposure: 4500000,
    action: 'Remove',
    replacement_language:
      'The supplier will use commercially reasonable efforts to meet agreed dates. Any delay penalties must be limited to direct losses actually proven.',
    urgency_rank: 2,
    page_number: 6,
  },
  {
    clause_id: 'c3',
    title: 'Termination for convenience',
    original_text:
      'Either party may terminate this agreement for convenience upon 30 days written notice.',
    plain_english: 'Either side can end the contract with 30 days notice.',
    pidgin_explanation: 'Any side fit end the contract with 30 days notice.',
    severity: 'Standard',
    risk_type: 'Exit flexibility',
    legal_reference: 'Section 12.1',
    action: 'Accept',
    urgency_rank: 3,
    page_number: 8,
  },
];

const demoAnswer = (question: string, analysis: AnalysisResult): string => {
  const riskyClause = (analysis.clauses ?? [])[0];  
  const prefix = analysis.language_mode === 'pidgin'
    ? 'Based on your analysis,'
    : 'Based on this analysis,';

  if (/change|rewrite|edit|clause/i.test(question)) {
    return analysis.language_mode === 'pidgin'
      ? `${prefix} I recommend shortening the notice window, limiting penalties to proven losses, and using the counter-language already suggested for ${riskyClause?.title ?? 'the risky clause'}.`
      : `${prefix} I recommend shortening the notice window, limiting penalties to proven losses, and using the suggested counter-language for ${riskyClause?.title ?? 'the risky clause'}.`;
  }

  return analysis.language_mode === 'pidgin'
  ? `${prefix} the biggest issue is ${riskyClause?.title ?? 'the first risky clause'}. You should focus on ${(analysis.top_3_actions ?? [])[0] ?? 'the top action'} first.`
  : `${prefix} the biggest issue is ${riskyClause?.title ?? 'the first risky clause'}. You should focus on ${(analysis.top_3_actions ?? [])[0] ?? 'the top action'} first.`;   
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
};

const safeWindow = () => (typeof window === 'undefined' ? null : window);

const getApiMode = (): ApiMode => {
  const storage = safeWindow();
  const mode = storage?.localStorage.getItem(MODE_KEY);
  return mode === 'demo' ? 'demo' : 'live';
};

const readDemoStore = (): DemoStore => {
  const storage = safeWindow();
  const raw = storage?.localStorage.getItem(DEMO_STORE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoStore;
    } catch (err) {
      console.warn('[NaijaLex] Corrupt demo store in localStorage, re-seeding:', err);
    }
  }

  const seedUserId = 'demo-user';
  const seedAnalysisId = 'demo-analysis-1';
  const seedAnalysis: DemoAnalysisRecord = {
    id: seedAnalysisId,
    document_id: 'demo-doc-1',
    user_id: seedUserId,
    filename: 'vendor-agreement.pdf',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    language_mode: 'english',
    clauses: defaultClauseTemplates,
    overall_risk: 'High',
    summary:
      'This agreement contains a renewal trap and a steep penalty clause that should be renegotiated before signing.',
    top_3_actions: [
      'Remove the excessive penalty clause.',
      'Shorten the notice period for renewal.',
      'Limit damages to direct losses only.',
    ],
    risk_card_url: 'https://example.com/demo-risk-card.pdf',
    processing_time_ms: 28100,
    status: 'complete',
    readyAt: Date.now() - 1000,
  };

  const seedStore: DemoStore = {
    users: {
      [seedUserId]: {
        id: seedUserId,
        phone_number: '+2348012345678',
        business_type: 'SME',
        industry: 'Retail/Trading',
        risk_tolerance: 'medium',
        typical_contracts: ['lease', 'supplier agreement'],
        created_at: seedAnalysis.created_at,
      },
    },
    analyses: {
      [seedAnalysisId]: seedAnalysis,
    },
  };

  storage?.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(seedStore));
  return seedStore;
};

const saveDemoStore = (store: DemoStore) => {
  const storage = safeWindow();
  storage?.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
};

const toHistoryItem = (analysis: DemoAnalysisRecord): DocumentHistoryItem => ({
  analysis_id: analysis.id,
  user_id: analysis.user_id ?? 'demo-user',
  filename: analysis.filename,
  created_at: analysis.created_at,
  overall_risk: analysis.overall_risk,
  summary: analysis.summary,
  language_mode: analysis.language_mode,
  processing_time_ms: analysis.processing_time_ms,
  status: analysis.status,
});

const maybeCompleteDemoAnalysis = (analysis: DemoAnalysisRecord): DemoAnalysisRecord => {
  if (analysis.status !== 'processing') {
    return analysis;
  }

  if (Date.now() < analysis.readyAt) {
    return analysis;
  }

  const completeAnalysis: DemoAnalysisRecord = {
    ...analysis,
    status: 'complete',
    risk_card_url: analysis.risk_card_url || 'https://example.com/demo-risk-card.pdf',
  };

  const store = readDemoStore();
  store.analyses[analysis.id] = completeAnalysis;
  saveDemoStore(store);
  return completeAnalysis;
};

const demoHealth = (): HealthResponse => ({
  status: 'ok',
  db: 'demo',
  redis: 'demo',
  llm: 'demo',
});

const demoCreateUser = (data: CreateUserRequest): UserProfile => {
  const store = readDemoStore();
  const id = createId();
  const user: UserProfile = {
    id,
    phone_number: data.phone_number,
    business_type: data.business_type,
    industry: data.industry,
    risk_tolerance: data.risk_tolerance,
    typical_contracts: data.typical_contracts,
    created_at: new Date().toISOString(),
  };
  store.users[id] = user;
  saveDemoStore(store);
  return user;
};

const demoGetUserProfile = (userId: string): UserProfile => {
  const store = readDemoStore();
  const existing = store.users[userId];
  if (existing) return existing;

  const fallback: UserProfile = {
    id: userId,
    phone_number: '+2348012345678',
    business_type: 'SME',
    industry: 'Retail/Trading',
    risk_tolerance: 'medium',
    typical_contracts: ['supplier agreement'],
    created_at: new Date().toISOString(),
  };
  store.users[userId] = fallback;
  saveDemoStore(store);
  return fallback;
};

const demoAnalyzeDocument = (file: File, userId: string, languageMode: LanguageMode): AnalyzeDocumentResponse => {
  const store = readDemoStore();
  const id = createId();
  const summary =
    file.name.toLowerCase().includes('lease') || file.name.toLowerCase().includes('rent')
      ? 'This contract includes rent escalation and renewal terms that should be reviewed carefully.'
      : 'This contract contains a renewal trap and an aggressive penalty clause that should be renegotiated.';

  const analysis: DemoAnalysisRecord = {
    id,
    document_id: createId(),
    user_id: userId,
    filename: file.name,
    created_at: new Date().toISOString(),
    language_mode: languageMode,
    clauses: defaultClauseTemplates.map((clause) => ({
      ...clause,
      plain_english:
        languageMode === 'pidgin'
          ? `${clause.plain_english} (Pidgin preview available in detail view.)`
          : clause.plain_english,
    })),
    overall_risk: file.name.toLowerCase().includes('nda') ? 'Medium' : 'High',
    summary,
    top_3_actions: [
      'Review the renewal window before signing.',
      'Limit penalties to direct losses only.',
      'Keep a copy of the negotiation draft for legal review.',
    ],
    risk_card_url: null,
    processing_time_ms: 32000,
    status: 'processing',
    readyAt: Date.now() + 1800,
  };

  store.analyses[id] = analysis;
  if (!store.users[userId]) {
    store.users[userId] = {
      id: userId,
      phone_number: '+2348012345678',
      business_type: 'SME',
      industry: 'Retail/Trading',
      risk_tolerance: 'medium',
      typical_contracts: ['supplier agreement'],
      created_at: new Date().toISOString(),
    };
  }
  saveDemoStore(store);

  return {
    analysis_id: id,
    status: 'processing',
    estimated_seconds: 18,
  };
};

const demoGetAnalysis = (analysisId: string): AnalysisResult => {
  const store = readDemoStore();
  const analysis = store.analyses[analysisId];
  if (!analysis) {
    throw new Error('Analysis not found in demo mode.');
  }
  return maybeCompleteDemoAnalysis(analysis);
};

const demoGetHistory = (userId: string): DocumentHistoryResponse => {
  const store = readDemoStore();
  const items = Object.values(store.analyses)
    .filter((analysis) => analysis.user_id === userId)
    .map((analysis) => toHistoryItem(maybeCompleteDemoAnalysis(analysis)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { items };
};

const demoGetHistoryDetail = (userId: string, analysisId: string): AnalysisResult => {
  const analysis = demoGetAnalysis(analysisId);
  if (analysis.user_id && analysis.user_id !== userId) {
    throw new Error('Analysis does not belong to this user in demo mode.');
  }
  return analysis;
};

const demoGetRiskCard = (analysisId: string): RiskCardResponse => ({
  analysis_id: analysisId,
  risk_card_url: 'https://example.com/demo-risk-card.pdf',
});

const demoSendChatQuestion = (analysisId: string, payload: ChatRequest): ChatResponse => {
  const analysis = demoGetAnalysis(analysisId);
  return {
    answer: demoAnswer(payload.question, analysis),
  };
};

async function requestWithFallback<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await liveApi.request<T>({ url: path, ...(config || {}) });
    return response.data;
  } catch (error) {
    console.error(`[NaijaLex] API request failed: ${config?.method ?? 'GET'} ${path}`, error);
    throw error;
  }
}

const isDemo = (mode?: ApiMode): boolean => (mode ?? getApiMode()) === 'demo';

const getConfiguredMode = (mode?: ApiMode): ApiMode => mode ?? getApiMode();

export const getHealth = async (mode?: ApiMode): Promise<HealthResponse> => {
  if (isDemo(mode)) return demoHealth();
  return requestWithFallback<HealthResponse>('/api/v1/health', { method: 'GET' });
};

export const createUser = async (data: CreateUserRequest, mode?: ApiMode): Promise<UserProfile> => {
  if (isDemo(mode)) return demoCreateUser(data);
  return requestWithFallback<UserProfile>('/api/v1/users/', { method: 'POST', data });
};

export const getUserProfile = async (userId: string, mode?: ApiMode): Promise<UserProfile> => {
  if (isDemo(mode)) return demoGetUserProfile(userId);
  return requestWithFallback<UserProfile>(`/api/v1/users/${userId}/profile`, { method: 'GET' });
};

export const analyzeDocument = async (
  file: File,
  userId: string,
  languageMode: LanguageMode,
  mode?: ApiMode
): Promise<AnalyzeDocumentResponse> => {
  if (isDemo(mode)) return demoAnalyzeDocument(file, userId, languageMode);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('language_mode', languageMode);

  return requestWithFallback<AnalyzeDocumentResponse>('/api/v1/documents/analyze', {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAnalysis = async (analysisId: string, mode?: ApiMode): Promise<AnalysisResult> => {
  if (isDemo(mode)) return demoGetAnalysis(analysisId);
  return requestWithFallback<AnalysisResult>(`/api/v1/documents/analysis/${analysisId}`, {
    method: 'GET',
  });
};

export const getAnalysisHistory = async (userId: string, mode?: ApiMode): Promise<DocumentHistoryResponse> => {
  if (isDemo(mode)) return demoGetHistory(userId);
  return requestWithFallback<DocumentHistoryResponse>(`/api/v1/documents/history/${userId}`, {
    method: 'GET',
  });
};

export const getSavedAnalysis = async (
  userId: string,
  analysisId: string,
  mode?: ApiMode
): Promise<AnalysisResult> => {
  if (isDemo(mode)) return demoGetHistoryDetail(userId, analysisId);
  return requestWithFallback<AnalysisResult>(`/api/v1/documents/history/${userId}/${analysisId}`, {
    method: 'GET',
  });
};

export const sendChatQuestion = async (
  analysisId: string,
  question: string,
  languageMode: LanguageMode,
  mode?: ApiMode
): Promise<ChatResponse> => {
  if (isDemo(mode)) return demoSendChatQuestion(analysisId, { question, language_mode: languageMode });

  const payload: ChatRequest = { question, language_mode: languageMode };
  try {
    return await requestWithFallback<ChatResponse>(`/api/v1/chat/${analysisId}`, {
      method: 'POST',
      data: payload,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return requestWithFallback<ChatResponse>(`/api/v1/documents/chat/${analysisId}`, {
        method: 'POST',
        data: payload,
      });
    }
    throw error;
  }
};

export const getRiskCard = async (
  analysisId: string,
  options?: { refresh?: boolean; redirect?: boolean },
  mode?: ApiMode
): Promise<RiskCardResponse> => {
  if (isDemo(mode)) return demoGetRiskCard(analysisId);

  const params = new URLSearchParams();
  if (options?.refresh) params.append('refresh', 'true');
  if (options?.redirect) params.append('redirect', 'true');

  const queryString = params.toString();
  const url = `/api/v1/risk-card/${analysisId}${queryString ? `?${queryString}` : ''}`;

  return requestWithFallback<RiskCardResponse>(url, { method: 'GET' });
};

export const getRiskCardUrl = (
  analysisId: string,
  options?: { refresh?: boolean; redirect?: boolean },
  mode?: ApiMode
): string => {
  if (isDemo(mode)) {
    return 'https://example.com/demo-risk-card.pdf';
  }

  const params = new URLSearchParams();
  if (options?.refresh) params.append('refresh', 'true');
  if (options?.redirect) params.append('redirect', 'true');
  return `${API_BASE}/api/v1/risk-card/${analysisId}${params.toString() ? `?${params}` : ''}`;
};

export const sendWhatsAppWebhook = async (
  data: WhatsAppWebhookPayload,
  mode?: ApiMode
): Promise<{ success: boolean }> => {
  if (isDemo(mode)) return { success: true };

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  return requestWithFallback<{ success: boolean }>('/api/v1/webhook/whatsapp', {
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

interface ApiErrorData {
  detail?: unknown;
  message?: unknown;
}

const friendlyStatusMessage = (status?: number): string | null => {
  if (!status) return null;
  if (status === 404) return 'We could not find that resource. Check the ID and try again.';
  if (status === 422) return 'The request data is incomplete or invalid. Review the fields and try again.';
  if (status >= 500) return 'The server encountered an issue. Please try again in a moment.';
  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const statusMessage = friendlyStatusMessage(error.response?.status);
    if (statusMessage) return statusMessage;

    const data = error.response?.data as ApiErrorData | undefined;
    if (data && data.detail) {
      return String(data.detail);
    }
    if (data && data.message) {
      return String(data.message);
    }
    const errorWithMessage = error as { message?: unknown };
    if (typeof errorWithMessage.message === 'string') {
      return errorWithMessage.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};

export const getCurrentApiMode = getApiMode;

export { API_BASE, liveApi as api, getConfiguredMode };
export default liveApi;