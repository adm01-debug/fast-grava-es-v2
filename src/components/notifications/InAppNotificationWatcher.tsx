import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';

const statusLabels: Record<string, string> = {
  queue: 'Na Fila', ready: 'No Jeito', scheduled: 'Agendado',
  production: 'Em Produção', finished: 'Finalizado', paused: 'Pausado',
  cancelled: 'Cancelado', delayed: 'Atrasado', rework: 'Retrabalho',
};

/**
 * Watches real-time events and pushes them into the in-app NotificationsContext
 * so the notification bell badge + dropdown always stays up to date.
 */
export function InAppNotificationWatcher() {
  const { user } = useAuth();
  const { add } = useNotificationsContext();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Watch job status changes
    const jobChannel = supabase
      .channel('inapp-job-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
      }, (payload) => {
        const newJob = payload.new as Record<string, unknown>;
        const oldJob = payload.old as Record<string, unknown>;

        if (oldJob.status === newJob.status) return;
        const key = `job-${newJob.id}-${newJob.status}`;
        if (notifiedRef.current.has(key)) return;
        notifiedRef.current.add(key);

        const newStatus = newJob.status as string;

        // Delayed jobs - warning
        if (newStatus === 'delayed') {
          add({
            title: 'Job Atrasado!',
            message: `${newJob.order_number} - ${newJob.client} está atrasado`,
            type: 'warning',
            href: '/alerts',
          });
          return;
        }

        // Finished - success
        if (newStatus === 'finished') {
          add({
            title: 'Produção Finalizada',
            message: `${newJob.order_number} - ${newJob.product} concluído`,
            type: 'success',
          });
          return;
        }

        // Started
        if (newStatus === 'production') {
          add({
            title: 'Produção Iniciada',
            message: `${newJob.order_number} entrou em produção`,
            type: 'info',
          });
          return;
        }

        // Generic status change
        add({
          title: 'Status Atualizado',
          message: `${newJob.order_number}: ${statusLabels[oldJob.status as string] || oldJob.status} → ${statusLabels[newStatus] || newStatus}`,
          type: 'info',
        });
      })
      .subscribe();

    // Watch efficiency alerts
    const alertChannel = supabase
      .channel('inapp-efficiency-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'efficiency_alert_history',
      }, (payload) => {
        const alert = payload.new as Record<string, unknown>;
        const key = `alert-${alert.id}`;
        if (notifiedRef.current.has(key)) return;
        notifiedRef.current.add(key);

        add({
          title: alert.title as string,
          message: alert.description as string,
          type: (alert.severity as string) === 'critical' ? 'error' : 'warning',
          href: '/alerts',
        });
      })
      .subscribe();

    // Watch maintenance alerts
    const maintChannel = supabase
      .channel('inapp-maintenance-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'maintenance_alerts',
      }, (payload) => {
        const alert = payload.new as Record<string, unknown>;
        add({
          title: 'Alerta de Manutenção',
          message: alert.message as string,
          type: 'warning',
          href: '/tpm',
        });
      })
      .subscribe();

    // Cleanup old entries periodically
    const cleanup = setInterval(() => {
      if (notifiedRef.current.size > 200) {
        const arr = Array.from(notifiedRef.current);
        notifiedRef.current = new Set(arr.slice(-100));
      }
    }, 60000);

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(alertChannel);
      supabase.removeChannel(maintChannel);
      clearInterval(cleanup);
    };
  }, [user, add]);

  return null;
}
