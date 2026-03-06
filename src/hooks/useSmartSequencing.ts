import { useMemo } from 'react';
import { useJobs, useMachines, useTechniques, DbJob, DbMachine, DbTechnique } from './useJobs';

// Data validation helpers
function isValidJob(job: DbJob): boolean {
  return (
    typeof job.id === 'string' && job.id.length > 0 &&
    typeof job.status === 'string' &&
    typeof job.estimated_duration === 'number' && job.estimated_duration >= 0
  );
}

function isValidMachine(machine: DbMachine): boolean {
  return (
    typeof machine.id === 'string' && machine.id.length > 0 &&
    typeof machine.technique_id === 'string' &&
    typeof machine.name === 'string'
  );
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

export interface SequencingSuggestion {
  machineId: string;
  machineName: string;
  machineCode: string;
  techniqueId: string;
  techniqueName: string;
  currentSequence: DbJob[];
  optimizedSequence: DbJob[];
  estimatedSavings: number; // minutes saved
  colorGroups: ColorGroup[];
}

export interface ColorGroup {
  color: string;
  jobs: DbJob[];
  jobCount: number;
}

function normalizeColor(color: string | null): string {
  if (!color) return 'sem-cor';
  return color.toLowerCase().trim().replace(/\s+/g, '-');
}

function calculateSetupSavings(currentSequence: DbJob[], optimizedSequence: DbJob[], setupTime: number): number {
  const countColorChanges = (jobs: DbJob[]): number => {
    let changes = 0;
    for (let i = 1; i < jobs.length; i++) {
      if (normalizeColor(jobs[i].gravure_color) !== normalizeColor(jobs[i - 1].gravure_color)) {
        changes++;
      }
    }
    return changes;
  };

  const currentChanges = countColorChanges(currentSequence);
  const optimizedChanges = countColorChanges(optimizedSequence);
  
  return (currentChanges - optimizedChanges) * setupTime;
}

export function useSmartSequencing() {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();

  const suggestions = useMemo(() => {
    if (!jobs || !machines || !techniques) return [];

    // Validate input data
    const validJobs = jobs.filter(isValidJob);
    const validMachines = machines.filter(isValidMachine);
    const validTechniques = techniques.filter(t =>
      typeof t.id === 'string' && typeof t.name === 'string' && typeof t.setup_time === 'number'
    );

    if (validJobs.length === 0 && jobs.length > 0) {
      if (import.meta.env.DEV) console.warn('[useSmartSequencing] All jobs failed validation');
    }

    const result: SequencingSuggestion[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Group scheduled jobs by machine for today and tomorrow
    const jobsByMachine = new Map<string, DbJob[]>();
    
    validJobs.forEach(job => {
      if (!job.machine_id || !job.scheduled_date) return;
      if (!['scheduled', 'ready', 'queue'].includes(job.status)) return;
      
      try {
        const jobDate = new Date(job.scheduled_date);
        if (!isFinite(jobDate.getTime())) return; // Invalid date
        jobDate.setHours(0, 0, 0, 0);
        
        if (jobDate < today || jobDate > tomorrow) return;

        const existing = jobsByMachine.get(job.machine_id) || [];
        existing.push(job);
        jobsByMachine.set(job.machine_id, existing);
      } catch {
        // Skip jobs with invalid dates
      }
    });

    // Analyze each machine
    jobsByMachine.forEach((machineJobs, machineId) => {
      if (machineJobs.length < 2) return;

      const machine = validMachines.find(m => m.id === machineId);
      if (!machine) return;

      const technique = validTechniques.find(t => t.id === machine.technique_id);
      if (!technique) return;

      const setupTime = sanitizeNumber(technique.setup_time, 10);

      // Current sequence (by start time)
      const currentSequence = [...machineJobs].sort((a, b) => 
        (a.start_time || '').localeCompare(b.start_time || '')
      );

      // Group by color
      const colorGroups = new Map<string, DbJob[]>();
      machineJobs.forEach(job => {
        const color = normalizeColor(job.gravure_color);
        const group = colorGroups.get(color) || [];
        group.push(job);
        colorGroups.set(color, group);
      });

      // Create optimized sequence (grouped by color, maintaining priority within groups)
      const optimizedSequence: DbJob[] = [];
      const sortedColorGroups = Array.from(colorGroups.entries())
        .sort((a, b) => b[1].length - a[1].length); // Larger groups first

      sortedColorGroups.forEach(([_, groupJobs]) => {
        const sortedGroup = groupJobs.sort((a, b) => {
          const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          const priorityA = priorityOrder[a.priority] ?? 2;
          const priorityB = priorityOrder[b.priority] ?? 2;
          return priorityA - priorityB;
        });
        optimizedSequence.push(...sortedGroup);
      });

      const estimatedSavings = calculateSetupSavings(currentSequence, optimizedSequence, setupTime);

      if (estimatedSavings > 0) {
        result.push({
          machineId,
          machineName: machine.name,
          machineCode: machine.code,
          techniqueId: machine.technique_id,
          techniqueName: technique.name,
          currentSequence,
          optimizedSequence,
          estimatedSavings,
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

  return {
    suggestions,
    totalSavings: suggestions.reduce((acc, s) => acc + s.estimatedSavings, 0),
    hasSuggestions: suggestions.length > 0
  };
}
