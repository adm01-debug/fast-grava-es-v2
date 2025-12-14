import { useMemo } from 'react';
import { useJobs, DbJob } from './useJobs';

export interface StuckJob {
  job: DbJob;
  hoursInProduction: number;
  severity: 'warning' | 'critical';
  message: string;
}

const WARNING_HOURS = 8; // Alert after 8 hours in production
const CRITICAL_HOURS = 24; // Critical after 24 hours

export function useStuckJobsDetection() {
  const { data: jobs } = useJobs();

  const stuckJobs = useMemo(() => {
    if (!jobs) return [];

    const now = new Date();
    const result: StuckJob[] = [];

    jobs.forEach(job => {
      if (job.status === 'production' && job.actual_start_time) {
        const startTime = new Date(job.actual_start_time);
        const hoursInProduction = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        if (hoursInProduction >= CRITICAL_HOURS) {
          result.push({
            job,
            hoursInProduction,
            severity: 'critical',
            message: `Job ${job.order_number} está em produção há ${Math.round(hoursInProduction)} horas! Verificar se não está travado.`
          });
        } else if (hoursInProduction >= WARNING_HOURS) {
          result.push({
            job,
            hoursInProduction,
            severity: 'warning',
            message: `Job ${job.order_number} está em produção há ${Math.round(hoursInProduction)} horas.`
          });
        }
      }
    });

    return result.sort((a, b) => b.hoursInProduction - a.hoursInProduction);
  }, [jobs]);

  return {
    stuckJobs,
    criticalCount: stuckJobs.filter(s => s.severity === 'critical').length,
    warningCount: stuckJobs.filter(s => s.severity === 'warning').length,
    hasStuckJobs: stuckJobs.length > 0,
  };
}
