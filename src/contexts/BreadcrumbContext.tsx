import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
  push: (item: BreadcrumbItem) => void;
  pop: () => void;
  clear: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  const push = useCallback((item: BreadcrumbItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const pop = useCallback(() => {
    setItems((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <BreadcrumbContext.Provider value={{ items, setItems, push, pop, clear }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) throw new Error('useBreadcrumbContext must be used within BreadcrumbProvider');
  return ctx;
}
