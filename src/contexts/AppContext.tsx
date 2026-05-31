import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AnalysisResult, FlowState } from '../types';

interface AppState extends FlowState {
  analysisHistory: AnalysisResult[];
  mode: 'live' | 'demo';
  setUserId: (id: string) => void;
  setAnalysisRequestId: (id: string) => void;
  setAnalysisId: (id: string) => void;
  setRiskCardUrl: (url: string) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  setMode: (mode: 'live' | 'demo') => void;
  clearFlow: () => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'naijalex_flow_state';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem('naijalex_user_id');
    return stored || null;
  });
  const [analysisRequestId, setAnalysisRequestIdState] = useState<string | null>(() => {
    const stored = sessionStorage.getItem('naijalex_analysis_request_id');
    return stored || null;
  });
  const [analysisId, setAnalysisIdState] = useState<string | null>(() => {
    const stored = sessionStorage.getItem('naijalex_analysis_id');
    return stored || null;
  });
  const [riskCardUrl, setRiskCardUrlState] = useState<string | null>(() => {
    const stored = sessionStorage.getItem('naijalex_risk_card_url');
    return stored || null;
  });
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [mode, setModeState] = useState<'live' | 'demo'>(() => {
    const stored = localStorage.getItem('naijalex_mode');
    return (stored as 'live' | 'demo') || 'live';
  });

  const setUserId = useCallback((id: string) => {
    localStorage.setItem('naijalex_user_id', id);
    setUserIdState(id);
  }, []);

  const setAnalysisRequestId = useCallback((id: string) => {
    sessionStorage.setItem('naijalex_analysis_request_id', id);
    setAnalysisRequestIdState(id);
  }, []);

  const setAnalysisId = useCallback((id: string) => {
    sessionStorage.setItem('naijalex_analysis_id', id);
    setAnalysisIdState(id);
  }, []);

  const setRiskCardUrl = useCallback((url: string) => {
    sessionStorage.setItem('naijalex_risk_card_url', url);
    setRiskCardUrlState(url);
  }, []);

  const addAnalysis = useCallback((analysis: AnalysisResult) => {
    setAnalysisHistory((prev) => {
      const exists = prev.find((a) => a.id === analysis.id);
      if (exists) return prev.map((a) => (a.id === analysis.id ? analysis : a));
      return [analysis, ...prev];
    });
  }, []);

  const setMode = useCallback((newMode: 'live' | 'demo') => {
    localStorage.setItem('naijalex_mode', newMode);
    setModeState(newMode);
  }, []);

  const clearFlow = useCallback(() => {
    sessionStorage.removeItem('naijalex_analysis_request_id');
    sessionStorage.removeItem('naijalex_analysis_id');
    sessionStorage.removeItem('naijalex_risk_card_url');
    setAnalysisRequestIdState(null);
    setAnalysisIdState(null);
    setRiskCardUrlState(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userId,
        analysisRequestId,
        analysisId,
        riskCardUrl,
        analysisHistory,
        mode,
        setUserId,
        setAnalysisRequestId,
        setAnalysisId,
        setRiskCardUrl,
        addAnalysis,
        setMode,
        clearFlow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
