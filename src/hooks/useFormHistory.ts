import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseFormHistoryOptions<T> {
  initialState: T;
  maxHistory?: number;
}

export function useFormHistory<T>({ initialState, maxHistory = 50 }: UseFormHistoryOptions<T>) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isInternalUpdate = useRef(false);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const resolvedPresent = typeof newPresent === 'function' 
        ? (newPresent as (prev: T) => T)(prev.present)
        : newPresent;

      // Don't add to history if it's an internal update (undo/redo)
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return { ...prev, present: resolvedPresent };
      }

      // Don't add identical states
      if (JSON.stringify(resolvedPresent) === JSON.stringify(prev.present)) {
        return prev;
      }

      const newPast = [...prev.past, prev.present].slice(-maxHistory);

      return {
        past: newPast,
        present: resolvedPresent,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      isInternalUpdate.current = true;

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = prev.future.slice(1);
      const newPresent = prev.future[0];
      const newPast = [...prev.past, prev.present];

      isInternalUpdate.current = true;

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newInitial?: T) => {
    setHistory({
      past: [],
      present: newInitial ?? initialState,
      future: [],
    });
  }, [initialState]);

  const clear = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    clear,
    canUndo,
    canRedo,
    historyLength: history.past.length,
    futureLength: history.future.length,
  };
}

// Keyboard shortcut hook for undo/redo
export function useUndoRedoShortcuts(
  undo: () => void,
  redo: () => void,
  canUndo: boolean,
  canRedo: boolean
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key === 'z' && !e.shiftKey && canUndo) {
      e.preventDefault();
      undo();
    } else if (modifier && e.key === 'z' && e.shiftKey && canRedo) {
      e.preventDefault();
      redo();
    } else if (modifier && e.key === 'y' && canRedo) {
      e.preventDefault();
      redo();
    }
  }, [undo, redo, canUndo, canRedo]);

  // Note: Call this in useEffect to add listener
  return { handleKeyDown };
}
