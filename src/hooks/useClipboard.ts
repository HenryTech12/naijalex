import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface UseClipboardOptions {
  resetDelay?: number;
  successMessage?: string;
  errorMessage?: string;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export const useClipboard = (options: UseClipboardOptions = {}): UseClipboardReturn => {
  const {
    resetDelay = 2000,
    successMessage = 'Copied!',
    errorMessage = 'Failed to copy.',
  } = options;

  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch {
      toast.error(errorMessage);
    }
  }, [resetDelay, successMessage, errorMessage]);

  return { copied, copy };
};
