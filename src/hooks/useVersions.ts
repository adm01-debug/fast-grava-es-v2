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

// In-memory storage for versions (fallback when table doesn't exist)
const inMemoryVersions: Map<string, EntityVersion[]> = new Map();

export function useVersions(entityType: string, entityId: string | null) {
  const queryKey = ['versions', entityType, entityId];
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!entityId) return [];
      
      // Return from in-memory storage since the table might not exist
      const key = `${entityType}:${entityId}`;
      return inMemoryVersions.get(key) || [];
    },
    enabled: !!entityId,
  });

  const latestVersion = versions[0] ?? null;
  const versionCount = versions.length;
  const currentVersion = latestVersion?.version_number ?? 0;

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      if (!entityId) throw new Error('No entity ID');
      
      const key = `${entityType}:${entityId}`;
      const allVersions = inMemoryVersions.get(key) || [];
      const targetVersion = allVersions.find(v => v.version_number === versionNumber);
      
      if (!targetVersion) throw new Error('Version not found');
      
      // Update the entity with version data
      const { error } = await (supabase
        .from(entityType as 'jobs')
        .update(targetVersion.data as never)
        .eq('id', entityId) as unknown as Promise<{ error: Error | null }>);
      
      if (error) throw error;
      return targetVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [entityType] });
      toast.success('Versão restaurada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao restaurar versão');
    },
  });

  const restoreVersion = async (versionNumber: number) => {
    return restoreVersionMutation.mutateAsync(versionNumber);
  };

  return {
    versions,
    latestVersion,
    versionCount,
    currentVersion,
    isLoading,
    error,
    restoreVersion,
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
      const key = `${entityType}:${entityId}`;
      const versions = inMemoryVersions.get(key) || [];
      
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
      // Update the entity with version data using type assertion
      const { error } = await (supabase
        .from(entityType as 'jobs')
        .update(version.data as never)
        .eq('id', entityId) as unknown as Promise<{ error: Error | null }>);
      
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
