import React, { createContext, useContext, ReactNode } from 'react';

type Permission = 'read' | 'write' | 'delete' | 'admin';
type Resource = 'jobs' | 'operators' | 'machines' | 'reports' | 'settings';

interface PermissionsContextType {
  permissions: Record<Resource, Permission[]>;
  hasPermission: (resource: Resource, permission: Permission) => boolean;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children, userRole = 'operator' }: { children: ReactNode; userRole?: string }) {
  const rolePermissions: Record<string, Record<Resource, Permission[]>> = {
    admin: {
      jobs: ['read', 'write', 'delete', 'admin'],
      operators: ['read', 'write', 'delete', 'admin'],
      machines: ['read', 'write', 'delete', 'admin'],
      reports: ['read', 'write', 'delete', 'admin'],
      settings: ['read', 'write', 'delete', 'admin'],
    },
    manager: {
      jobs: ['read', 'write', 'delete'],
      operators: ['read', 'write'],
      machines: ['read', 'write'],
      reports: ['read', 'write'],
      settings: ['read'],
    },
    operator: {
      jobs: ['read', 'write'],
      operators: ['read'],
      machines: ['read'],
      reports: ['read'],
      settings: [],
    },
  };

  const permissions = rolePermissions[userRole] || rolePermissions.operator;
  const isAdmin = userRole === 'admin';

  const hasPermission = (resource: Resource, permission: Permission) => {
    return permissions[resource]?.includes(permission) || false;
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, isAdmin }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used within PermissionsProvider');
  return context;
}
