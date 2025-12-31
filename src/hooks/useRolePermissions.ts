import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AppRole } from '@/contexts/AuthContext';

export interface RolePermission {
  id: string;
  role: AppRole;
  permission: string;
  resource: string;
  action: string;
  is_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionDefinition {
  permission: string;
  resource: string;
  action: string;
  label: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  // Jobs
  { permission: 'jobs:read', resource: 'jobs', action: 'read', label: 'Visualizar Jobs', description: 'Ver lista de jobs e detalhes' },
  { permission: 'jobs:create', resource: 'jobs', action: 'create', label: 'Criar Jobs', description: 'Criar novos jobs de produção' },
  { permission: 'jobs:update', resource: 'jobs', action: 'update', label: 'Editar Jobs', description: 'Modificar jobs existentes' },
  { permission: 'jobs:delete', resource: 'jobs', action: 'delete', label: 'Excluir Jobs', description: 'Remover jobs do sistema' },
  { permission: 'production:register', resource: 'production', action: 'register', label: 'Registrar Produção', description: 'Registrar quantidades produzidas' },
  
  // Operators
  { permission: 'operators:read', resource: 'operators', action: 'read', label: 'Visualizar Operadores', description: 'Ver lista de operadores' },
  { permission: 'operators:create', resource: 'operators', action: 'create', label: 'Criar Operadores', description: 'Adicionar novos operadores' },
  { permission: 'operators:update', resource: 'operators', action: 'update', label: 'Editar Operadores', description: 'Modificar dados de operadores' },
  { permission: 'operators:delete', resource: 'operators', action: 'delete', label: 'Excluir Operadores', description: 'Remover operadores do sistema' },
  
  // Machines
  { permission: 'machines:read', resource: 'machines', action: 'read', label: 'Visualizar Máquinas', description: 'Ver lista de máquinas' },
  { permission: 'machines:create', resource: 'machines', action: 'create', label: 'Criar Máquinas', description: 'Adicionar novas máquinas' },
  { permission: 'machines:update', resource: 'machines', action: 'update', label: 'Editar Máquinas', description: 'Modificar dados de máquinas' },
  { permission: 'machines:delete', resource: 'machines', action: 'delete', label: 'Excluir Máquinas', description: 'Remover máquinas do sistema' },
  
  // Reports
  { permission: 'reports:read', resource: 'reports', action: 'read', label: 'Visualizar Relatórios', description: 'Ver relatórios do sistema' },
  { permission: 'reports:create', resource: 'reports', action: 'create', label: 'Criar Relatórios', description: 'Gerar novos relatórios' },
  { permission: 'reports:export', resource: 'reports', action: 'export', label: 'Exportar Relatórios', description: 'Exportar relatórios em PDF/Excel' },
  
  // Settings
  { permission: 'settings:read', resource: 'settings', action: 'read', label: 'Visualizar Configurações', description: 'Ver configurações do sistema' },
  { permission: 'settings:update', resource: 'settings', action: 'update', label: 'Editar Configurações', description: 'Modificar configurações do sistema' },
  
  // Security
  { permission: 'security:read', resource: 'security', action: 'read', label: 'Visualizar Segurança', description: 'Ver painel de segurança' },
  { permission: 'security:manage', resource: 'security', action: 'manage', label: 'Gerenciar Segurança', description: 'Gerenciar configurações de segurança' },
  { permission: 'users:manage', resource: 'users', action: 'manage', label: 'Gerenciar Usuários', description: 'Gerenciar contas de usuários' },
];

export const RESOURCE_LABELS: Record<string, string> = {
  jobs: 'Produção',
  production: 'Produção',
  operators: 'Operadores',
  machines: 'Máquinas',
  reports: 'Relatórios',
  settings: 'Configurações',
  security: 'Segurança',
  users: 'Usuários',
};

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role')
        .order('resource')
        .order('action');

      if (error) throw error;
      setPermissions((data || []) as RolePermission[]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const togglePermission = useCallback(async (
    role: AppRole,
    permission: string,
    currentValue: boolean
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const existingPerm = permissions.find(
        p => p.role === role && p.permission === permission
      );

      if (existingPerm) {
        // Update existing
        const { error } = await supabase
          .from('role_permissions')
          .update({ is_granted: !currentValue })
          .eq('id', existingPerm.id);

        if (error) throw error;
      } else {
        // Insert new
        const permDef = AVAILABLE_PERMISSIONS.find(p => p.permission === permission);
        if (!permDef) throw new Error('Permission not found');

        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role,
            permission,
            resource: permDef.resource,
            action: permDef.action,
            is_granted: !currentValue
          });

        if (error) throw error;
      }

      await fetchPermissions();
      toast.success('Permissão atualizada');
      return true;
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast.error('Erro ao atualizar permissão');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [permissions, fetchPermissions]);

  const hasPermission = useCallback((role: AppRole, permission: string): boolean => {
    const perm = permissions.find(
      p => p.role === role && p.permission === permission
    );
    return perm?.is_granted ?? false;
  }, [permissions]);

  const getPermissionsByRole = useCallback((role: AppRole): RolePermission[] => {
    return permissions.filter(p => p.role === role && p.is_granted);
  }, [permissions]);

  const getPermissionsByResource = useCallback((resource: string): RolePermission[] => {
    return permissions.filter(p => p.resource === resource);
  }, [permissions]);

  const bulkUpdatePermissions = useCallback(async (
    role: AppRole,
    permissionUpdates: { permission: string; is_granted: boolean }[]
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      for (const update of permissionUpdates) {
        const existingPerm = permissions.find(
          p => p.role === role && p.permission === update.permission
        );

        if (existingPerm) {
          await supabase
            .from('role_permissions')
            .update({ is_granted: update.is_granted })
            .eq('id', existingPerm.id);
        } else {
          const permDef = AVAILABLE_PERMISSIONS.find(p => p.permission === update.permission);
          if (permDef) {
            await supabase
              .from('role_permissions')
              .insert({
                role,
                permission: update.permission,
                resource: permDef.resource,
                action: permDef.action,
                is_granted: update.is_granted
              });
          }
        }
      }

      await fetchPermissions();
      toast.success('Permissões atualizadas em lote');
      return true;
    } catch (error) {
      console.error('Error bulk updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [permissions, fetchPermissions]);

  return {
    permissions,
    isLoading,
    isSaving,
    fetchPermissions,
    togglePermission,
    hasPermission,
    getPermissionsByRole,
    getPermissionsByResource,
    bulkUpdatePermissions
  };
}
