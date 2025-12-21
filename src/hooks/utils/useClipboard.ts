import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      setError(err as Error);
      setCopied(false);
    }
  }, [timeout]);

  const paste = useCallback(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      setError(err as Error);
      return '';
    }
  }, []);

  return { copied, error, copy, paste };
}
