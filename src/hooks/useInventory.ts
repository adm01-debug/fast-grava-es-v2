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
  price_per_unit: number;
  created_at: string;
  updated_at: string;
  daily_usage_avg?: number; // Estimated pieces/units per day
  days_of_supply?: number; // Days until stock runs out
}


export interface InventoryMovement {
  id: string;
  item_id: string;
  user_id: string | null;
  type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
  quantity: number;
  reason: string | null;
  from_location: string | null;
  to_location: string | null;
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

  const calculateAIIntelligence = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('calculate-inventory-intelligence');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('IA Recalibrada', {
        description: 'Previsões de estoque atualizadas com base nos consumos recentes.'
      });
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
    
    const totalValue = (itemsQuery.data || []).reduce((sum, item) => sum + (item.current_stock * (item.price_per_unit || 0)), 0);

    return {
      movementsCount24h: recentMovements.length,
      inventoryValue: totalValue,
    };
  }, [movements, itemsQuery.data]);

  const createMovementMutation = useMutation({
    mutationFn: async (movement: Omit<InventoryMovement, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Get current stock
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('current_stock, name')
        .eq('id', movement.item_id)
        .single();

      if (itemError) throw itemError;

      // Validate OUT movements
      if (movement.type === 'OUT' && item.current_stock < movement.quantity) {
        throw new Error(`Estoque insuficiente para ${item.name}. Disponível: ${item.current_stock}`);
      }

      // 2. Record movement
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([{ ...movement, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      // 3. Update actual stock in inventory_items
      let newStock = item.current_stock;
      if (movement.type === 'IN') newStock += movement.quantity;
      if (movement.type === 'OUT') newStock -= movement.quantity;
      if (movement.type === 'ADJUST') newStock = movement.quantity;

      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', movement.item_id!);
        
      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      toast.success('Movimentação registrada com sucesso');
    },
    onError: (error: any) => {
      console.error('Error recording movement:', error);
      toast.error(error.message || 'Erro ao registrar movimentação');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryItem> & { id: string }) => {
      // If updating stock directly, we should probably record an ADJUST movement
      // but if it's just metadata (name, price), it's fine.
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
    onError: (error) => {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
    }
  });

  const deleteMovementMutation = useMutation({
    mutationFn: async (movementId: string) => {
      // 1. Get movement details first for rollback logic
      const { data: movement, error: fetchError } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('id', movementId)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Rollback stock change in inventory_items
      const { data: item } = await supabase
        .from('inventory_items')
        .select('current_stock, location')
        .eq('id', movement.item_id!)
        .single();

      if (item) {
        let updates: Partial<InventoryItem> = {};
        
        if (movement.type === 'IN') updates.current_stock = item.current_stock - movement.quantity;
        if (movement.type === 'OUT') updates.current_stock = item.current_stock + movement.quantity;
        if (movement.type === 'TRANSFER' && movement.from_location) {
           // Rollback location if it's the most recent one (simple check)
           if (item.location === movement.to_location) {
             updates.location = movement.from_location;
           }
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase
            .from('inventory_items')
            .update(updates)
            .eq('id', movement.item_id!);
            
          if (updateError) throw updateError;
        }
      }

      // 3. Delete the movement record
      const { error: deleteError } = await supabase
        .from('inventory_movements')
        .delete()
        .eq('id', movementId);

      if (deleteError) throw deleteError;
      return movement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      toast.success('Movimentação desfeita (rollback) com sucesso');
    },
    onError: (error: any) => {
      console.error('Error deleting movement:', error);
      toast.error(error.message || 'Erro ao desfazer movimentação');
    }
  });

  const transferItemsMutation = useMutation({
    mutationFn: async ({ fromLocation, toLocation, itemIds }: { fromLocation: string, toLocation: string, itemIds: string[] }) => {
      // Validate location format (e.g., A1, B4)
      const locationRegex = /^[A-D][1-4]$/;
      if (!locationRegex.test(toLocation)) {
        throw new Error('Formato de localização inválido. Use Corredor (A-D) e Nível (1-4). Ex: A1, B4.');
      }

      if (fromLocation === toLocation) {
        throw new Error('O destino deve ser diferente da origem.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Perform as a sequence (Supabase JS doesn't have easy multi-row logic in one call with related inserts without a function)
      const results = await Promise.all(itemIds.map(async (itemId) => {
        // 1. Get current item to ensure it's still there
        const { data: item } = await supabase
          .from('inventory_items')
          .select('location, current_stock')
          .eq('id', itemId)
          .single();
        
        if (!item || item.location !== fromLocation) {
           console.warn(`Item ${itemId} not found in location ${fromLocation}`);
           return null;
        }

        // 2. Update item location
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ location: toLocation })
          .eq('id', itemId);
        
        if (updateError) throw updateError;

        // 3. Record movement
        const { error: moveError } = await supabase
          .from('inventory_movements')
          .insert([{
            item_id: itemId,
            user_id: user?.id,
            type: 'TRANSFER',
            quantity: 0, 
            from_location: fromLocation,
            to_location: toLocation,
            reason: `WMS: Transferência de ${fromLocation} para ${toLocation}`
          }]);
          
        if (moveError) throw moveError;
        return itemId;
      }));
      
      return results.filter(Boolean);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      toast.success('Transferência WMS concluída com sucesso');
    },
    onError: (error: any) => {
      console.error('Error transferring items:', error);
      toast.error(error.message || 'Erro ao transferir itens');
    }
  });

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    recordMovement: createMovementMutation.mutateAsync,
    isMoving: createMovementMutation.isPending,
    updateItem: updateItemMutation.mutateAsync,
    transferItems: transferItemsMutation.mutateAsync,
    deleteMovement: deleteMovementMutation.mutateAsync,
    calculateAI: calculateAIIntelligence.mutate,
    isCalculatingAI: calculateAIIntelligence.isPending,
    isTransferring: transferItemsMutation.isPending,
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
