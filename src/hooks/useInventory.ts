import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { subDays, isAfter, parseISO } from 'date-fns';
import { useMemo } from 'react';

export type InventoryCategory = 'ink' | 'screen' | 'solvent' | 'consumable' | 'other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  current_stock: number;
  unit: string;
  min_stock_level: number;
  location: string | null;
  specification: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  item_id: string;
  user_id: string | null;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string | null;
  job_id: string | null;
  created_at: string;
}

export function useInventory() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  const movementsQuery = useInventoryMovements();
  const movements = movementsQuery.data || [];

  const stats = useMemo(() => {
    const now = new Date();
    const last24h = subDays(now, 1);
    
    const recentMovements = (movements as any[]).filter(m => {
      if (!m.created_at) return false;
      return isAfter(parseISO(m.created_at), last24h);
    });
    
    const totalValue = (itemsQuery.data || []).reduce((sum, item) => sum + (item.current_stock * 15.5), 0);

    return {
      movementsCount24h: recentMovements.length,
      inventoryValue: totalValue,
    };
  }, [movements, itemsQuery.data]);

  const createMovementMutation = useMutation({
    mutationFn: async (movement: Omit<InventoryMovement, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([{ ...movement, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      toast.success('Movimentação registrada com sucesso');
    },
    onError: (error) => {
      console.error('Error recording movement:', error);
      toast.error('Erro ao registrar movimentação');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item atualizado com sucesso');
    },
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    recordMovement: createMovementMutation.mutateAsync,
    isMoving: createMovementMutation.isPending,
    updateItem: updateItemMutation.mutateAsync,
    stats,
  };
}

export function useInventoryMovements(itemId?: string) {
  return useQuery({
    queryKey: ['inventory-movements', itemId],
    queryFn: async () => {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          profiles:user_id (display_name),
          inventory_items:item_id (name)
        `)
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
