import { useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs, useTechniques, DbJob } from './useJobs';
import { toast } from 'sonner';
import { createAppError } from '@/lib/errorHandling';

const BUFFER_PROMOTION_CONTEXT = {
  promote: { entity: 'jobs', operation: 'buffer_promotion' },
};

const BUFFER_TARGET = 3; // Target number of "ready" jobs per technique

export interface BufferPromotionResult {
  techniqueId: string;
  techniqueName: string;
  promotedJobs: string[];
  promotedCount: number;
}

export function useAutoBufferPromotion(options?: { enabled?: boolean; showToasts?: boolean }) {
  const { enabled = true, showToasts = true } = options || {};
  const queryClient = useQueryClient();
  const { data: jobs } = useJobs();
  const { data: techniques } = useTechniques();
  const lastPromotionRef = useRef<Record<string, number>>({});

  // Mutation to promote a single job
  const promoteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      try {
        const { error } = await supabase
          .from('jobs')
          .update({ status: 'ready' })
          .eq('id', jobId);
        
        if (error) throw error;
        return jobId;
      } catch (error) {
        const appError = createAppError(error, BUFFER_PROMOTION_CONTEXT.promote);
        if (import.meta.env.DEV) console.error('[promoteJob]', appError);
        throw error;
      }
    },
  });

  // Promote jobs for a specific technique
  const promoteForTechnique = useCallback(async (
    techniqueId: string,
    techniqueName: string,
    queueJobs: DbJob[],
    currentReadyCount: number
  ): Promise<BufferPromotionResult> => {
    const neededCount = Math.max(0, BUFFER_TARGET - currentReadyCount);
    
    if (neededCount === 0 || queueJobs.length === 0) {
      return {
        techniqueId,
        techniqueName,
        promotedJobs: [],
        promotedCount: 0,
      };
    }

    // Sort by priority and creation date
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sortedJobs = [...queueJobs].sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const jobsToPromote = sortedJobs.slice(0, neededCount);
    const promotedIds: string[] = [];

    // Promote jobs in sequence to avoid race conditions
    for (const job of jobsToPromote) {
      try {
        await promoteJobMutation.mutateAsync(job.id);
        promotedIds.push(job.id);
      } catch (error) {
        console.error(`Failed to promote job ${job.order_number}:`, error);
      }
    }

    return {
      techniqueId,
      techniqueName,
      promotedJobs: promotedIds,
      promotedCount: promotedIds.length,
    };
  }, [promoteJobMutation]);

  // Check and promote all techniques
  const checkAndPromoteAll = useCallback(async (): Promise<BufferPromotionResult[]> => {
    if (!jobs || !techniques) return [];

    const results: BufferPromotionResult[] = [];

    for (const technique of techniques) {
      const techniqueJobs = jobs.filter(j => j.technique_id === technique.id);
      const readyJobs = techniqueJobs.filter(j => j.status === 'ready');
      const queueJobs = techniqueJobs.filter(j => j.status === 'queue');
      
      // Skip if buffer is already healthy or no queue jobs
      if (readyJobs.length >= BUFFER_TARGET || queueJobs.length === 0) continue;

      // Debounce: avoid promoting too frequently for the same technique
      const lastPromotion = lastPromotionRef.current[technique.id] || 0;
      const now = Date.now();
      if (now - lastPromotion < 30000) continue; // 30 second cooldown

      const result = await promoteForTechnique(
        technique.id,
        technique.name,
        queueJobs,
        readyJobs.length
      );

      if (result.promotedCount > 0) {
        lastPromotionRef.current[technique.id] = now;
        results.push(result);
      }
    }

    if (results.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      if (showToasts) {
        const totalPromoted = results.reduce((sum, r) => sum + r.promotedCount, 0);
        const techniqueNames = results.map(r => r.techniqueName).join(', ');
        toast.success(`${totalPromoted} job(s) promovido(s) automaticamente`, {
          description: `Buffer reabastecido para: ${techniqueNames}`,
        });
      }
    }

    return results;
  }, [jobs, techniques, promoteForTechnique, queryClient, showToasts]);

  // Manual trigger
  const triggerPromotion = useCallback(async () => {
    return checkAndPromoteAll();
  }, [checkAndPromoteAll]);

  // Promote for a specific technique manually
  const promoteForTechniqueManual = useCallback(async (techniqueId: string) => {
    if (!jobs || !techniques) return null;

    const technique = techniques.find(t => t.id === techniqueId);
    if (!technique) return null;

    const techniqueJobs = jobs.filter(j => j.technique_id === techniqueId);
    const readyJobs = techniqueJobs.filter(j => j.status === 'ready');
    const queueJobs = techniqueJobs.filter(j => j.status === 'queue');

    const result = await promoteForTechnique(
      technique.id,
      technique.name,
      queueJobs,
      readyJobs.length
    );

    if (result.promotedCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      if (showToasts) {
        toast.success(`${result.promotedCount} job(s) promovido(s)`, {
          description: `Buffer de ${technique.name} atualizado`,
        });
      }
    } else if (showToasts) {
      if (readyJobs.length >= BUFFER_TARGET) {
        toast.info(`Buffer de ${technique.name} já está completo`);
      } else if (queueJobs.length === 0) {
        toast.warning(`Nenhum job na fila para ${technique.name}`);
      }
    }

    return result;
  }, [jobs, techniques, promoteForTechnique, queryClient, showToasts]);

  // Auto-promotion effect - triggered on job changes
  useEffect(() => {
    if (!enabled || !jobs || !techniques) return;

    // Debounce check
    const timeoutId = setTimeout(() => {
      checkAndPromoteAll();
    }, 2000); // 2 second delay to batch changes

    return () => clearTimeout(timeoutId);
  }, [enabled, jobs?.length, checkAndPromoteAll]);

  // Subscribe to job status changes
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('auto-buffer-promotion')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: "status=eq.finished"
        },
        async () => {
          // When a job finishes, check if we need to promote
          await checkAndPromoteAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, checkAndPromoteAll]);

  return {
    triggerPromotion,
    promoteForTechnique: promoteForTechniqueManual,
    isPromoting: promoteJobMutation.isPending,
    bufferTarget: BUFFER_TARGET,
  };
}
