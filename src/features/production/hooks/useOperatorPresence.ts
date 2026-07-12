import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { createAppError } from '@/lib/errorHandling';

const PRESENCE_ERROR_CONTEXT = {
  track: { entity: 'operator_presence', operation: 'track' },
  sync: { entity: 'operator_presence', operation: 'sync' },
};

interface PresenceState {
  [key: string]: {
    user_id: string;
    online_at: string;
  }[];
}

export function useOperatorPresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Map<string, Date>>(new Map());
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('operators-presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as PresenceState;
        const online = new Set<string>();

        Object.values(state).forEach((presences) => {
          presences.forEach((presence) => {
            if (presence.user_id) {
              online.add(presence.user_id);
            }
          });
        });

        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          (newPresences as Array<{ user_id?: string }>).forEach((presence) => {
            if (presence.user_id) {
              updated.add(presence.user_id);
            }
          });
          return updated;
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const now = new Date();
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          (leftPresences as Array<{ user_id?: string }>).forEach((presence) => {
            if (presence.user_id) {
              updated.delete(presence.user_id);
              // Track last seen time when user leaves
              setLastSeen((prevLastSeen) => {
                const newMap = new Map(prevLastSeen);
                newMap.set(presence.user_id ?? '', now);
                return newMap;
              });
            }
          });
          return updated;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            setIsTracking(true);
          } catch (error) {
            const appError = createAppError(error, PRESENCE_ERROR_CONTEXT.track);
          }
        }
      });

    return () => {
      // removeChannel both unsubscribes and drops the channel from the client
      // registry; bare unsubscribe() leaks the registration across remounts.
      supabase.removeChannel(channel);
      setIsTracking(false);
    };
  }, [user]);

  const isOnline = useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]);

  const getLastSeen = useCallback((userId: string) => lastSeen.get(userId), [lastSeen]);

  return {
    onlineUsers,
    isOnline,
    isTracking,
    onlineCount: onlineUsers.size,
    lastSeen,
    getLastSeen,
  };
}