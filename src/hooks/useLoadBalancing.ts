import { useMemo } from 'react';
import { useJobs, useMachines, useTechniques, DbJob, DbMachine, DbTechnique } from './useJobs';
import { parseISO, format, isValid } from 'date-fns';

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
  jobId: string;
  orderNumber: string;
  client: string;
  currentMachineId: string;
  currentMachineName: string;
  suggestedMachineId: string;
  suggestedMachineName: string;
  currentLoad: number; // percentage
  suggestedLoad: number; // percentage
  loadDifference: number; // percentage points saved
}

export interface TechniqueLoadSummary {
  technique: DbTechnique;
  machines: MachineLoad[];
  averageOccupancy: number;
  maxOccupancy: number;
  minOccupancy: number;
  isUnbalanced: boolean; // > 30% difference between min/max
  suggestions: LoadBalancingSuggestion[];
}

const DAILY_CAPACITY_MINUTES = 11 * 60; // 07:00 - 18:00 = 11 hours

export function useLoadBalancing(targetDate?: Date) {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();

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
                jobId: job.id,
                orderNumber: job.order_number,
                client: job.client,
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
        suggestions: sortedSuggestions // Return all suggestions, not limited to 3
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

  return analysis;
}
