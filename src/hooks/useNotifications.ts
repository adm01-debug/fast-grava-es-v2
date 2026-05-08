import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  category: string | null;
  source_system: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  action_label: string | null;
  priority: number;
  group_count: number;
  is_grouped: boolean;
  created_at: string;
}

const EMPTY_NOTIFICATIONS: Notification[] = [];

export function useNotifications(options?: { limit?: number; unreadOnly?: boolean }) {
  const { limit = 50, unreadOnly = false } = options ?? {};
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', { limit, unreadOnly }],
    queryFn: async () => {
      try {
        // Try to fetch from push_notifications table which exists
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return EMPTY_NOTIFICATIONS;

        const { data } = await supabase
          .from('push_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (!data || data.length === 0) {
          return EMPTY_NOTIFICATIONS;
        }

        // Transform push_notifications to Notification format
        return data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.body,
          type: 'info' as const,
          category: null,
          source_system: 'push',
          is_read: n.status === 'read',
          read_at: null,
          action_url: null,
          action_label: null,
          priority: 1,
          group_count: 1,
          is_grouped: false,
          created_at: n.created_at,
        }));
      } catch {
        return EMPTY_NOTIFICATIONS;
      }
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count } = await supabase
          .from('push_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'read');
        
        return count || 0;
      } catch (error) {
        return 0;
      }
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('push_notifications')
        .update({ status: 'read' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('push_notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas as notificações marcadas como lidas');
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('push_notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      channel = supabase.channel('notifications-realtime').on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'push_notifications', filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        const notif = payload.new as { title: string; body: string };
        toast.info(notif.title, { description: notif.body });
      }).subscribe();
    };
    setupRealtime();
    
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    notifications, unreadCount, isLoading,
    markAsRead: markAsRead.mutate, markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
}

// Helper function for status change notifications
export function notifyStatusChange(jobId: string, oldStatus: string, newStatus: string) {
  if (import.meta.env.DEV) console.log(`Job ${jobId} status changed from ${oldStatus} to ${newStatus}`);
  // This would typically trigger a toast or notification
  // Using a simple console.log for now as the full notification system is available via useNotifications hook
}
