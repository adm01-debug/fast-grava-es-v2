import { useEffect, useRef } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Proactively detects jobs that are approaching or exceeding their estimated duration
 * and alerts coordinators BEFORE the job becomes officially delayed.
 *
 * Checks every 2 minutes for:
 * - Jobs in production exceeding 80% of estimated time (warning)
 * - Jobs in production exceeding 100% of estimated time (critical - auto-marks as delayed)
 */
export function useSmartDelayAlerts() {
  const { user } = useAuth();
  const { jobs } = useSchedulingData();
  const { add } = useNotificationsContext();
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const checkDelays = async () => {
      const now = new Date();

      for (const job of jobs) {
        if (job.status !== 'production' || !job.actual_start_time) continue;

        const startTime = new Date(job.actual_start_time);
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / 60000;
        const ratio = elapsedMinutes / job.estimated_duration;

        // Warning at 80%
        if (ratio >= 0.8 && ratio < 1.0) {
          const key = `warn-${job.id}`;
          if (alertedRef.current.has(key)) continue;
          alertedRef.current.add(key);

          const remaining = Math.round(job.estimated_duration - elapsedMinutes);
          add({
            title: '⏰ Atenção: Tempo se esgotando',
            message: `${job.order_number} - ${job.product} tem ~${remaining}min restantes`,
            type: 'warning',
            href: '/',
          });
        }

        // Critical at 100% — auto-mark as delayed
        if (ratio >= 1.0) {
          const key = `critical-${job.id}`;
          if (alertedRef.current.has(key)) continue;
          alertedRef.current.add(key);

          const overtime = Math.round(elapsedMinutes - job.estimated_duration);
          add({
            title: '🚨 Job Excedeu Tempo Estimado!',
            message: `${job.order_number} está ${overtime}min além do previsto`,
            type: 'error',
            href: '/alerts',
          });

          // Auto-mark as delayed
          await supabase
            .from('jobs')
            .update({ status: 'delayed' })
            .eq('id', job.id);
        }
      }

      // Cleanup old alerts
      if (alertedRef.current.size > 300) {
        const arr = Array.from(alertedRef.current);
        alertedRef.current = new Set(arr.slice(-150));
      }
    };

    checkDelays();
    const interval = setInterval(checkDelays, 2 * 60 * 1000); // every 2 min

    return () => clearInterval(interval);
  }, [user, jobs, add]);
}
