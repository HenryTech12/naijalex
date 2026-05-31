import { useState, useEffect, useRef } from 'react';
import { getAnalysis } from '../api/client';
import type { AnalysisResult } from '../types';

interface UseAnalysisResult {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
}

export const useAnalysis = (analysisId: string | null): UseAnalysisResult => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!analysisId) return;

    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    pollCount.current = 0;

    const poll = async () => {
      try {
        const result = await getAnalysis(analysisId);
        setAnalysis(result);

        if (result.status === 'complete') {
          setIsComplete(true);
          setIsLoading(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        pollCount.current += 1;
        if (pollCount.current >= 40) {
          setError('Analysis is taking longer than expected. Please try again.');
          setIsLoading(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError('Failed to fetch analysis. Please check your connection.');
        setIsLoading(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [analysisId]);

  return { analysis, isLoading, isComplete, error };
};
