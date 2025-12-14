import { useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs, useMachines, useTechniques, DbJob, DbMachine, DbTechnique } from './useJobs';
import { toast } from 'sonner';
import { parseISO, format, isValid } from 'date-fns';
import { showErrorToast, createAppError } from '@/lib/errorHandling';

const LOAD_BALANCING_ERROR_CONTEXT = {
  applySuggestion: { entity: 'jobs', operation: 'apply_load_balancing' },
  applyMultiple: { entity: 'jobs', operation: 'apply_multiple_load_balancing' },
};

export interface MachineLoad {
  machine: DbMachine;
  technique: DbTechnique;
  scheduledMinutes: number;
  availableMinutes: number;
  occupancyRate: number;
  jobCount: number;
  jobs: DbJob[];
}

export interface LoadBalancingSuggestion {
  id: string;
  jobId: string;
  orderNumber: string;
  client: string;
  product: string;
  estimatedDuration: number;
  currentMachineId: string;
  currentMachineName: string;
  suggestedMachineId: string;
  suggestedMachineName: string;
  currentLoad: number;
  suggestedLoad: number;
  loadDifference: number;
}

export interface TechniqueLoadSummary {
  technique: DbTechnique;
  machines: MachineLoad[];
  averageOccupancy: number;
  maxOccupancy: number;
  minOccupancy: number;
  isUnbalanced: boolean;
  suggestions: LoadBalancingSuggestion[];
}

export interface ApplySuggestionResult {
  success: boolean;
  jobId: string;
  orderNumber: string;
  fromMachine: string;
  toMachine: string;
}

const DAILY_CAPACITY_MINUTES = 11 * 60; // 07:00 - 18:00 = 11 hours

export function useLoadBalancingWithActions(targetDate?: Date) {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();
  const queryClient = useQueryClient();

  // Mutation to apply a single suggestion
  const applySuggestionMutation = useMutation({
    mutationFn: async (suggestion: LoadBalancingSuggestion): Promise<ApplySuggestionResult> => {
      try {
        const { error } = await supabase
          .from('jobs')
          .update({ machine_id: suggestion.suggestedMachineId })
          .eq('id', suggestion.jobId);
        
        if (error) throw error;
        
        return {
          success: true,
          jobId: suggestion.jobId,
          orderNumber: suggestion.orderNumber,
          fromMachine: suggestion.currentMachineName,
          toMachine: suggestion.suggestedMachineName,
        };
      } catch (error) {
        const appError = createAppError(error, LOAD_BALANCING_ERROR_CONTEXT.applySuggestion);
        if (import.meta.env.DEV) console.error('[applySuggestion]', appError);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(`Job ${result.orderNumber} movido`, {
        description: `${result.fromMachine} → ${result.toMachine}`,
      });
    },
    onError: (error, suggestion) => {
      showErrorToast(error, `Erro ao mover job ${suggestion.orderNumber}`);
    },
  });

  // Mutation to apply multiple suggestions
  const applyMultipleSuggestionsMutation = useMutation({
    mutationFn: async (suggestions: LoadBalancingSuggestion[]): Promise<ApplySuggestionResult[]> => {
      const results: ApplySuggestionResult[] = [];
      
      for (const suggestion of suggestions) {
        try {
          const { error } = await supabase
            .from('jobs')
            .update({ machine_id: suggestion.suggestedMachineId })
            .eq('id', suggestion.jobId);
          
          if (error) throw error;
          
          results.push({
            success: true,
            jobId: suggestion.jobId,
            orderNumber: suggestion.orderNumber,
            fromMachine: suggestion.currentMachineName,
            toMachine: suggestion.suggestedMachineName,
          });
        } catch (error) {
          const appError = createAppError(error, LOAD_BALANCING_ERROR_CONTEXT.applyMultiple);
          if (import.meta.env.DEV) console.error('[applyMultipleSuggestions]', appError);
          results.push({
            success: false,
            jobId: suggestion.jobId,
            orderNumber: suggestion.orderNumber,
            fromMachine: suggestion.currentMachineName,
            toMachine: suggestion.suggestedMachineName,
          });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0 && failed === 0) {
        toast.success(`${successful} job(s) redistribuído(s) com sucesso`);
      } else if (successful > 0 && failed > 0) {
        toast.warning(`${successful} sucesso, ${failed} falha(s)`);
      } else {
        toast.error('Nenhum job foi redistribuído');
      }
    },
    onError: (error) => {
      showErrorToast(error, 'Erro ao redistribuir jobs');
    },
  });

  const analysis = useMemo(() => {
    if (!jobs || !machines || !techniques) {
      return { byTechnique: [], suggestions: [], isLoading: true };
    }

    const date = targetDate || new Date();
    const dateStr = format(date, 'yyyy-MM-dd');

    // Calculate load per machine
    const machineLoads = new Map<string, MachineLoad>();

    machines.forEach(machine => {
      const technique = techniques.find(t => t.id === machine.technique_id);
      if (!technique) return;

      machineLoads.set(machine.id, {
        machine,
        technique,
        scheduledMinutes: 0,
        availableMinutes: DAILY_CAPACITY_MINUTES,
        occupancyRate: 0,
        jobCount: 0,
        jobs: []
      });
    });

    // Assign jobs to machines
    jobs.forEach(job => {
      if (!job.machine_id || !job.scheduled_date) return;
      if (['finished', 'cancelled'].includes(job.status)) return;

      const jobDate = job.scheduled_date;
      if (jobDate !== dateStr) return;

      const load = machineLoads.get(job.machine_id);
      if (!load) return;

      load.scheduledMinutes += job.estimated_duration;
      load.jobCount++;
      load.jobs.push(job);
    });

    // Calculate occupancy rates
    machineLoads.forEach(load => {
      load.occupancyRate = Math.min(100, (load.scheduledMinutes / DAILY_CAPACITY_MINUTES) * 100);
      load.availableMinutes = Math.max(0, DAILY_CAPACITY_MINUTES - load.scheduledMinutes);
    });

    // Group by technique and find imbalances
    const techniqueMap = new Map<string, TechniqueLoadSummary>();
    let suggestionCounter = 0;

    techniques.forEach(technique => {
      const techniqueMachines = Array.from(machineLoads.values())
        .filter(l => l.technique.id === technique.id);

      if (techniqueMachines.length === 0) return;

      const occupancies = techniqueMachines.map(m => m.occupancyRate);
      const avgOccupancy = occupancies.reduce((a, b) => a + b, 0) / occupancies.length;
      const maxOccupancy = Math.max(...occupancies);
      const minOccupancy = Math.min(...occupancies);
      const isUnbalanced = maxOccupancy - minOccupancy > 30;

      // Generate suggestions for unbalanced techniques
      const suggestions: LoadBalancingSuggestion[] = [];

      if (isUnbalanced) {
        // Find overloaded machines and underloaded ones
        const overloaded = techniqueMachines
          .filter(m => m.occupancyRate > avgOccupancy + 15)
          .sort((a, b) => b.occupancyRate - a.occupancyRate);

        const underloaded = techniqueMachines
          .filter(m => m.occupancyRate < avgOccupancy - 15 && m.availableMinutes > 60)
          .sort((a, b) => a.occupancyRate - b.occupancyRate);

        overloaded.forEach(overMachine => {
          // Get movable jobs (not in production, not urgent priority)
          const movableJobs = overMachine.jobs.filter(j => 
            !['production', 'finished'].includes(j.status) && 
            j.priority !== 'urgent'
          );

          movableJobs.forEach(job => {
            const bestTarget = underloaded.find(m => 
              m.availableMinutes >= job.estimated_duration
            );

            if (bestTarget) {
              suggestions.push({
                id: `suggestion-${++suggestionCounter}`,
                jobId: job.id,
                orderNumber: job.order_number,
                client: job.client,
                product: job.product,
                estimatedDuration: job.estimated_duration,
                currentMachineId: overMachine.machine.id,
                currentMachineName: overMachine.machine.name,
                suggestedMachineId: bestTarget.machine.id,
                suggestedMachineName: bestTarget.machine.name,
                currentLoad: overMachine.occupancyRate,
                suggestedLoad: bestTarget.occupancyRate,
                loadDifference: overMachine.occupancyRate - bestTarget.occupancyRate
              });
            }
          });
        });
      }

      // Sort suggestions by load difference (most impactful first)
      const sortedSuggestions = suggestions.sort((a, b) => b.loadDifference - a.loadDifference);

      techniqueMap.set(technique.id, {
        technique,
        machines: techniqueMachines.sort((a, b) => b.occupancyRate - a.occupancyRate),
        averageOccupancy: avgOccupancy,
        maxOccupancy,
        minOccupancy,
        isUnbalanced,
        suggestions: sortedSuggestions
      });
    });

    const allSuggestions = Array.from(techniqueMap.values())
      .flatMap(t => t.suggestions)
      .sort((a, b) => b.loadDifference - a.loadDifference);

    return {
      byTechnique: Array.from(techniqueMap.values()),
      suggestions: allSuggestions,
      isLoading: false
    };
  }, [jobs, machines, techniques, targetDate]);

  // Apply a single suggestion
  const applySuggestion = useCallback((suggestion: LoadBalancingSuggestion) => {
    return applySuggestionMutation.mutateAsync(suggestion);
  }, [applySuggestionMutation]);

  // Apply all suggestions for a technique
  const applyAllForTechnique = useCallback((techniqueId: string) => {
    const techSummary = analysis.byTechnique.find(t => t.technique.id === techniqueId);
    if (!techSummary || techSummary.suggestions.length === 0) {
      toast.info('Nenhuma sugestão para aplicar');
      return Promise.resolve([]);
    }
    return applyMultipleSuggestionsMutation.mutateAsync(techSummary.suggestions);
  }, [analysis.byTechnique, applyMultipleSuggestionsMutation]);

  // Apply all suggestions
  const applyAllSuggestions = useCallback(() => {
    if (analysis.suggestions.length === 0) {
      toast.info('Nenhuma sugestão de balanceamento disponível');
      return Promise.resolve([]);
    }
    return applyMultipleSuggestionsMutation.mutateAsync(analysis.suggestions);
  }, [analysis.suggestions, applyMultipleSuggestionsMutation]);

  return {
    ...analysis,
    applySuggestion,
    applyAllForTechnique,
    applyAllSuggestions,
    isApplying: applySuggestionMutation.isPending || applyMultipleSuggestionsMutation.isPending,
  };
}
