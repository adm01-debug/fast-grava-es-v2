import { createContext, useContext, ReactNode } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';

type PermissionsContextType = ReturnType<typeof useRolePermissions>;

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const permissions = useRolePermissions();

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissionsContext must be used within PermissionsProvider');
  return ctx;
}
