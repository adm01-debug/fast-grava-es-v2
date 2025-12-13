import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notificações ativadas",
          description: "Você receberá alertas críticos em tempo real."
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: "Notificações bloqueadas",
          description: "Por favor, habilite nas configurações do navegador.",
          variant: "destructive"
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = useCallback((options: NotificationOptions) => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return null;
    }

    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to specific page if data contains a route
        if (options.data?.route) {
          window.location.href = options.data.route;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Notification types for different alert scenarios
  const sendDelayedJobAlert = useCallback((jobInfo: { orderNumber: string; product: string; client: string }) => {
    return sendNotification({
      title: '⚠️ Job Atrasado',
      body: `${jobInfo.orderNumber} - ${jobInfo.product} (${jobInfo.client})`,
      tag: `delayed-${jobInfo.orderNumber}`,
      requireInteraction: true,
      data: { route: '/alerts', type: 'delayed' }
    });
  }, [sendNotification]);

  const sendLowBufferAlert = useCallback((technique: string, count: number) => {
    return sendNotification({
      title: '🔴 Buffer Baixo',
      body: `${technique}: apenas ${count} jobs "no jeito"`,
      tag: `buffer-${technique}`,
      requireInteraction: true,
      data: { route: '/alerts', type: 'buffer' }
    });
  }, [sendNotification]);

  const sendBottleneckAlert = useCallback((technique: string, occupancy: number) => {
    return sendNotification({
      title: '⚡ Gargalo Detectado',
      body: `${technique}: ${occupancy}% de ocupação`,
      tag: `bottleneck-${technique}`,
      requireInteraction: true,
      data: { route: '/efficiency', type: 'bottleneck' }
    });
  }, [sendNotification]);

  const sendStatusChangeAlert = useCallback((jobInfo: { orderNumber: string; oldStatus: string; newStatus: string }) => {
    return sendNotification({
      title: '🔄 Status Alterado',
      body: `${jobInfo.orderNumber}: ${jobInfo.oldStatus} → ${jobInfo.newStatus}`,
      tag: `status-${jobInfo.orderNumber}`,
      data: { route: '/kanban', type: 'status' }
    });
  }, [sendNotification]);

  const sendProductionCompleteAlert = useCallback((jobInfo: { orderNumber: string; product: string; operator: string }) => {
    return sendNotification({
      title: '✅ Produção Finalizada',
      body: `${jobInfo.orderNumber} - ${jobInfo.product} por ${jobInfo.operator}`,
      tag: `complete-${jobInfo.orderNumber}`,
      data: { route: '/', type: 'complete' }
    });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    // Specific alert types
    sendDelayedJobAlert,
    sendLowBufferAlert,
    sendBottleneckAlert,
    sendStatusChangeAlert,
    sendProductionCompleteAlert
  };
};
