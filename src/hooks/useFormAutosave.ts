import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface AutosaveOptions {
  key: string;
  debounceMs?: number;
  onSave?: (data: unknown) => Promise<void>;
  onRestore?: (data: unknown) => void;
  storage?: 'local' | 'session';
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
}

// Autosave hook
export function useFormAutosave<T extends Record<string, unknown>>(
  formData: T,
  options: AutosaveOptions
) {
  const { 
    key, 
    debounceMs = 1000, 
    onSave, 
    onRestore, 
    storage = 'local' 
  } = options;

  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(formData);
  const storageKey = `autosave-${key}`;

  const getStorage = useCallback(() => {
    return storage === 'local' ? localStorage : sessionStorage;
  }, [storage]);

  const saveToStorage = useCallback(async (data: T) => {
    setState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      const saveData = { data, timestamp: new Date().toISOString(), version: 1 };
      getStorage().setItem(storageKey, JSON.stringify(saveData));
      if (onSave) await onSave(data);
      setState(prev => ({ ...prev, isSaving: false, lastSaved: new Date(), hasUnsavedChanges: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false, error: error as Error }));
    }
  }, [storageKey, getStorage, onSave]);

  const restoreFromStorage = useCallback((): T | null => {
    try {
      const saved = getStorage().getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (onRestore) onRestore(parsed.data);
        return parsed.data as T;
      }
    } catch (error) {
      console.error('Failed to restore autosaved data:', error);
    }
    return null;
  }, [storageKey, getStorage, onRestore]);

  const hasSavedData = useCallback((): boolean => {
    return getStorage().getItem(storageKey) !== null;
  }, [storageKey, getStorage]);

  const clearSavedData = useCallback(() => {
    getStorage().removeItem(storageKey);
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, [storageKey, getStorage]);

  const getSavedTimestamp = useCallback((): Date | null => {
    try {
      const saved = getStorage().getItem(storageKey);
      if (saved) return new Date(JSON.parse(saved).timestamp);
    } catch (error) {
      console.error('Failed to get saved timestamp:', error);
    }
    return null;
  }, [storageKey, getStorage]);

  useEffect(() => {
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(previousDataRef.current);
    if (dataChanged) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
      previousDataRef.current = formData;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => saveToStorage(formData), debounceMs);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [formData, debounceMs, saveToStorage]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    saveToStorage(formData);
  }, [formData, saveToStorage]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  return { ...state, saveNow, restoreFromStorage, hasSavedData, clearSavedData, getSavedTimestamp };
}

// Form draft manager
interface FormDraft {
  id: string;
  name: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export function useFormDrafts(formType: string) {
  const storageKey = `form-drafts-${formType}`;

  const getDrafts = useCallback((): FormDraft[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved).map((d: FormDraft) => ({
          ...d,
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
    return [];
  }, [storageKey]);

  const [drafts, setDrafts] = useState<FormDraft[]>(getDrafts);

  const persistDrafts = useCallback((newDrafts: FormDraft[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newDrafts));
    setDrafts(newDrafts);
  }, [storageKey]);

  const saveDraft = useCallback((name: string, data: Record<string, unknown>, id?: string) => {
    const now = new Date();
    const draft: FormDraft = { id: id || `draft-${Date.now()}`, name, data, createdAt: now, updatedAt: now };
    const existing = drafts.findIndex(d => d.id === draft.id);
    if (existing >= 0) {
      const updated = [...drafts];
      updated[existing] = { ...draft, createdAt: drafts[existing].createdAt };
      persistDrafts(updated);
    } else {
      persistDrafts([draft, ...drafts]);
    }
    return draft.id;
  }, [drafts, persistDrafts]);

  const loadDraft = useCallback((id: string): FormDraft | null => drafts.find(d => d.id === id) || null, [drafts]);
  const deleteDraft = useCallback((id: string) => persistDrafts(drafts.filter(d => d.id !== id)), [drafts, persistDrafts]);
  const clearAllDrafts = useCallback(() => persistDrafts([]), [persistDrafts]);

  return { drafts, saveDraft, loadDraft, deleteDraft, clearAllDrafts };
}

export default useFormAutosave;
