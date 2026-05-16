import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotificationSounds } from "@/hooks/useNotificationSounds";
import { useAuth } from "@/contexts/AuthContext";
import { useGoalAlerts } from "@/hooks/useGoalAlerts";
import { useOEEAlerts } from "@/hooks/useOEEAlerts";
import { useTPMNotifications } from "@/hooks/useTPMNotifications";

interface NotificationPreferences {
  delayedJobs: boolean;
  lowBuffer: boolean;
  bottleneck: boolean;
  statusChanges: boolean;
  productionComplete: boolean;
  oeeAlerts: boolean;
  goalAlerts: boolean;
  maintenanceAlerts: boolean;
}

interface JobPayload {
  id: string;
  order_number: string;
  product: string;
  client: string;
  status: string;
}

interface EfficiencyAlertPayload {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: string;
  metadata?: Record<string, unknown>;
}

const getPreferences = (): NotificationPreferences => {
  const saved = localStorage.getItem('notification-preferences');
  return saved ? JSON.parse(saved) : {
    delayedJobs: true,
    lowBuffer: true,
    bottleneck: true,
    statusChanges: false,
    productionComplete: false,
    oeeAlerts: true,
    goalAlerts: true,
    maintenanceAlerts: true
  };
};

export const NotificationIntegrator = () => {
  const { user } = useAuth();
  const {
    permission,
    sendDelayedJobAlert,
    sendLowBufferAlert,
    sendBottleneckAlert,
    sendStatusChangeAlert,
    sendProductionCompleteAlert
  } = usePushNotifications();

  const {
    playDelayedAlert,
    playBufferAlert,
    playBottleneckAlert,
    playStatusChangeAlert,
    playCompleteAlert
  } = useNotificationSounds();

  const previousJobsRef = useRef<Map<string, string>>(new Map());
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Listen to job status changes
  useEffect(() => {
    if (permission !== 'granted' || !user) return;

    const channel = supabase
      .channel('job-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs'
        },
        async (payload) => {
          const prefs = getPreferences();
          const newJob = payload.new as JobPayload;
          const oldJob = payload.old as JobPayload;

          // Status change notification
          if (prefs.statusChanges && oldJob.status !== newJob.status) {
            playStatusChangeAlert();
            sendStatusChangeAlert({
              orderNumber: newJob.order_number,
              oldStatus: getStatusLabel(oldJob.status),
              newStatus: getStatusLabel(newJob.status)
            });
          }

          // Production complete notification
          if (prefs.productionComplete && newJob.status === 'finished' && oldJob.status !== 'finished') {
            playCompleteAlert();
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .maybeSingle();

            sendProductionCompleteAlert({
              orderNumber: newJob.order_number,
              product: newJob.product,
              operator: profile?.full_name || 'Operador'
            });
          }

          // Delayed job notification
          if (prefs.delayedJobs && newJob.status === 'delayed' && oldJob.status !== 'delayed') {
            const alertKey = `delayed-${newJob.id}`;
            if (!notifiedAlertsRef.current.has(alertKey)) {
              notifiedAlertsRef.current.add(alertKey);
              playDelayedAlert();
              sendDelayedJobAlert({
                orderNumber: newJob.order_number,
                product: newJob.product,
                client: newJob.client
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission, user, sendStatusChangeAlert, sendProductionCompleteAlert, sendDelayedJobAlert, playStatusChangeAlert, playCompleteAlert, playDelayedAlert]);

  // Listen to efficiency alerts
  useEffect(() => {
    if (permission !== 'granted' || !user) return;

    const channel = supabase
      .channel('efficiency-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'efficiency_alert_history'
        },
        (payload) => {
          const prefs = getPreferences();
          const alert = payload.new as EfficiencyAlertPayload;

          const alertKey = `${alert.alert_type}-${alert.id}`;
          if (notifiedAlertsRef.current.has(alertKey)) return;
          notifiedAlertsRef.current.add(alertKey);

          if (prefs.bottleneck && alert.alert_type === 'bottleneck') {
            playBottleneckAlert();
            const metadata = alert.metadata as { occupancy?: number } || {};
            sendBottleneckAlert(
              alert.title.replace('Gargalo: ', ''),
              metadata.occupancy ?? 90
            );
          }

          if (prefs.lowBuffer && alert.alert_type === 'load_balancing') {
            playBufferAlert();
            sendLowBufferAlert(
              alert.title.replace('Carga Desbalanceada: ', ''),
              0
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission, user, sendBottleneckAlert, sendLowBufferAlert, playBottleneckAlert, playBufferAlert]);

  // Clean up old notification references periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Keep only the last 100 notified alerts
      if (notifiedAlertsRef.current.size > 100) {
        const entries = Array.from(notifiedAlertsRef.current);
        notifiedAlertsRef.current = new Set(entries.slice(-50));
      }
    }, 60000);

    return () => clearInterval(cleanup);
  }, []);

  return null;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    queue: 'Na Fila',
    ready: 'No Jeito',
    scheduled: 'Agendado',
    production: 'Em Produção',
    finished: 'Finalizado',
    paused: 'Pausado',
    cancelled: 'Cancelado',
    delayed: 'Atrasado',
    rework: 'Retrabalho'
  };
  return labels[status] || status;
};
