import axios, { AxiosError } from 'axios';
import type {
  HealthResponse,
  CreateUserRequest,
  UserProfile,
  AnalyzeDocumentResponse,
  AnalysisResult,
  RiskCardResponse,
  WhatsAppWebhookPayload,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// Health
export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/api/v1/health');
  return response.data;
};

// Users
export const createUser = async (data: CreateUserRequest): Promise<UserProfile> => {
  const response = await api.post<UserProfile>('/api/v1/users/', data);
  return response.data;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/api/v1/users/${userId}/profile`);
  return response.data;
};

// Documents
export const analyzeDocument = async (
  file: File,
  userId: string,
  languageMode: 'english' | 'pidgin'
): Promise<AnalyzeDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('language_mode', languageMode);

  const response = await api.post<AnalyzeDocumentResponse>('/api/v1/documents/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  const response = await api.get<AnalysisResult>(`/api/v1/documents/analysis/${analysisId}`);
  return response.data;
};

// Risk Card
export const getRiskCard = async (
  analysisId: string,
  options?: { refresh?: boolean; redirect?: boolean }
): Promise<RiskCardResponse> => {
  const params = new URLSearchParams();
  if (options?.refresh) params.append('refresh', 'true');
  if (options?.redirect) params.append('redirect', 'true');

  const queryString = params.toString();
  const url = `/api/v1/risk-card/${analysisId}${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<RiskCardResponse>(url);
  return response.data;
};

export const getRiskCardUrl = (
  analysisId: string,
  options?: { refresh?: boolean; redirect?: boolean }
): string => {
  const params = new URLSearchParams();
  if (options?.refresh) params.append('refresh', 'true');
  if (options?.redirect) params.append('redirect', 'true');
  return `${API_BASE}/api/v1/risk-card/${analysisId}${params.toString() ? `?${params}` : ''}`;
};

// WhatsApp Webhook
export const sendWhatsAppWebhook = async (data: WhatsAppWebhookPayload): Promise<{ success: boolean }> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  const response = await api.post<{ success: boolean }>('/api/v1/webhook/whatsapp', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Error handling helper
export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

interface ApiErrorData {
  detail?: unknown;
  message?: unknown;
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
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

export { API_BASE };
export default api;
