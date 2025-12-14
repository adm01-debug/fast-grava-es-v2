import { useMemo } from 'react';
import { useSchedulingData } from './useSchedulingData';

export function useAlertCount() {
  const { jobs } = useSchedulingData();

  const alertCount = useMemo(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    let count = 0;

    jobs.forEach(job => {
      // Delayed jobs
      if (job.status === 'delayed') {
        count++;
        return;
      }

      // Rework jobs
      if (job.status === 'rework') {
        count++;
        return;
      }

      // Jobs in production past their end time
      if (job.status === 'production' && job.end_time && job.scheduled_date === today) {
        if (job.end_time < currentTime) {
          count++;
        }
      }
    });

    return count;
  }, [jobs]);

  return alertCount;
}
