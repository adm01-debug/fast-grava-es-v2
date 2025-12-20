import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado para receber notificações');
      return false;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão para notificações negada');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já existe subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
      subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      }

      const subscriptionJson = subscription.toJSON();

      // Salvar no Supabase
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) {
        console.error('Error saving subscription:', error);
        toast.error('Erro ao salvar subscription');
        return false;
      }

      setIsSubscribed(true);
      toast.success('Push notifications ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remover do Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);

        if (error) {
          console.error('Error removing subscription:', error);
        }
      }

      setIsSubscribed(false);
      toast.success('Push notifications desativadas');
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erro ao desativar push notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendTestNotification = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          title: 'Teste de Notificação',
          body: 'Se você está vendo isso, as notificações push estão funcionando!',
          icon: '/pwa-icons/icon-192x192.png',
        },
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast.error('Erro ao enviar notificação de teste');
      } else {
        toast.success('Notificação de teste enviada!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao enviar notificação');
    }
  }, [user]);

  return {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    checkSubscription,
    sendTestNotification,
  };
}
