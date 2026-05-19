import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { type AppRole } from '../index';

export type Permission = string;

export const AVAILABLE_PERMISSIONS: Permission[] = [
  'admin:all',
  'jobs:view',
  'jobs:create',
  'jobs:edit',
  'jobs:delete',
  'jobs:all',
  'production:view',
  'production:register',
  'production:all',
  'operators:view',
  'operators:manage',
  'operators:all',
  'telemetry:view',
  'settings:manage'
];

export const RESOURCE_LABELS: Record<string, string> = {
  admin: 'Administração',
  jobs: 'Agendamentos',
  production: 'Produção',
  operators: 'Operadores',
  telemetry: 'Telemetria',
  settings: 'Configurações'
};

export function useRolePermissions(role: AppRole | null) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPermissions = useCallback(async (selectedRole: AppRole) => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', selectedRole);

      if (error) throw error;
      setPermissions((data || []).map(p => p.permission));
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      // Fallback to defaults if table doesn't exist or error occurs
      if (selectedRole === 'coordinator') {
        setPermissions(['admin:all', 'jobs:all', 'production:all', 'operators:all', 'telemetry:view', 'settings:manage']);
      } else if (selectedRole === 'manager') {
        setPermissions(['jobs:view', 'jobs:create', 'jobs:edit', 'production:view', 'operators:view']);
      } else if (selectedRole === 'operator') {
        setPermissions(['jobs:view', 'production:register']);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role) {
      fetchPermissions(role);
    }
  }, [role, fetchPermissions]);

  const togglePermission = async (targetRole: AppRole, permission: Permission) => {
    setIsSaving(true);
    const isEnabled = permissions.includes(permission);
    try {
      if (isEnabled) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .match({ role: targetRole, permission });
        if (error) throw error;
        setPermissions(prev => prev.filter(p => p !== permission));
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role: targetRole, permission });
        if (error) throw error;
        setPermissions(prev => [...prev, permission]);
      }
      toast.success('Permissão atualizada');
    } catch (error: any) {
      toast.error('Erro ao atualizar permissão', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const hasPermission = useCallback((permission: string): boolean => {
    if (!role) return false;
    if (permissions.includes('admin:all')) return true;
    
    const [resource] = permission.split(':');
    if (permissions.includes(`${resource}:all`)) return true;
    
    return permissions.includes(permission);
  }, [role, permissions]);

  return {
    permissions,
    isLoading,
    isSaving,
    fetchPermissions,
    togglePermission,
    hasPermission
  };
}
