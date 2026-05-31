import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';

interface AppState {
  userId: string | null;
  analysisHistory: AnalysisResult[];
  setUserId: (id: string) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(() =>
    localStorage.getItem('naijalex_user_id')
  );
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  const setUserId = (id: string) => {
    localStorage.setItem('naijalex_user_id', id);
    setUserIdState(id);
  };

  const addAnalysis = (analysis: AnalysisResult) => {
    setAnalysisHistory((prev) => {
      const exists = prev.find((a) => a.id === analysis.id);
      if (exists) return prev.map((a) => (a.id === analysis.id ? analysis : a));
      return [analysis, ...prev];
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('naijalex_user_id');
    if (stored && !userId) setUserIdState(stored);
  }, [userId]);

  return (
    <AppContext.Provider value={{ userId, analysisHistory, setUserId, addAnalysis }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
