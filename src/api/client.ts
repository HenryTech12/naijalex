import axios from 'axios';
import type { AnalysisResult, LanguageMode, UploadResponse, UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://naijalex.quikdb.net';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const createUser = async (data: {
  business_type: string;
  industry: string;
}): Promise<UserProfile> => {
  const response = await api.post<UserProfile>('/api/v1/users/', data);
  return response.data;
};

export const analyzeDocument = async (
  file: File,
  userId: string,
  languageMode: LanguageMode
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  formData.append('language_mode', languageMode);

  const response = await api.post<UploadResponse>('/api/v1/documents/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  const response = await api.get<AnalysisResult>(`/api/v1/documents/analysis/${analysisId}`);
  return response.data;
};

export const getRiskCardUrl = (analysisId: string): string =>
  `${API_BASE}/api/v1/risk-card/${analysisId}`;

export default api;
