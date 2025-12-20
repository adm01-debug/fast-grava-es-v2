import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

// VAPID public key - should be in environment variable
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NativePushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

export function useNativePushNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<NativePushState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    subscription: null,
    isLoading: true,
    error: null,
  });

  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    return isSupported;
  }, []);

  // Initialize state
  useEffect(() => {
    const init = async () => {
      const isSupported = checkSupport();

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Push notifications não são suportadas neste navegador',
        }));
        return;
      }

      try {
        // Wait for service worker
        const registration = await navigator.serviceWorker.ready;
        swRegistrationRef.current = registration;

        // Check current permission
        const permission = Notification.permission;

        // Check existing subscription
        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          permission,
          subscription,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('[useNativePushNotifications] Init error:', error);
        setState(prev => ({
          ...prev,
          isSupported: true,
          isLoading: false,
          error: 'Erro ao inicializar notificações push',
        }));
      }
    };

    init();
  }, [checkSupport]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: 'Permissão concedida',
          description: 'Você receberá notificações push',
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: 'Permissão negada',
          description: 'Você não receberá notificações. Altere nas configurações do navegador.',
          variant: 'destructive',
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error('[useNativePushNotifications] Permission error:', error);
      setState(prev => ({ ...prev, error: 'Erro ao solicitar permissão' }));
      return false;
    }
  }, [state.isSupported, toast]);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<PushSubscriptionInfo | null> => {
    if (!state.isSupported || !swRegistrationRef.current) {
      return null;
    }

    // Request permission if not granted
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if VAPID key is configured
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key not configured');
      }

      const subscription = await swRegistrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const subscriptionJson = subscription.toJSON();

      const subscriptionInfo: PushSubscriptionInfo = {
        endpoint: subscriptionJson.endpoint || '',
        keys: {
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
        },
      };

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      toast({
        title: 'Inscrito com sucesso',
        description: 'Você receberá notificações push',
      });

      return subscriptionInfo;
    } catch (error) {
      console.error('[useNativePushNotifications] Subscribe error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: 'Erro na inscrição',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    }
  }, [state.isSupported, state.permission, requestPermission, urlBase64ToUint8Array, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      return true;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await state.subscription.unsubscribe();

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      toast({
        title: 'Inscrição cancelada',
        description: 'Você não receberá mais notificações push',
      });

      return true;
    } catch (error) {
      console.error('[useNativePushNotifications] Unsubscribe error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao cancelar inscrição',
      }));

      return false;
    }
  }, [state.subscription, toast]);

  // Show a local notification (for testing)
  const showLocalNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return false;
    }

    try {
      if (swRegistrationRef.current) {
        await swRegistrationRef.current.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options,
        });
        return true;
      }

      // Fallback to regular notification
      new Notification(title, options);
      return true;
    } catch (error) {
      console.error('[useNativePushNotifications] Show notification error:', error);
      return false;
    }
  }, [state.isSupported, state.permission]);

  // Toggle subscription
  const toggleSubscription = useCallback(async () => {
    if (state.isSubscribed) {
      return unsubscribe();
    } else {
      const result = await subscribe();
      return result !== null;
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
    showLocalNotification,
    canSubscribe: state.isSupported && state.permission !== 'denied',
  };
}

/**
 * Hook for handling push notification events
 */
export function usePushNotificationEvents(
  onNotificationClick?: (event: NotificationEvent) => void,
  onPushReceived?: (event: PushEvent) => void
) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data || {};

      switch (type) {
        case 'NOTIFICATION_CLICK':
          onNotificationClick?.(data);
          break;
        case 'PUSH_RECEIVED':
          onPushReceived?.(data);
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [onNotificationClick, onPushReceived]);
}

// Type definitions for notification events
interface NotificationEvent {
  action?: string;
  notification: {
    title: string;
    body?: string;
    data?: any;
  };
}

interface PushEvent {
  data?: any;
}
