import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface SubscribeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

interface WebSocketContextType {
  status: ConnectionStatus;
  subscribe: (
    channelName: string,
    options: SubscribeOptions,
    callback: (payload: Record<string, unknown>) => void,
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  useEffect(() => {
    // Monitor overall connection status via a heartbeat channel
    const heartbeat = supabase.channel('heartbeat')
      .on('presence', { event: 'sync' }, () => setStatus('connected'))
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('connected');
        else if (s === 'CLOSED') setStatus('disconnected');
        else if (s === 'CHANNEL_ERROR') setStatus('error');
      });

    return () => {
      supabase.removeChannel(heartbeat);
    };
  }, []);

  // Requires an explicit table to avoid wildcard subscriptions that flood the
  // client with unrelated changes (and would otherwise leak data from any
  // public table the RLS allows the user to read).
  const subscribe = useCallback((
    channelName: string,
    options: SubscribeOptions,
    callback: (payload: Record<string, unknown>) => void,
  ) => {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as never,
        {
          event: options.event ?? '*',
          schema: 'public',
          table: options.table,
          ...(options.filter ? { filter: options.filter } : {}),
        },
        (payload: Record<string, unknown>) => {
          callback(payload);
        },
      )
      .subscribe();

    channelsRef.current.set(channelName, channel);

    return () => {
      supabase.removeChannel(channel);
      channelsRef.current.delete(channelName);
    };
  }, []);

  const value = useMemo(() => ({ status, subscribe }), [status, subscribe]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocketContext must be used within WebSocketProvider');
  return ctx;
}
