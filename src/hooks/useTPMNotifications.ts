import { useEffect, useCallback, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useNotificationSounds } from './useNotificationSounds';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceAlert } from './tpm/types';

interface TPMNotificationPreferences {
  upcomingMaintenance: boolean;
  dueMaintenance: boolean;
  overdueMaintenance: boolean;
  criticalAlerts: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: TPMNotificationPreferences = {
  upcomingMaintenance: true,
  dueMaintenance: true,
  overdueMaintenance: true,
  criticalAlerts: true,
  soundEnabled: true,
};

const STORAGE_KEY = 'tpm_notification_preferences';

const getPreferences = (): TPMNotificationPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const saveTPMNotificationPreferences = (prefs: Partial<TPMNotificationPreferences>) => {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const useTPMNotifications = () => {
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendNotification 
  } = usePushNotifications();
  const { playAlertSound } = useNotificationSounds();
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Send maintenance alert notification
  const sendMaintenanceNotification = useCallback((alert: MaintenanceAlert) => {
    const prefs = getPreferences();
    
    // Check if this alert type is enabled
    const shouldNotify = 
      (alert.alert_type === 'upcoming' && prefs.upcomingMaintenance) ||
      (alert.alert_type === 'due' && prefs.dueMaintenance) ||
      (alert.alert_type === 'overdue' && prefs.overdueMaintenance) ||
      (alert.alert_type === 'critical' && prefs.criticalAlerts);

    if (!shouldNotify) return null;

    // Don't notify for already notified alerts
    if (notifiedAlertsRef.current.has(alert.id)) return null;
    notifiedAlertsRef.current.add(alert.id);

    // Play sound for critical and overdue alerts
    if (prefs.soundEnabled && (alert.alert_type === 'critical' || alert.alert_type === 'overdue')) {
      playAlertSound();
    }

    const iconMap = {
      upcoming: '📅',
      due: '⚠️',
      overdue: '🔴',
      critical: '🚨',
    };

    const titleMap = {
      upcoming: 'Manutenção Próxima',
      due: 'Manutenção Vencendo',
      overdue: 'Manutenção Atrasada',
      critical: 'ALERTA CRÍTICO',
    };

    const machineName = alert.machine?.name || 'Máquina desconhecida';

    return sendNotification({
      title: `${iconMap[alert.alert_type]} ${titleMap[alert.alert_type]}`,
      body: `${machineName}: ${alert.message}`,
      tag: `tpm-alert-${alert.id}`,
      requireInteraction: alert.alert_type === 'critical' || alert.alert_type === 'overdue',
      data: { route: '/tpm', type: 'maintenance', alertId: alert.id }
    });
  }, [sendNotification, playAlertSound]);

  // Send overdue alert
  const sendOverdueAlert = useCallback((machineName: string, scheduleName: string, daysOverdue: number) => {
    const prefs = getPreferences();
    if (!prefs.overdueMaintenance) return null;

    if (prefs.soundEnabled) {
      playAlertSound();
    }

    return sendNotification({
      title: '🔴 Manutenção Atrasada',
      body: `${machineName} - ${scheduleName}: ${daysOverdue} dias de atraso`,
      tag: `tpm-overdue-${machineName}-${scheduleName}`,
      requireInteraction: true,
      data: { route: '/tpm', type: 'overdue' }
    });
  }, [sendNotification, playAlertSound]);

  // Send critical alert
  const sendCriticalAlert = useCallback((machineName: string, message: string) => {
    const prefs = getPreferences();
    if (!prefs.criticalAlerts) return null;

    if (prefs.soundEnabled) {
      playAlertSound();
    }

    return sendNotification({
      title: '🚨 ALERTA CRÍTICO DE MANUTENÇÃO',
      body: `${machineName}: ${message}`,
      tag: `tpm-critical-${machineName}`,
      requireInteraction: true,
      data: { route: '/tpm', type: 'critical' }
    });
  }, [sendNotification, playAlertSound]);

  // Send maintenance due today notification
  const sendDueTodayAlert = useCallback((machineName: string, scheduleName: string) => {
    const prefs = getPreferences();
    if (!prefs.dueMaintenance) return null;

    return sendNotification({
      title: '⚠️ Manutenção para Hoje',
      body: `${machineName} - ${scheduleName} vence hoje`,
      tag: `tpm-due-${machineName}-${scheduleName}`,
      data: { route: '/tpm', type: 'due' }
    });
  }, [sendNotification]);

  // Send upcoming maintenance reminder
  const sendUpcomingReminder = useCallback((machineName: string, scheduleName: string, daysUntilDue: number) => {
    const prefs = getPreferences();
    if (!prefs.upcomingMaintenance) return null;

    return sendNotification({
      title: '📅 Manutenção Próxima',
      body: `${machineName} - ${scheduleName} em ${daysUntilDue} dias`,
      tag: `tpm-upcoming-${machineName}-${scheduleName}`,
      data: { route: '/tpm', type: 'upcoming' }
    });
  }, [sendNotification]);

  // Listen to realtime maintenance alerts
  useEffect(() => {
    if (permission !== 'granted') return;

    const channel = supabase
      .channel('tpm-alerts-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_alerts'
        },
        async (payload) => {
          const newAlert = payload.new as MaintenanceAlert;
          
          // Fetch machine info
          const { data: machine } = await supabase
            .from('machines')
            .select('id, name, code')
            .eq('id', newAlert.machine_id)
            .single();

          const alertWithMachine = {
            ...newAlert,
            machine: machine || undefined
          };

          sendMaintenanceNotification(alertWithMachine);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission, sendMaintenanceNotification]);

  // Cleanup old notified alerts periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (notifiedAlertsRef.current.size > 100) {
        const arr = Array.from(notifiedAlertsRef.current);
        notifiedAlertsRef.current = new Set(arr.slice(-50));
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    sendMaintenanceNotification,
    sendOverdueAlert,
    sendCriticalAlert,
    sendDueTodayAlert,
    sendUpcomingReminder,
    getPreferences,
    savePreferences: saveTPMNotificationPreferences,
  };
};
