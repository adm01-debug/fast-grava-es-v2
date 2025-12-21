// Notifications Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'alert'
  | 'job_completed'
  | 'job_delayed'
  | 'maintenance_due'
  | 'quality_issue'
  | 'system';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
  types: Partial<Record<NotificationType, boolean>>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: NotificationAction;
}
