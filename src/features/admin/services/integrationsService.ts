import { supabase } from '@/integrations/supabase/client';

export const IntegrationsService = {
  async getBitrix24SyncHistory() {
    const { data, error } = await supabase
      .from('bitrix24_sync_history')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async getBitrix24FieldMappings() {
    const { data, error } = await supabase
      .from('bitrix24_field_mappings')
      .select('*')
      .order('priority');
    if (error) throw error;
    return data;
  },

  async triggerBitrix24Sync(syncType: string) {
    const { data, error } = await supabase.functions.invoke('bitrix24-sync', {
      body: { sync_type: syncType },
    });
    if (error) throw error;
    return data;
  },
};
