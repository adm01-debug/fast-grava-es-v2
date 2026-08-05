import { useEffect } from 'react';

/**
 * Hook to warn user before leaving page if they have unsaved changes.
 * 
 * @param isDirty - Boolean indicating if there are unsaved changes
 * @param message - Optional message to show in the confirmation dialog
 */
export function useDirtyStateGuard(isDirty: boolean, message = 'Você tem alterações não salvas. Tem certeza que deseja sair?') {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
}
