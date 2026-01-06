import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseFormAutosaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  showNotification?: boolean;
  onRestore?: (data: T) => void;
  validate?: (data: T) => boolean;
}

interface AutosaveState<T> {
  savedData: T | null;
  lastSaved: Date | null;
  isDirty: boolean;
  isRestoring: boolean;
}

export function useFormAutosave<T extends Record<string, unknown>>({
  key,
  data,
  enabled = true,
  debounceMs = 2000,
  showNotification = true,
  onRestore,
  validate,
}: UseFormAutosaveOptions<T>) {
  const [state, setState] = useState<AutosaveState<T>>({
    savedData: null,
    lastSaved: null,
    isDirty: false,
    isRestoring: false,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialDataRef = useRef<T | null>(null);
  const storageKey = `autosave_${key}`;
  
  // Check for saved data on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { data: T; timestamp: string };
        const savedDate = new Date(parsed.timestamp);
        
        // Only restore if saved within last 24 hours
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (savedDate > dayAgo) {
          setState((s) => ({
            ...s,
            savedData: parsed.data,
            lastSaved: savedDate,
          }));
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error reading autosave:', error);
    }
    
    // Store initial data for dirty checking
    initialDataRef.current = data;
  }, [enabled, storageKey]);
  
  // Check if data is dirty (different from initial)
  useEffect(() => {
    if (!enabled || !initialDataRef.current) return;
    
    const isDirty = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
    setState((s) => ({ ...s, isDirty }));
  }, [data, enabled]);
  
  // Debounced autosave
  useEffect(() => {
    if (!enabled || !state.isDirty) return;
    
    // Validate before saving if validator provided
    if (validate && !validate(data)) return;
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        const saveData = {
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        
        setState((s) => ({
          ...s,
          savedData: data,
          lastSaved: new Date(),
        }));
        
        if (showNotification) {
          toast.info('Rascunho salvo', {
            duration: 1500,
            position: 'bottom-right',
          });
        }
      } catch (error) {
        console.error('Error autosaving:', error);
      }
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, state.isDirty, debounceMs, showNotification, storageKey, validate]);
  
  // Restore saved data
  const restore = useCallback(() => {
    if (!state.savedData) return;
    
    setState((s) => ({ ...s, isRestoring: true }));
    
    try {
      onRestore?.(state.savedData);
      toast.success('Rascunho restaurado');
    } catch (error) {
      console.error('Error restoring:', error);
      toast.error('Erro ao restaurar rascunho');
    } finally {
      setState((s) => ({ ...s, isRestoring: false }));
    }
  }, [state.savedData, onRestore]);
  
  // Clear saved data
  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({
      savedData: null,
      lastSaved: null,
      isDirty: false,
      isRestoring: false,
    });
  }, [storageKey]);
  
  // Force save now
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      const saveData = {
        data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      
      setState((s) => ({
        ...s,
        savedData: data,
        lastSaved: new Date(),
      }));
      
      toast.success('Salvo!', { duration: 1500 });
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [data, storageKey]);
  
  // Check if there's a draft to restore
  const hasDraft = state.savedData !== null && 
    JSON.stringify(state.savedData) !== JSON.stringify(initialDataRef.current);
  
  return {
    ...state,
    hasDraft,
    restore,
    clear,
    saveNow,
  };
}

// Autosave indicator component
interface AutosaveIndicatorProps {
  lastSaved: Date | null;
  isDirty: boolean;
  className?: string;
}

export function AutosaveIndicator({ lastSaved, isDirty, className }: AutosaveIndicatorProps) {
  const [, forceUpdate] = useState({});
  
  // Update every minute to keep "x minutes ago" fresh
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!lastSaved && !isDirty) return null;
  
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h atrás`;
  };
  
  return (
    <div className={className}>
      {isDirty ? (
        <span className="text-xs text-muted-foreground animate-pulse">
          Salvando...
        </span>
      ) : lastSaved ? (
        <span className="text-xs text-muted-foreground">
          Salvo {getTimeAgo(lastSaved)}
        </span>
      ) : null}
    </div>
  );
}

// Draft restore banner
interface DraftBannerProps {
  lastSaved: Date | null;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftBanner({ lastSaved, onRestore, onDiscard }: DraftBannerProps) {
  if (!lastSaved) return null;
  
  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center justify-between gap-4 mb-4">
      <div>
        <p className="text-sm font-medium text-foreground">
          Rascunho encontrado
        </p>
        <p className="text-xs text-muted-foreground">
          Salvo em {lastSaved.toLocaleString('pt-BR')}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Descartar
        </button>
        <button
          onClick={onRestore}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Restaurar
        </button>
      </div>
    </div>
  );
}

export default useFormAutosave;
