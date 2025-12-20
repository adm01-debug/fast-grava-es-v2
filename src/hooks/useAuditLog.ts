import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  performed_by: string;
  performed_by_name: string | null;
  reason: string | null;
  created_at: string;
}

// Uses operator_status_audit table for audit logging
export function useAuditLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch audit logs from operator_status_audit
  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_status_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Map to AuditLogEntry format
      return (data || []).map(log => ({
        id: log.id,
        entity_type: 'operator',
        entity_id: log.operator_id,
        action: log.action as AuditLogEntry['action'],
        old_values: null,
        new_values: { operator_name: log.operator_name },
        performed_by: log.performed_by,
        performed_by_name: log.performed_by_name,
        reason: log.reason,
        created_at: log.created_at,
      })) as AuditLogEntry[];
    },
  });

  // Log action using operator_status_audit
  const logAction = useMutation({
    mutationFn: async ({
      entity_type,
      entity_id,
      action,
      reason,
    }: {
      entity_type: string;
      entity_id: string;
      action: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
      reason?: string;
    }) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('operator_status_audit')
        .insert({
          operator_id: entity_id,
          operator_name: entity_type,
          action,
          performed_by: user?.id || '',
          performed_by_name: profile?.full_name || user?.email,
          reason: reason || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
    logAction: logAction.mutate,
    logActionAsync: logAction.mutateAsync,
    anomalies: [],
    stats: { today: { total: logs?.length || 0 }, week: { total: 0 } },
    isLogging: logAction.isPending,
  };
}

// Helper hook for automatic audit logging
export function useAuditedMutation<T extends Record<string, any>>(entityType: string) {
  const { logAction } = useAuditLog();

  const logCreate = (entityId: string) => {
    logAction({ entity_type: entityType, entity_id: entityId, action: 'create' });
  };

  const logUpdate = (entityId: string) => {
    logAction({ entity_type: entityType, entity_id: entityId, action: 'update' });
  };

  const logDelete = (entityId: string) => {
    logAction({ entity_type: entityType, entity_id: entityId, action: 'delete' });
  };

  const logStatusChange = (entityId: string, _oldStatus: string, _newStatus: string, reason?: string) => {
    logAction({ entity_type: entityType, entity_id: entityId, action: 'status_change', reason });
  };

  return { logCreate, logUpdate, logDelete, logStatusChange };
}
