import { useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs, useMachines, useTechniques, DbJob, DbMachine, DbTechnique } from './useJobs';
import { toast } from 'sonner';
import { showErrorToast, createAppError } from '@/lib/errorHandling';

const SEQUENCING_ERROR_CONTEXT = {
  applySequencing: { entity: 'jobs', operation: 'apply_sequencing' },
  applyAllSequencing: { entity: 'jobs', operation: 'apply_all_sequencing' },
};

export interface SequencingSuggestion {
  id: string;
  machineId: string;
  machineName: string;
  machineCode: string;
  techniqueId: string;
  techniqueName: string;
  currentSequence: DbJob[];
  optimizedSequence: DbJob[];
  estimatedSavings: number; // minutes saved
  colorGroups: ColorGroup[];
  bottleneckRisk: 'low' | 'medium' | 'high';
  totalMinutes: number;
  currentChanges: number;
  optimizedChanges: number;
  totalQuantity: number;
  aiPriorityScore: number;
  setupComplexity: 'low' | 'medium' | 'high';
}

export interface ColorGroup {
  color: string;
  jobs: DbJob[];
  jobCount: number;
}

export interface ApplySequencingResult {
  machineId: string;
  machineName: string;
  appliedJobs: number;
  estimatedSavings: number;
}

function normalizeColor(color: string | null): string {
  if (!color) return 'sem-cor';
  return color.toLowerCase().trim().replace(/\s+/g, '-');
}

function countSequenceChanges(jobs: DbJob[]): number {
  let changes = 0;
  for (let i = 1; i < jobs.length; i++) {
    if (normalizeColor(jobs[i].gravure_color) !== normalizeColor(jobs[i - 1].gravure_color)) {
      changes++;
    }
  }
  return changes;
}

function calculateSetupSavings(currentChanges: number, optimizedChanges: number, setupTime: number): number {
  return (currentChanges - optimizedChanges) * setupTime;
}

function generateTimeSlots(startHour: number, jobs: DbJob[]): { jobId: string; startTime: string; endTime: string }[] {
  const slots: { jobId: string; startTime: string; endTime: string }[] = [];
  let currentMinutes = startHour * 60;
  
  for (const job of jobs) {
    const startHours = Math.floor(currentMinutes / 60);
    const startMins = currentMinutes % 60;
    const startTime = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`;
    
    currentMinutes += job.estimated_duration;
    
    const endHours = Math.floor(currentMinutes / 60);
    const endMins = currentMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    
    slots.push({ jobId: job.id, startTime, endTime });
  }
  
  return slots;
}

export function useSmartSequencingWithActions() {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();
  const queryClient = useQueryClient();

  // Mutation to apply sequencing for a machine (parallel execution)
  const applySequencingMutation = useMutation({
    mutationFn: async (suggestion: SequencingSuggestion): Promise<ApplySequencingResult> => {
      try {
        const timeSlots = generateTimeSlots(7, suggestion.optimizedSequence); // Start at 07:00
        
        // Execute all updates in parallel
        const results = await Promise.all(
          timeSlots.map(async (slot) => {
            const { error } = await supabase
              .from('jobs')
              .update({ 
                start_time: slot.startTime,
                end_time: slot.endTime 
              })
              .eq('id', slot.jobId);
            
            if (error) throw error;
            return slot;
          })
        );
        
        return {
          machineId: suggestion.machineId,
          machineName: suggestion.machineName,
          appliedJobs: results.length,
          estimatedSavings: suggestion.estimatedSavings,
        };
      } catch (error) {
        const appError = createAppError(error, SEQUENCING_ERROR_CONTEXT.applySequencing);
        if (import.meta.env.DEV) console.error('[applySequencing]', appError);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(`Sequência otimizada aplicada`, {
        description: `${result.machineName}: ${result.appliedJobs} jobs reordenados, ~${result.estimatedSavings}min economizados`,
      });
    },
    onError: (error, suggestion) => {
      showErrorToast(error, `Erro ao aplicar sequência para ${suggestion.machineName}`);
    },
  });

  // Mutation to apply all sequencing suggestions (parallel execution)
  const applyAllSequencingMutation = useMutation({
    mutationFn: async (suggestions: SequencingSuggestion[]): Promise<ApplySequencingResult[]> => {
      // Process all suggestions in parallel
      const results = await Promise.all(
        suggestions.map(async (suggestion): Promise<ApplySequencingResult | null> => {
          try {
            const timeSlots = generateTimeSlots(7, suggestion.optimizedSequence);
            
            // Execute all slot updates in parallel for this suggestion
            await Promise.all(
              timeSlots.map(async (slot) => {
                const { error } = await supabase
                  .from('jobs')
                  .update({ 
                    start_time: slot.startTime,
                    end_time: slot.endTime 
                  })
                  .eq('id', slot.jobId);
                
                if (error) throw error;
              })
            );
            
            return {
              machineId: suggestion.machineId,
              machineName: suggestion.machineName,
              appliedJobs: timeSlots.length,
              estimatedSavings: suggestion.estimatedSavings,
            };
          } catch (error) {
            const appError = createAppError(error, SEQUENCING_ERROR_CONTEXT.applyAllSequencing);
            if (import.meta.env.DEV) console.error(`[applyAllSequencing] Failed for ${suggestion.machineName}:`, appError);
            return null;
          }
        })
      );
      
      // Filter out failed results
      return results.filter((r): r is ApplySequencingResult => r !== null);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      if (results.length > 0) {
        const totalJobs = results.reduce((sum, r) => sum + r.appliedJobs, 0);
        const totalSavings = results.reduce((sum, r) => sum + r.estimatedSavings, 0);
        toast.success(`${results.length} máquina(s) otimizada(s)`, {
          description: `${totalJobs} jobs reordenados, ~${totalSavings}min economizados`,
        });
      } else {
        toast.error('Nenhuma máquina foi otimizada');
      }
    },
    onError: (error) => {
      showErrorToast(error, 'Erro ao otimizar sequências');
    },
  });

  const suggestions = useMemo(() => {
    if (!jobs || !machines || !techniques) return [];

    const result: SequencingSuggestion[] = [];
    const today = new Date();
    
    if (!today || isNaN(today.getTime())) {
      if (import.meta.env.DEV) console.warn('[useSmartSequencingWithActions] Invalid current date');
      return [];
    }
    
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    let suggestionId = 0;

    const jobsByMachine = new Map<string, DbJob[]>();
    
    jobs.forEach(job => {
      if (!job.machine_id || !job.scheduled_date) return;
      if (!['scheduled', 'ready', 'queue'].includes(job.status)) return;
      
      const jobDate = new Date(job.scheduled_date);
      if (isNaN(jobDate.getTime())) return;
      
      jobDate.setHours(0, 0, 0, 0);
      
      if (jobDate < today || jobDate > tomorrow) return;

      const existing = jobsByMachine.get(job.machine_id) || [];
      existing.push(job);
      jobsByMachine.set(job.machine_id, existing);
    });

    jobsByMachine.forEach((machineJobs, machineId) => {
      if (machineJobs.length < 2) return;

      const machine = machines.find(m => m.id === machineId);
      if (!machine) return;

      const technique = techniques.find(t => t.id === machine.technique_id);
      if (!technique) return;

      const currentSequence = [...machineJobs].sort((a, b) => 
        (a.start_time || '').localeCompare(b.start_time || '')
      );

      const colorGroups = new Map<string, DbJob[]>();
      machineJobs.forEach(job => {
        const color = normalizeColor(job.gravure_color);
        const group = colorGroups.get(color) || [];
        group.push(job);
        colorGroups.set(color, group);
      });

      const optimizedSequence: DbJob[] = [];
      const sortedColorGroups = Array.from(colorGroups.entries())
        .sort((a, b) => b[1].length - a[1].length);

      sortedColorGroups.forEach(([_, groupJobs]) => {
        const sortedGroup = groupJobs.sort((a, b) => {
          const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          const priorityA = priorityOrder[a.priority] ?? 2;
          const priorityB = priorityOrder[b.priority] ?? 2;
          return priorityA - priorityB;
        });
        optimizedSequence.push(...sortedGroup);
      });

      const currentChanges = countSequenceChanges(currentSequence);
      const optimizedChanges = countSequenceChanges(optimizedSequence);
      const estimatedSavings = calculateSetupSavings(currentChanges, optimizedChanges, technique.setup_time);
      const totalMinutes = optimizedSequence.reduce((acc, job) => acc + (job.estimated_duration || 0), 0);
      const totalQuantity = optimizedSequence.reduce((acc, job) => acc + (job.quantity || 0), 0);
      
      // Use dynamic thresholds from technique
      const lowT = technique.low_threshold || 300;
      const medT = technique.medium_threshold || 480;
      const highT = technique.high_threshold || 600;
      
      const bottleneckRisk = totalMinutes > medT ? 'high' : totalMinutes > lowT ? 'medium' : 'low';

      if (estimatedSavings > 0) {
        result.push({
          id: `seq-${++suggestionId}`,
          machineId,
          machineName: machine.name,
          machineCode: machine.code,
          techniqueId: machine.technique_id,
          techniqueName: technique.name,
          currentSequence,
          optimizedSequence,
          currentChanges,
          optimizedChanges,
          estimatedSavings,
          totalQuantity,
          bottleneckRisk,
          totalMinutes,
          colorGroups: Array.from(colorGroups.entries()).map(([color, jobs]) => ({
            color,
            jobs,
            jobCount: jobs.length
          }))
        });
      }
    });

    return result.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }, [jobs, machines, techniques]);

  // Apply sequencing for a single machine
  const applySequencing = useCallback((suggestion: SequencingSuggestion) => {
    return applySequencingMutation.mutateAsync(suggestion);
  }, [applySequencingMutation]);

  // Apply all sequencing suggestions
  const applyAllSequencing = useCallback(() => {
    if (suggestions.length === 0) {
      toast.info('Nenhuma sugestão de sequenciamento disponível');
      return Promise.resolve([]);
    }
    return applyAllSequencingMutation.mutateAsync(suggestions);
  }, [suggestions, applyAllSequencingMutation]);

  return {
    suggestions,
    totalSavings: suggestions.reduce((acc, s) => acc + s.estimatedSavings, 0),
    hasSuggestions: suggestions.length > 0,
    applySequencing,
    applyAllSequencing,
    isApplying: applySequencingMutation.isPending || applyAllSequencingMutation.isPending,
  };
}
