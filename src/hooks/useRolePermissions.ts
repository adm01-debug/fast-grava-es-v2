import { useState, useCallback } from 'react';
import { AppRole } from '@/contexts/AuthContext';

// Permission types
export type Permission =
  | 'jobs.view' | 'jobs.create' | 'jobs.edit' | 'jobs.delete' | 'jobs.read' | 'jobs.update'
  | 'production.view' | 'production.register' | 'production.edit'
  | 'operators.view' | 'operators.create' | 'operators.edit' | 'operators.delete' | 'operators.read'
  | 'reports.view' | 'reports.export' | 'reports.read'
  | 'settings.view' | 'settings.edit' | 'settings.read' | 'settings.update'
  | 'security.view' | 'security.manage' | 'machines.read' | 'machines.create' | 'machines.update' | 'machines.delete'
  | 'users.read' | 'users.create' | 'users.update' | 'users.delete' | 'users.change_role'
  | 'maintenance.read' | 'maintenance.create' | 'maintenance.update' | 'maintenance.delete'
  | 'quality.read' | 'quality.create' | 'quality.update'
  | 'traceability.read' | 'traceability.create'
  | 'technical_sheets.read' | 'technical_sheets.create' | 'technical_sheets.update' | 'technical_sheets.delete'
  | 'technical_sheets.approve'
  | 'goals.read' | 'goals.create' | 'goals.update' | 'goals.delete'
  | 'gamification.read' | 'gamification.manage'
  | 'alerts.read' | 'alerts.resolve'
  | 'energy.read' | 'energy.manage'
  | 'spc.read' | 'spc.manage'
  | 'shifts.read' | 'shifts.manage'
  | 'bitrix.read' | 'bitrix.sync'
  | 'audit.read'
  | 'inventory.read' | 'inventory.transfer' | 'inventory.adjust' | 'inventory.delete';

export interface PermissionDefinition {
  permission: Permission;
  label: string;
  description: string;
  resource: string;
}

// Available permissions list
export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  { permission: 'jobs.view', label: 'Ver Jobs', description: 'Visualizar lista de jobs', resource: 'jobs' },
  { permission: 'jobs.create', label: 'Criar Jobs', description: 'Criar novos jobs', resource: 'jobs' },
  { permission: 'jobs.edit', label: 'Editar Jobs', description: 'Editar jobs existentes', resource: 'jobs' },
  { permission: 'jobs.delete', label: 'Excluir Jobs', description: 'Excluir jobs', resource: 'jobs' },
  { permission: 'production.view', label: 'Ver Produção', description: 'Visualizar dados de produção', resource: 'production' },
  { permission: 'production.register', label: 'Registrar Produção', description: 'Registrar produção', resource: 'production' },
  { permission: 'production.edit', label: 'Editar Produção', description: 'Editar registros', resource: 'production' },
  { permission: 'operators.view', label: 'Ver Operadores', description: 'Visualizar operadores', resource: 'operators' },
  { permission: 'operators.create', label: 'Criar Operadores', description: 'Criar operadores', resource: 'operators' },
  { permission: 'operators.edit', label: 'Editar Operadores', description: 'Editar operadores', resource: 'operators' },
  { permission: 'operators.delete', label: 'Excluir Operadores', description: 'Excluir operadores', resource: 'operators' },
  { permission: 'reports.view', label: 'Ver Relatórios', description: 'Visualizar relatórios', resource: 'reports' },
  { permission: 'reports.export', label: 'Exportar Relatórios', description: 'Exportar dados', resource: 'reports' },
  { permission: 'settings.view', label: 'Ver Configurações', description: 'Visualizar configurações', resource: 'settings' },
  { permission: 'settings.edit', label: 'Editar Configurações', description: 'Editar configurações', resource: 'settings' },
  { permission: 'security.view', label: 'Ver Segurança', description: 'Visualizar segurança', resource: 'security' },
  { permission: 'security.manage', label: 'Gerenciar Segurança', description: 'Gerenciar segurança', resource: 'security' },
];

export const RESOURCE_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  production: 'Produção',
  operators: 'Operadores',
  reports: 'Relatórios',
  settings: 'Configurações',
  security: 'Segurança',
};

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<AppRole, Permission[]> = {
  coordinator: AVAILABLE_PERMISSIONS.map(p => p.permission),
  manager: [
    'jobs.view', 'jobs.create', 'jobs.edit',
    'production.view', 'production.register', 'production.edit',
    'operators.view', 'operators.create', 'operators.edit',
    'reports.view', 'reports.export',
    'settings.view',
  ],
  operator: [
    'jobs.view',
    'production.view', 'production.register',
    'operators.view',
  ],
};

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<Record<AppRole, Permission[]>>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hasPermission = useCallback((role: AppRole, permission: Permission) => {
    return permissions[role]?.includes(permission) ?? false;
  }, [permissions]);

  const togglePermission = useCallback(async (role: AppRole, permission: Permission, _value?: boolean) => {
    setIsSaving(true);
    try {
      setPermissions(prev => {
        const rolePerms = prev[role] || [];
        const hasIt = rolePerms.includes(permission);
        return {
          ...prev,
          [role]: hasIt
            ? rolePerms.filter(p => p !== permission)
            : [...rolePerms, permission],
        };
      });
    } finally {
      setIsSaving(false);
    }
  }, []);

  const fetchPermissions = useCallback(() => {
    setPermissions(DEFAULT_PERMISSIONS);
  }, []);

  const refetch = useCallback(() => {
    setPermissions(DEFAULT_PERMISSIONS);
  }, []);

  // Group permissions by resource
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

  return {
    permissions,
    groupedPermissions,
    hasPermission,
    togglePermission,
    isLoading,
    isSaving,
    error,
    refetch,
    fetchPermissions,
  };
}
