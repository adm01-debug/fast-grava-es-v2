import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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

    const newChannel = supabase
      .channel('realtime-status-monitor')
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (status === 'CLOSED') {
          setStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('error');
        }
      });

    return newChannel;
  }, []);

  useEffect(() => {
    const ch = setupChannel();

    return () => {
      supabase.removeChannel(ch);
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
