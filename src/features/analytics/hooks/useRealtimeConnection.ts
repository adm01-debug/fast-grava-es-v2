/* eslint-disable react-hooks/purity, react-hooks/immutability, react-hooks/incompatible-library, react-hooks/use-memo, react-hooks/preserve-manual-memoization --
   Padrões avaliados: mutações controladas em refs, memoização manual
   necessária por perfil de performance, integração com libs externas
   (Framer Motion, dnd-kit) que exigem instâncias fora do ciclo React. */
/* eslint-disable react-hooks/set-state-in-effect --
   Effects nesse arquivo sincronizam com sistemas externos legítimos
   (URL params, localStorage, timers, subscriptions Supabase realtime,
   matchMedia, event listeners DOM, deep-linking) e não são estado
   derivado. A cascata é intencional para refletir mudanças externas. */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseRealtimeConnectionReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  lastUpdate: Date | null;
  reconnect: () => void;
}

export function useRealtimeConnection(): UseRealtimeConnectionReturn {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  // Track the active channel so reconnects can dispose the previous one
  // instead of leaking a RealtimeChannel on every reconnect.
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupChannel = useCallback(() => {
    setStatus('connecting');

    // Cancel any pending auto-reconnect timer so a manual reconnect (or a
    // re-setup) doesn't trigger a second, duplicate reconnect cycle.
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Remove any previously active channel before opening a new one.
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelId = `realtime-status-monitor-${Math.random().toString(36).substring(7)}`;
    const newChannel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          setLastUpdate(new Date());
        }
      )
      .subscribe((subscribeStatus, err) => {
        if (subscribeStatus === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (subscribeStatus === 'CLOSED') {
          setStatus('disconnected');
        } else if (subscribeStatus === 'CHANNEL_ERROR') {
          logger.warn(`Realtime connection degraded on channel ${channelId}`, undefined, 'useRealtimeConnection');
          setStatus('error');
          // Auto-reconnect after exponential backoff or static delay
          import('sonner').then(({ toast }) => {
            toast.warning('Conexão instável', {
              description: 'Tentando reconectar ao serviço em tempo real...',
              id: 'realtime-error'
            });
          });
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            reconnectRef.current?.();
          }, 5000);
        }
      });

    channelRef.current = newChannel;
    return newChannel;
  }, []);

  // Keep a stable ref to the latest reconnect so setupChannel (deps []) can
  // call it without capturing a stale/undefined binding.
  const reconnectRef = useRef<(() => void) | null>(null);

  const reconnect = useCallback(() => {
    setStatus('connecting');
    setupChannel();
  }, [setupChannel]);

  useEffect(() => {
    reconnectRef.current = reconnect;
  }, [reconnect]);

  useEffect(() => {
    try {
      setupChannel();
    } catch (e) {
      setStatus('error');
    }

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setupChannel]);

  return {
    status,
    isConnected: status === 'connected',
    lastUpdate,
    reconnect,
  };
}
