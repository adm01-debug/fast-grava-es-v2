import { supabase } from '@/integrations/supabase/client';

export const traceabilityService = {
  getLot: async (lotId: string) => supabase.from('production_lots').select('*').eq('id', lotId).single(),
  getLotComponents: async (lotId: string) => supabase.from('lot_components').select('*').eq('lot_id', lotId),
  getLotMovements: async (lotId: string) => supabase.from('lot_movements').select('*').eq('lot_id', lotId),
  getLotInspections: async (lotId: string) => supabase.from('lot_quality_inspections').select('*').eq('lot_id', lotId),
};
