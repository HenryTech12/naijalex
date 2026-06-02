import { sendChatQuestion } from './client';
import type { ChatResponse, LanguageMode } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const askQuestion = async (
  analysisId: string,
  question: string,
  languageMode: LanguageMode
): Promise<ChatResponse> => {
  return sendChatQuestion(analysisId, question, languageMode);
};
