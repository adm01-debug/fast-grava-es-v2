import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardSettings() {
  const { data: thresholds } = useQuery({
    queryKey: ['oee-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .ilike('key', '%threshold%');
      
      if (error) throw error;
      
      const map: Record<string, number> = {};
      data?.forEach(item => {
        map[item.key] = Number(item.value);
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { thresholds };
}
