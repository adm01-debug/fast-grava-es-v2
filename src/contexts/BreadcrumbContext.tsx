import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbContextType {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<Breadcrumb[]>([]);

  const setBreadcrumbs = useCallback((newBreadcrumbs: Breadcrumb[]) => {
    setBreadcrumbsState(newBreadcrumbs);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: Breadcrumb) => {
    setBreadcrumbsState(prev => [...prev, breadcrumb]);
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbsState([]);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs, addBreadcrumb, clearBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  return context;
}
