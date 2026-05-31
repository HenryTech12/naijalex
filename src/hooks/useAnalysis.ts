import { useState, useEffect, useRef, useCallback } from 'react';
import { getAnalysis } from '../api/client';
import type { AnalysisResult } from '../types';

interface UseAnalysisResult {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export const useAnalysis = (analysisId: string | null): UseAnalysisResult => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const poll = useCallback(async () => {
    if (!analysisId) return;

    try {
      const result = await getAnalysis(analysisId);
      setAnalysis(result);

      if (result.status === 'complete' || result.status === 'failed') {
        setIsComplete(true);
        setIsLoading(false);
        stopPolling();
        return;
      }

      pollCount.current += 1;
      if (pollCount.current >= 40) {
        setError('Analysis is taking longer than expected. Please try again.');
        setIsLoading(false);
        stopPolling();
      }
    } catch (err) {
      setError('Failed to fetch analysis. Please check your connection.');
      setIsLoading(false);
      stopPolling();
    }
  }, [analysisId, stopPolling]);

  const startPolling = useCallback(() => {
    if (!analysisId) return;

    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    pollCount.current = 0;
    setIsPolling(true);

    poll();
    intervalRef.current = setInterval(poll, 3000);
  }, [poll]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Auto-start polling if analysisId is provided and status is processing
  useEffect(() => {
    if (analysisId && !analysis && !isComplete && !isPolling) {
      startPolling();
    }
  }, [analysisId, analysis, isComplete, isPolling, startPolling]);

  return {
    analysis,
    isLoading,
    isComplete,
    error,
    startPolling,
    stopPolling,
    isPolling,
  };
};
