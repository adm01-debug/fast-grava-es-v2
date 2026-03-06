import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createAppError } from '@/lib/errorHandling';
import { navigateTo } from '@/lib/navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PUSH_NOTIFICATIONS_ERROR_CONTEXT = {
  requestPermission: { entity: 'push_notifications', operation: 'request_permission' },
  sendNotification: { entity: 'push_notifications', operation: 'send' },
  subscribe: { entity: 'push_notifications', operation: 'subscribe' },
};

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Check if already subscribed
      if (user) {
        checkSubscription();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Um usuário pode ter múltiplas subscriptions (ex: vários dispositivos/endpoints).
      // Então NÃO podemos usar .single() aqui (vira 406 quando há 0 ou >1 registros).
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      setIsSubscribed((data?.length ?? 0) > 0);
    } catch {
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      const appError = createAppError(error, PUSH_NOTIFICATIONS_ERROR_CONTEXT.requestPermission);
      if (import.meta.env.DEV) console.error('[requestPermission]', appError);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = useCallback((options: NotificationOptions) => {
    if (!isSupported) {
      if (import.meta.env.DEV) console.log('[sendNotification] Notifications not supported');
      return null;
    }

    if (permission !== 'granted') {
      if (import.meta.env.DEV) console.log('[sendNotification] Notification permission not granted');
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
        // Using navigateTo helper for React Router integration
        if (options.data?.route) {
          navigateTo(options.data.route);
        }
      };

      return notification;
    } catch (error) {
      const appError = createAppError(error, PUSH_NOTIFICATIONS_ERROR_CONTEXT.sendNotification);
      if (import.meta.env.DEV) console.error('[sendNotification]', appError);
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

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      setIsSubscribed(false);
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais alertas push."
      });
      return true;
    } catch (error) {
      const appError = createAppError(error, PUSH_NOTIFICATIONS_ERROR_CONTEXT.subscribe);
      if (import.meta.env.DEV) console.error('[unsubscribe]', appError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    requestPermission,
    unsubscribe,
    sendNotification,
    // Specific alert types
    sendDelayedJobAlert,
    sendLowBufferAlert,
    sendBottleneckAlert,
    sendStatusChangeAlert,
    sendProductionCompleteAlert
  };
};
