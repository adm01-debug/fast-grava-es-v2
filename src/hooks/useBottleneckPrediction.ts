import { useMemo } from 'react';
import { useJobs, useMachines, useTechniques, DbJob, DbTechnique } from './useJobs';
import { format, addDays, parseISO } from 'date-fns';

export interface BottleneckAlert {
  id: string;
  techniqueId: string;
  techniqueName: string;
  techniqueColor: string;
  severity: 'critical' | 'warning' | 'info';
  date: Date;
  dateLabel: string;
  currentCapacity: number; // percentage used
  projectedCapacity: number; // percentage if pending jobs added
  machineCount: number;
  jobCount: number;
  pendingJobCount: number;
  message: string;
  recommendation: string;
}

export interface TechniqueCapacity {
  technique: DbTechnique;
  date: Date;
  totalCapacityMinutes: number;
  usedMinutes: number;
  pendingMinutes: number;
  occupancyRate: number;
  projectedOccupancy: number;
  machineCount: number;
  scheduledJobs: number;
  pendingJobs: number;
}

const DAILY_CAPACITY_MINUTES = 11 * 60; // 07:00 - 18:00
const CRITICAL_THRESHOLD = 90;
const WARNING_THRESHOLD = 75;
const DAYS_AHEAD = 5;

export function useBottleneckPrediction() {
  const { data: jobs } = useJobs();
  const { data: machines } = useMachines();
  const { data: techniques } = useTechniques();

  const analysis = useMemo(() => {
    if (!jobs || !machines || !techniques) {
      return { alerts: [], capacityByDate: [], isLoading: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alerts: BottleneckAlert[] = [];
    const capacityByDate: TechniqueCapacity[] = [];

    // Analyze each day
    for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
      const targetDate = addDays(today, dayOffset);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const dateLabel = dayOffset === 0 ? 'Hoje' : 
                        dayOffset === 1 ? 'Amanhã' : 
                        format(targetDate, 'dd/MM');

      // Analyze each technique
      techniques.forEach(technique => {
        const techniqueMachines = machines.filter(m => m.technique_id === technique.id);
        const machineCount = techniqueMachines.length;
        
        if (machineCount === 0) return;

        const totalCapacityMinutes = machineCount * DAILY_CAPACITY_MINUTES;

        // Get scheduled jobs for this technique and date
        const scheduledJobs = jobs.filter(job => 
          job.technique_id === technique.id &&
          job.scheduled_date === dateStr &&
          !['finished', 'cancelled'].includes(job.status)
        );

        // Get pending jobs (queue/ready without scheduled date)
        const pendingJobs = jobs.filter(job => 
          job.technique_id === technique.id &&
          ['queue', 'ready'].includes(job.status) &&
          !job.scheduled_date
        );

        const usedMinutes = scheduledJobs.reduce((acc, job) => acc + job.estimated_duration, 0);
        const pendingMinutes = pendingJobs.reduce((acc, job) => acc + job.estimated_duration, 0);
        
        const occupancyRate = (usedMinutes / totalCapacityMinutes) * 100;
        const projectedOccupancy = ((usedMinutes + pendingMinutes) / totalCapacityMinutes) * 100;

        capacityByDate.push({
          technique,
          date: targetDate,
          totalCapacityMinutes,
          usedMinutes,
          pendingMinutes,
          occupancyRate,
          projectedOccupancy,
          machineCount,
          scheduledJobs: scheduledJobs.length,
          pendingJobs: pendingJobs.length
        });

        // Generate alerts
        if (occupancyRate >= CRITICAL_THRESHOLD) {
          alerts.push({
            id: `bottleneck-${technique.id}-${dateStr}`,
            techniqueId: technique.id,
            techniqueName: technique.name,
            techniqueColor: technique.color,
            severity: 'critical',
            date: targetDate,
            dateLabel,
            currentCapacity: occupancyRate,
            projectedCapacity: projectedOccupancy,
            machineCount,
            jobCount: scheduledJobs.length,
            pendingJobCount: pendingJobs.length,
            message: `${technique.short_name} está em ${Math.round(occupancyRate)}% de capacidade ${dateLabel.toLowerCase()}`,
            recommendation: `Considere redistribuir ${scheduledJobs.length - Math.floor(scheduledJobs.length * 0.7)} jobs para outras datas ou técnicas alternativas`
          });
        } else if (occupancyRate >= WARNING_THRESHOLD) {
          alerts.push({
            id: `bottleneck-${technique.id}-${dateStr}`,
            techniqueId: technique.id,
            techniqueName: technique.name,
            techniqueColor: technique.color,
            severity: 'warning',
            date: targetDate,
            dateLabel,
            currentCapacity: occupancyRate,
            projectedCapacity: projectedOccupancy,
            machineCount,
            jobCount: scheduledJobs.length,
            pendingJobCount: pendingJobs.length,
            message: `${technique.short_name} aproximando-se da saturação (${Math.round(occupancyRate)}%) ${dateLabel.toLowerCase()}`,
            recommendation: `Monitore novos agendamentos para esta técnica`
          });
        } else if (projectedOccupancy >= CRITICAL_THRESHOLD && dayOffset < 2) {
          alerts.push({
            id: `bottleneck-projected-${technique.id}-${dateStr}`,
            techniqueId: technique.id,
            techniqueName: technique.name,
            techniqueColor: technique.color,
            severity: 'info',
            date: targetDate,
            dateLabel,
            currentCapacity: occupancyRate,
            projectedCapacity: projectedOccupancy,
            machineCount,
            jobCount: scheduledJobs.length,
            pendingJobCount: pendingJobs.length,
            message: `${technique.short_name} pode saturar se ${pendingJobs.length} jobs pendentes forem agendados ${dateLabel.toLowerCase()}`,
            recommendation: `${pendingJobs.length} jobs na fila aguardam agendamento - distribua em datas alternativas`
          });
        }
      });
    }

    // Sort alerts by severity and date
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return a.date.getTime() - b.date.getTime();
    });

    return {
      alerts: sortedAlerts,
      capacityByDate,
      isLoading: false,
      criticalCount: alerts.filter(a => a.severity === 'critical').length,
      warningCount: alerts.filter(a => a.severity === 'warning').length,
      infoCount: alerts.filter(a => a.severity === 'info').length
    };
  }, [jobs, machines, techniques]);

  return analysis;
}
