import { useMemo } from 'react';
import { useJobs, useMachines } from './useJobs';
import { parseISO, parse, isValid, areIntervalsOverlapping } from 'date-fns';

export interface SchedulingConflict {
  id: string;
  machineId: string;
  machineName: string;
  machineCode: string;
  date: Date;
  jobs: ConflictingJob[];
  severity: 'warning' | 'error';
}

export interface ConflictingJob {
  id: string;
  orderNumber: string;
  client: string;
  product: string;
  startTime: string;
  endTime: string;
  status: string;
}

export const useSchedulingConflicts = () => {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();

  const conflicts = useMemo(() => {
    if (!jobs || !machines) return [];

    const detectedConflicts: SchedulingConflict[] = [];
    
    // Filter only scheduled jobs (not finished, cancelled, etc.)
    const activeStatuses = ['scheduled', 'ready', 'production'];
    const activeJobs = jobs.filter(job => 
      activeStatuses.includes(job.status) && 
      job.scheduled_date && 
      job.start_time && 
      job.end_time &&
      job.machine_id
    );

    // Group jobs by machine and date
    const jobsByMachineAndDate = new Map<string, typeof activeJobs>();
    
    activeJobs.forEach(job => {
      const key = `${job.machine_id}-${job.scheduled_date}`;
      const existing = jobsByMachineAndDate.get(key) || [];
      existing.push(job);
      jobsByMachineAndDate.set(key, existing);
    });

    // Check for overlaps within each group
    jobsByMachineAndDate.forEach((groupJobs, key) => {
      if (groupJobs.length < 2) return;

      const [machineId, dateStr] = key.split('-').slice(0, 2);
      const actualMachineId = key.substring(0, key.lastIndexOf('-' + dateStr.split('-')[0]));
      const actualDateStr = key.substring(actualMachineId.length + 1);
      
      const machine = machines.find(m => m.id === actualMachineId);
      if (!machine) return;

      const date = parseISO(actualDateStr);
      if (!isValid(date)) return;

      const conflictingJobs: ConflictingJob[] = [];

      // Compare each pair of jobs
      for (let i = 0; i < groupJobs.length; i++) {
        for (let j = i + 1; j < groupJobs.length; j++) {
          const job1 = groupJobs[i];
          const job2 = groupJobs[j];

          try {
            const start1 = parse(job1.start_time!, 'HH:mm', date);
            const end1 = parse(job1.end_time!, 'HH:mm', date);
            const start2 = parse(job2.start_time!, 'HH:mm', date);
            const end2 = parse(job2.end_time!, 'HH:mm', date);

            if (!isValid(start1) || !isValid(end1) || !isValid(start2) || !isValid(end2)) continue;

            const hasOverlap = areIntervalsOverlapping(
              { start: start1, end: end1 },
              { start: start2, end: end2 }
            );

            if (hasOverlap) {
              // Add both jobs if not already in list
              if (!conflictingJobs.find(j => j.id === job1.id)) {
                conflictingJobs.push({
                  id: job1.id,
                  orderNumber: job1.order_number,
                  client: job1.client,
                  product: job1.product,
                  startTime: job1.start_time!,
                  endTime: job1.end_time!,
                  status: job1.status
                });
              }
              if (!conflictingJobs.find(j => j.id === job2.id)) {
                conflictingJobs.push({
                  id: job2.id,
                  orderNumber: job2.order_number,
                  client: job2.client,
                  product: job2.product,
                  startTime: job2.start_time!,
                  endTime: job2.end_time!,
                  status: job2.status
                });
              }
            }
          } catch (e) {
            console.error('Error parsing times for conflict detection:', e);
          }
        }
      }

      if (conflictingJobs.length > 0) {
        // Check if any job is in production - that's more severe
        const hasProductionConflict = conflictingJobs.some(j => j.status === 'production');
        
        detectedConflicts.push({
          id: `conflict-${actualMachineId}-${actualDateStr}`,
          machineId: actualMachineId,
          machineName: machine.name,
          machineCode: machine.code,
          date,
          jobs: conflictingJobs.sort((a, b) => a.startTime.localeCompare(b.startTime)),
          severity: hasProductionConflict ? 'error' : 'warning'
        });
      }
    });

    return detectedConflicts.sort((a, b) => {
      // Sort by severity first, then by date
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      return a.date.getTime() - b.date.getTime();
    });
  }, [jobs, machines]);

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    errorCount: conflicts.filter(c => c.severity === 'error').length,
    warningCount: conflicts.filter(c => c.severity === 'warning').length
  };
};
