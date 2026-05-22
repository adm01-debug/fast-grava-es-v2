import { useState, useEffect, useCallback } from 'react';
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

  const setupChannel = useCallback(() => {
    setStatus('connecting');

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
          logger.error(`Realtime error on channel ${channelId}`, err, 'useRealtimeConnection');
          setStatus('error');
          // Auto-reconnect after exponential backoff or static delay
          const timer = setTimeout(() => {
            reconnect();
          }, 5000);
          return () => clearTimeout(timer);
        }
      });

    return newChannel;
  }, []);

  useEffect(() => {
    let ch: RealtimeChannel;
    try {
      ch = setupChannel();
    } catch (e) {
      setStatus('error');
    }

    return () => {
      if (ch) supabase.removeChannel(ch);
    };
  }, [setupChannel]);

  const reconnect = useCallback(() => {
    setStatus('connecting');
    setupChannel();
  }, [setupChannel]);

  return {
    status,
    isConnected: status === 'connected',
    lastUpdate,
    reconnect,
  };
}
