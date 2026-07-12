import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import type { SecurityEvent, BlockedIP } from './useRateLimitLogs';

export function useRealtimeSecurityEvents() {
  const { isCoordinator, isManager } = useAuth();
  const [newEvents, setNewEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    if (!isCoordinator && !isManager) return;

    const channel = supabase
      .channel('security-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
        },
        (payload) => {
          const event = payload.new as SecurityEvent;
          setNewEvents(prev => [event, ...prev].slice(0, 50));

          // Show toast for critical events
          if (event.severity === 'critical' || event.severity === 'error') {
            toast.error(`Alerta de Segurança: ${event.event_type}`, {
              description: (event.details?.message as string | undefined) || 'Verifique o painel de segurança',
              duration: 10000,
            });
          } else if (event.severity === 'warning') {
            toast.warning(`Aviso de Segurança: ${event.event_type}`, {
              description: event.details?.message as string | undefined,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCoordinator, isManager]);

  return { newEvents, clearEvents: () => setNewEvents([]) };
}

export function useRealtimeBlockedIPs() {
  const { isCoordinator, isManager } = useAuth();
  const [newBlocks, setNewBlocks] = useState<BlockedIP[]>([]);

  useEffect(() => {
    if (!isCoordinator && !isManager) return;

    const channel = supabase
      .channel('blocked-ips-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blocked_ips',
        },
        (payload) => {
          const block = payload.new as BlockedIP;
          setNewBlocks(prev => [block, ...prev].slice(0, 20));

          toast.warning(`IP Bloqueado: ${block.ip_address}`, {
            description: block.reason,
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isCoordinator, isManager]);

  return { newBlocks, clearBlocks: () => setNewBlocks([]) };
}

export function logSecurityEvent(
  eventType: string,
  severity: 'info' | 'warning' | 'error' | 'critical',
  details?: Record<string, unknown>
) {
  return supabase.from('security_events').insert([{
    event_type: eventType,
    severity,
    details: (details || {}) as import('@/integrations/supabase/types').Json,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }]);
}
