import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// Types for undo/redo system
export interface UndoableAction {
  id: string;
  type: string;
  timestamp: number;
  description: string;
  category: 'navigation' | 'form' | 'data' | 'ui' | 'settings';
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  metadata?: Record<string, unknown>;
}

interface UndoRedoState {
  past: UndoableAction[];
  future: UndoableAction[];
  maxHistory: number;
  isProcessing: boolean;
  
  // Actions
  pushAction: (action: Omit<UndoableAction, 'id' | 'timestamp'>) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  setMaxHistory: (max: number) => void;
  getLastAction: () => UndoableAction | null;
  getNextAction: () => UndoableAction | null;
}

export const useUndoRedoStore = create<UndoRedoState>()(
  persist(
    (set, get) => ({
      past: [],
      future: [],
      maxHistory: 50,
      isProcessing: false,

      pushAction: (action) => {
        const newAction: UndoableAction = {
          ...action,
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          past: [...state.past, newAction].slice(-state.maxHistory),
          future: [], // Clear future when new action is pushed
        }));
      },

      undo: async () => {
        const state = get();
        if (state.past.length === 0 || state.isProcessing) return;

        const action = state.past[state.past.length - 1];
        set({ isProcessing: true });

        try {
          await action.undo();
          set((state) => ({
            past: state.past.slice(0, -1),
            future: [action, ...state.future],
            isProcessing: false,
          }));
          toast.success(`Desfeito: ${action.description}`, {
            duration: 2000,
            action: {
              label: 'Refazer',
              onClick: () => get().redo(),
            },
          });
        } catch (error) {
          set({ isProcessing: false });
          toast.error('Erro ao desfazer ação');
          console.error('Undo error:', error);
        }
      },

      redo: async () => {
        const state = get();
        if (state.future.length === 0 || state.isProcessing) return;

        const action = state.future[0];
        set({ isProcessing: true });

        try {
          await action.redo();
          set((state) => ({
            past: [...state.past, action],
            future: state.future.slice(1),
            isProcessing: false,
          }));
          toast.success(`Refeito: ${action.description}`, {
            duration: 2000,
            action: {
              label: 'Desfazer',
              onClick: () => get().undo(),
            },
          });
        } catch (error) {
          set({ isProcessing: false });
          toast.error('Erro ao refazer ação');
          console.error('Redo error:', error);
        }
      },

      canUndo: () => get().past.length > 0 && !get().isProcessing,
      canRedo: () => get().future.length > 0 && !get().isProcessing,
      
      clearHistory: () => set({ past: [], future: [] }),
      
      setMaxHistory: (max) => set({ maxHistory: max }),
      
      getLastAction: () => {
        const { past } = get();
        return past.length > 0 ? past[past.length - 1] : null;
      },
      
      getNextAction: () => {
        const { future } = get();
        return future.length > 0 ? future[0] : null;
      },
    }),
    {
      name: 'global-undo-redo',
      partialize: (state) => ({
        maxHistory: state.maxHistory,
      }),
    }
  )
);

// Hook for keyboard shortcuts
export function useGlobalUndoRedoShortcuts() {
  const { undo, redo, canUndo, canRedo } = useUndoRedoStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      
      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (modifier && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}

// Hook for tracking form changes
export function useUndoableForm<T extends Record<string, unknown>>(
  formName: string,
  initialValues: T
) {
  const { pushAction } = useUndoRedoStore();
  
  const trackChange = useCallback((
    field: keyof T,
    oldValue: T[keyof T],
    newValue: T[keyof T],
    setValue: (field: keyof T, value: T[keyof T]) => void
  ) => {
    pushAction({
      type: 'form_change',
      description: `Alteração em ${String(field)}`,
      category: 'form',
      undo: () => setValue(field, oldValue),
      redo: () => setValue(field, newValue),
      metadata: { formName, field, oldValue, newValue },
    });
  }, [pushAction, formName]);

  return { trackChange };
}

// Hook for tracking data operations
export function useUndoableData() {
  const { pushAction } = useUndoRedoStore();

  const trackCreate = useCallback(<T>(
    entityType: string,
    entity: T,
    onDelete: () => void | Promise<void>,
    onRecreate: () => void | Promise<void>
  ) => {
    pushAction({
      type: 'data_create',
      description: `${entityType} criado`,
      category: 'data',
      undo: onDelete,
      redo: onRecreate,
      metadata: { entityType, entity },
    });
  }, [pushAction]);

  const trackUpdate = useCallback(<T>(
    entityType: string,
    oldData: T,
    newData: T,
    onRevert: () => void | Promise<void>,
    onApply: () => void | Promise<void>
  ) => {
    pushAction({
      type: 'data_update',
      description: `${entityType} atualizado`,
      category: 'data',
      undo: onRevert,
      redo: onApply,
      metadata: { entityType, oldData, newData },
    });
  }, [pushAction]);

  const trackDelete = useCallback(<T>(
    entityType: string,
    entity: T,
    onRestore: () => void | Promise<void>,
    onDelete: () => void | Promise<void>
  ) => {
    pushAction({
      type: 'data_delete',
      description: `${entityType} removido`,
      category: 'data',
      undo: onRestore,
      redo: onDelete,
      metadata: { entityType, entity },
    });
  }, [pushAction]);

  return { trackCreate, trackUpdate, trackDelete };
}

// Hook for tracking UI changes
export function useUndoableUI() {
  const { pushAction } = useUndoRedoStore();

  const trackUIChange = useCallback((
    description: string,
    undo: () => void,
    redo: () => void,
    metadata?: Record<string, unknown>
  ) => {
    pushAction({
      type: 'ui_change',
      description,
      category: 'ui',
      undo,
      redo,
      metadata,
    });
  }, [pushAction]);

  return { trackUIChange };
}
