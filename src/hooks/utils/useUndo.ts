import { useState, useCallback } from 'react';

export function useUndo<T>(initialValue: T) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  const value = history[index];
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const set = useCallback((newValue: T) => {
    setHistory(h => [...h.slice(0, index + 1), newValue]);
    setIndex(i => i + 1);
  }, [index]);

  const undo = useCallback(() => { if (canUndo) setIndex(i => i - 1); }, [canUndo]);
  const redo = useCallback(() => { if (canRedo) setIndex(i => i + 1); }, [canRedo]);
  const reset = useCallback(() => { setHistory([initialValue]); setIndex(0); }, [initialValue]);

  return { value, set, undo, redo, reset, canUndo, canRedo, history };
}
