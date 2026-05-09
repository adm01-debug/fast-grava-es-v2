import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from './useInventory';

export function useJobInventoryCheck(techniqueId?: string) {
  const { items: inventoryItems, isLoading: isLoadingInventory } = useInventory();

  const { data: sheetMaterials, isLoading: isLoadingSheets } = useQuery({
    queryKey: ['sheet-materials-check', techniqueId],
    queryFn: async () => {
      if (!techniqueId) return [];
      
      // Get the most recent/published technical sheet for this technique
      const { data: sheets } = await supabase
        .from('technical_sheets')
        .select('id')
        .eq('technique_id', techniqueId)
        .eq('status', 'published')
        .order('version', { ascending: false })
        .limit(1);

      if (!sheets || sheets.length === 0) return [];

      const { data: materials } = await supabase
        .from('technical_sheet_materials')
        .select('name, quantity')
        .eq('technical_sheet_id', sheets[0].id);

      return materials || [];
    },
    enabled: !!techniqueId,
  });

  const availability = {
    isAvailable: true,
    lowStockItems: [] as string[],
    outOfStockItems: [] as string[],
  };

  if (sheetMaterials && inventoryItems) {
    sheetMaterials.forEach(mat => {
      const invItem = inventoryItems.find(i => i.name.toLowerCase().includes(mat.name.toLowerCase()));
      if (invItem) {
        if (invItem.current_stock <= 0) {
          availability.isAvailable = false;
          availability.outOfStockItems.push(mat.name);
        } else if (invItem.current_stock <= invItem.min_stock_level) {
          availability.lowStockItems.push(mat.name);
        }
      }
    });
  }

  return {
    ...availability,
    isLoading: isLoadingInventory || isLoadingSheets,
  };
}
