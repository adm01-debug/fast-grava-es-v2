import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback } from 'react';
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

export function useNotifications(options?: { limit?: number; unreadOnly?: boolean }) {
  const { limit = 50, unreadOnly = false } = options ?? {};
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', { limit, unreadOnly }],
    queryFn: async () => {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
      if (unreadOnly) query = query.eq('is_read', false);
      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
      if (error) throw error;
      return count || 0;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('mark_notification_read', { p_notification_id: id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('mark_all_notifications_read');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas as notificações marcadas como lidas');
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const channel = supabase.channel('notifications-realtime').on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        const notif = payload.new as Notification;
        if (notif.priority >= 2) {
          toast.info(notif.title, { description: notif.message });
        }
      }).subscribe();
      return () => { supabase.removeChannel(channel); };
    };
    setupRealtime();
  }, [queryClient]);

  return {
    notifications, unreadCount, isLoading,
    markAsRead: markAsRead.mutate, markAllAsRead: markAllAsRead.mutate,
    deleteNotification: deleteNotification.mutate,
  };
}

// Helper function for status change notifications
export function notifyStatusChange(jobId: string, oldStatus: string, newStatus: string) {
  console.log(`Job ${jobId} status changed from ${oldStatus} to ${newStatus}`);
  // This would typically trigger a toast or notification
  // Using a simple console.log for now as the full notification system is available via useNotifications hook
}
