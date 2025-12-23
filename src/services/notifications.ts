import { supabase } from '@/integrations/supabase/client';

export const notificationsService = {
  getAll: async (userId: string) => supabase.from('push_notifications').select('*').eq('user_id', userId),
  markAsRead: async (id: string) => supabase.from('push_notifications').update({ status: 'read' }).eq('id', id),
  send: async (notification: any) => supabase.from('push_notifications').insert(notification),
};
