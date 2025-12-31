import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EntityVersion {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
  user?: {
    full_name: string | null;
    email: string | null;
  };
}

export function useVersions(entityType: string, entityId: string | null) {
  const queryKey = ['versions', entityType, entityId];

  const { data: versions = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('entity_versions')
        .select(`
          *,
          user:changed_by(full_name, email)
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as EntityVersion[];
    },
    enabled: !!entityId,
  });

  const latestVersion = versions[0] ?? null;
  const versionCount = versions.length;

  return {
    versions,
    latestVersion,
    versionCount,
    isLoading,
    error,
  };
}

// Hook para comparar duas versões
export function useVersionComparison(
  entityType: string,
  entityId: string,
  versionA: number,
  versionB: number
) {
  return useQuery({
    queryKey: ['version-comparison', entityType, entityId, versionA, versionB],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_versions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .in('version_number', [versionA, versionB]);
      
      if (error) throw error;
      
      const versions = data as EntityVersion[];
      const a = versions.find(v => v.version_number === versionA);
      const b = versions.find(v => v.version_number === versionB);
      
      return { versionA: a, versionB: b };
    },
    enabled: !!entityId && versionA !== versionB,
  });
}

// Hook para restaurar uma versão
export function useRestoreVersion(entityType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId, version }: { entityId: string; version: EntityVersion }) => {
      // Atualizar a entidade com os dados da versão
      const { error } = await supabase
        .from(entityType)
        .update(version.data)
        .eq('id', entityId);
      
      if (error) throw error;
    },
    onSuccess: (_, { entityId }) => {
      queryClient.invalidateQueries({ queryKey: ['versions', entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: [entityType] });
      toast.success('Versão restaurada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao restaurar versão');
    },
  });
}
