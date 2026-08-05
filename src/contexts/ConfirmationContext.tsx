import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface ConfirmationOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  isOpen: boolean;
  options: ConfirmationOptions | null;
  resolve: ((value: boolean) => void) | null;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    resolveRef?.(value);
    setIsOpen(false);
    setOptions(null);
    setResolveRef(null);
  }, [resolveRef]);

  const value = useMemo(
    () => ({ confirm, isOpen, options, resolve: handleResolve }),
    [confirm, isOpen, options, handleResolve],
  );

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) throw new Error('useConfirmation must be used within ConfirmationProvider');
  return ctx;
}
