import api from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  question: string;
  language_mode: string;
}

export interface ChatResponse {
  answer: string;
}

export const askQuestion = async (
  analysisId: string,
  question: string,
  languageMode: string
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>(`/api/v1/chat/${analysisId}`,
    { question, language_mode: languageMode },
    { timeout: 30000 }
  );
  return response.data;
};
