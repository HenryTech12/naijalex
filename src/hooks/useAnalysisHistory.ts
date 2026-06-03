import { useEffect, useState, useCallback } from 'react';
import { getAnalysisHistory, getCurrentApiMode } from '../api/client';
import type { DocumentHistoryItem } from '../types';

interface UseAnalysisHistoryResult {
  items: DocumentHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAnalysisHistory = (userId: string | null): UseAnalysisHistoryResult => {
  const [items, setItems] = useState<DocumentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const effectiveUserId = userId || (getCurrentApiMode() === 'demo' ? 'demo-user' : null);

  // Replace the refresh definition with:
const refresh = useCallback(async () => {
  if (!effectiveUserId) {
    setItems([]);
    setError(null);
    return;
  }
  setIsLoading(true);
  setError(null);
  try {
    const response = await getAnalysisHistory(effectiveUserId);
    setItems(response.items ?? []);
  } catch {
    setError('Failed to load analysis history.');
  } finally {
    setIsLoading(false);
  }
}, [effectiveUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, isLoading, error, refresh };
};
