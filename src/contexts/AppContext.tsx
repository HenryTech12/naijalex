import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnalysisResult, FlowState } from '../types';

interface AppState extends FlowState {
  analysisHistory: AnalysisResult[];
  mode: 'live' | 'demo';
  businessLabel: string | null;
  setUserId: (id: string) => void;
  setBusinessLabel: (label: string) => void;
  setAnalysisRequestId: (id: string) => void;
  setAnalysisId: (id: string) => void;
  setRiskCardUrl: (url: string) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  setMode: (mode: 'live' | 'demo') => void;
  clearFlow: () => void;
}

const AppContext = createContext<AppState | null>(null);

const safeGetItem = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch (err) {
    console.warn(`[NaijaLex] Failed to read "${key}" from storage:`, err);
    return null;
  }
};

const safeSetItem = (storage: Storage, key: string, value: string): void => {
  try {
    storage.setItem(key, value);
  } catch (err) {
    console.warn(`[NaijaLex] Failed to write "${key}" to storage:`, err);
  }
};

const safeRemoveItem = (storage: Storage, key: string): void => {
  try {
    storage.removeItem(key);
  } catch (err) {
    console.warn(`[NaijaLex] Failed to remove "${key}" from storage:`, err);
  }
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean up any corrupted localStorage values from previous broken deployments
  if (typeof window !== 'undefined') {
    const uid = localStorage.getItem('naijalex_user_id');
    const label = localStorage.getItem('naijalex_business_label');
    if (!uid || uid === 'undefined' || uid === 'null') {
      localStorage.removeItem('naijalex_user_id');
    }
    if (!label || label.includes('undefined') || label.includes('null')) {
      localStorage.removeItem('naijalex_business_label');
    }
  }

  // ...rest of existing code
  const [userId, setUserIdState] = useState<string | null>(() => {
    const stored = localStorage.getItem('naijalex_user_id');
    return stored && stored !== 'undefined' && stored !== 'null' ? stored : null;
  });

  const [businessLabel, setBusinessLabelState] = useState<string | null>(() => {
    const stored = localStorage.getItem('naijalex_business_label');
    return stored && !stored.includes('undefined') && !stored.includes('null') ? stored : null;
  });

  const [analysisRequestId, setAnalysisRequestIdState] = useState<string | null>(() => {
    return safeGetItem(sessionStorage, 'naijalex_analysis_request_id') || null;
  });
  const [analysisId, setAnalysisIdState] = useState<string | null>(() => {
    return safeGetItem(sessionStorage, 'naijalex_analysis_id') || null;
  });
  const [riskCardUrl, setRiskCardUrlState] = useState<string | null>(() => {
    return safeGetItem(sessionStorage, 'naijalex_risk_card_url') || null;
  });
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [mode, setModeState] = useState<'live' | 'demo'>(() => {
    const stored = safeGetItem(localStorage, 'naijalex_mode');
    return (stored as 'live' | 'demo') || 'live';
  });

  const setUserId = useCallback((id: string) => {
    safeSetItem(localStorage, 'naijalex_user_id', id);
    setUserIdState(id);
  }, []);

  const setBusinessLabel = useCallback((label: string) => {
    safeSetItem(localStorage, 'naijalex_business_label', label);
    setBusinessLabelState(label);
  }, []);

  const setAnalysisRequestId = useCallback((id: string) => {
    safeSetItem(sessionStorage, 'naijalex_analysis_request_id', id);
    setAnalysisRequestIdState(id);
  }, []);

  const setAnalysisId = useCallback((id: string) => {
    safeSetItem(sessionStorage, 'naijalex_analysis_id', id);
    setAnalysisIdState(id);
  }, []);

  const setRiskCardUrl = useCallback((url: string) => {
    safeSetItem(sessionStorage, 'naijalex_risk_card_url', url);
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
    safeSetItem(localStorage, 'naijalex_mode', newMode);
    setModeState(newMode);
  }, []);

  const clearFlow = useCallback(() => {
    safeRemoveItem(sessionStorage, 'naijalex_analysis_request_id');
    safeRemoveItem(sessionStorage, 'naijalex_analysis_id');
    safeRemoveItem(sessionStorage, 'naijalex_risk_card_url');
    setAnalysisRequestIdState(null);
    setAnalysisIdState(null);
    setRiskCardUrlState(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        userId,
        businessLabel,
        analysisRequestId,
        analysisId,
        riskCardUrl,
        analysisHistory,
        mode,
        setUserId,
        setBusinessLabel,
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
