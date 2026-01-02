import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'urgent';
export type NotificationCategory = 'approval' | 'alert' | 'reminder' | 'system' | 'social';
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp';

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  sourceSystem: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  channels?: NotificationChannel[];
  priority?: 0 | 1 | 2 | 3;
  actionUrl?: string;
  actionLabel?: string;
  actionData?: Record<string, unknown>;
  scheduledFor?: string;
}

export async function sendNotification(params: SendNotificationParams) {
  const { data, error } = await supabase.functions.invoke('send-notification', { body: params });
  if (error) throw error;
  return data;
}

export async function sendBulkNotifications(notifications: SendNotificationParams[]) {
  const results = await Promise.allSettled(notifications.map(n => sendNotification(n)));
  return results.map((r, i) => ({ params: notifications[i], success: r.status === 'fulfilled', error: r.status === 'rejected' ? (r as PromiseRejectedResult).reason : null }));
}

export const NotificationHelpers = {
  approval: (userId: string, entityName: string, actionUrl: string, sourceSystem = 'system') =>
    sendNotification({ userId, title: 'Nova Aprovação Pendente', message: `Você tem uma nova solicitação: ${entityName}`, type: 'urgent', category: 'approval', sourceSystem, channels: ['in_app', 'email', 'push'], priority: 3, actionUrl, actionLabel: 'Aprovar/Rejeitar' }),

  reminder: (userId: string, message: string, sourceSystem = 'system') =>
    sendNotification({ userId, title: 'Lembrete', message, type: 'info', category: 'reminder', sourceSystem, channels: ['in_app', 'email'], priority: 1 }),

  alert: (userId: string, title: string, message: string, sourceSystem = 'system') =>
    sendNotification({ userId, title, message, type: 'warning', category: 'alert', sourceSystem, channels: ['in_app', 'push'], priority: 2 }),

  success: (userId: string, title: string, message: string, sourceSystem = 'system') =>
    sendNotification({ userId, title, message, type: 'success', category: 'system', sourceSystem, channels: ['in_app'], priority: 0 }),

  error: (userId: string, title: string, message: string, sourceSystem = 'system') =>
    sendNotification({ userId, title, message, type: 'error', category: 'alert', sourceSystem, channels: ['in_app', 'email'], priority: 2 }),
};
