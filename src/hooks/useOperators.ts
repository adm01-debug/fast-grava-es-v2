import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperatorWithProfile {
  id: string;
  user_id: string;
  role: 'coordinator' | 'operator' | 'manager';
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles!inner (
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('role', 'operator');

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role as 'operator',
        full_name: (item.profiles as any)?.full_name || null,
        avatar_url: (item.profiles as any)?.avatar_url || null,
        phone: (item.profiles as any)?.phone || null,
        created_at: item.created_at,
      })) as OperatorWithProfile[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
