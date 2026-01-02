import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  preferences: Record<string, { channels: string[]; priority: number }>;
  dnd_enabled: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
  dnd_days: number[] | null;
  digest_enabled: boolean;
  digest_frequency: string;
  digest_time: string;
  grouping_enabled: boolean;
  grouping_window_minutes: number;
  phone_number: string | null;
  whatsapp_number: string | null;
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationPreferences | null;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      const { error } = await supabase.from('notification_preferences').upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferências salvas!');
    },
    onError: () => toast.error('Erro ao salvar preferências'),
  });

  return { preferences, isLoading, updatePreferences: updatePreferences.mutate, isUpdating: updatePreferences.isPending };
}
