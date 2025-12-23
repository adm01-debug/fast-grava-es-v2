import { supabase } from '@/integrations/supabase/client';

export const bitrix24Service = {
  getSyncHistory: async () => supabase.from('bitrix24_sync_history').select('*').order('started_at', { ascending: false }),
  getFieldMappings: async () => supabase.from('bitrix24_field_mappings').select('*'),
  triggerSync: async () => {
    return supabase.functions.invoke('bitrix24-sync', { body: { action: 'sync' } });
  },
};
