import { useEffect, useRef } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Automatically escalates job priority based on rules:
 * - Jobs scheduled for today that are still in 'queue' → escalate to 'high'
 * - Jobs past their scheduled date → escalate to 'urgent' and notify
 *
 * Runs every 5 minutes.
 */
export function usePriorityEscalation() {
  const { user } = useAuth();
  const { jobs } = useSchedulingData();
  const { add } = useNotificationsContext();
  const escalatedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const checkEscalation = async () => {
      const today = new Date().toISOString().split('T')[0];

      for (const job of jobs) {
        if (['finished', 'cancelled', 'production'].includes(job.status)) continue;
        if (escalatedRef.current.has(job.id)) continue;

        const isOverdue = job.scheduled_date && job.scheduled_date < today;
        const isDueToday = job.scheduled_date === today;

        // Overdue jobs → escalate to urgent
        if (isOverdue && job.priority !== 'urgent') {
          escalatedRef.current.add(job.id);

          await supabase
            .from('jobs')
            .update({ priority: 'urgent' })
            .eq('id', job.id);

          add({
            title: '🔺 Prioridade Escalada',
            message: `${job.order_number} passou da data agendada — prioridade alterada para URGENTE`,
            type: 'warning',
            href: '/',
          });
        }

        // Today's queue jobs → escalate to high (if medium or low)
        if (isDueToday && job.status === 'queue' && ['medium', 'low'].includes(job.priority)) {
          escalatedRef.current.add(job.id);

          await supabase
            .from('jobs')
            .update({ priority: 'high' })
            .eq('id', job.id);

          add({
            title: '📋 Prioridade Atualizada',
            message: `${job.order_number} agendado para hoje — prioridade elevada para ALTA`,
            type: 'info',
          });
        }
      }

      // Cleanup
      if (escalatedRef.current.size > 200) {
        const arr = Array.from(escalatedRef.current);
        escalatedRef.current = new Set(arr.slice(-100));
      }
    };

    checkEscalation();
    const interval = setInterval(checkEscalation, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, jobs, add]);
}
