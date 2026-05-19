import { createContext, useContext, ReactNode } from 'react';
import { useRolePermissions, useAuth } from '@/features/auth';

type PermissionsContextType = ReturnType<typeof useRolePermissions>;

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const permissions = useRolePermissions(role);

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

