import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedFilter {
  id: string;
  name: string;
  entity_type: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface SaveFilterInput {
  name: string;
  filters: Record<string, unknown>;
  is_default?: boolean;
}

// In-memory storage for saved filters (fallback when table doesn't exist)
const inMemoryFilters: Map<string, SavedFilter[]> = new Map();

export function useSavedFilters(entityType: string) {
  const queryClient = useQueryClient();
  const queryKey = ['saved-filters', entityType];

  const { data: filters = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      // Return from in-memory storage since the table might not exist
      return inMemoryFilters.get(entityType) || [];
    },
  });

  const defaultFilter = filters.find(f => f.is_default);

  const saveFilter = useMutation({
    mutationFn: async (input: SaveFilterInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const newFilter: SavedFilter = {
        id: crypto.randomUUID(),
        entity_type: entityType,
        name: input.name,
        filters: input.filters,
        is_default: input.is_default ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const currentFilters = inMemoryFilters.get(entityType) || [];
      inMemoryFilters.set(entityType, [...currentFilters, newFilter]);
      
      return newFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar filtro:', error);
      toast.error('Erro ao salvar filtro');
    },
  });

  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedFilter> & { id: string }) => {
      const currentFilters = inMemoryFilters.get(entityType) || [];
      const updatedFilters = currentFilters.map(f => 
        f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
      );
      inMemoryFilters.set(entityType, updatedFilters);
      
      return updatedFilters.find(f => f.id === id) as SavedFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar filtro');
    },
  });

  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      const currentFilters = inMemoryFilters.get(entityType) || [];
      inMemoryFilters.set(entityType, currentFilters.filter(f => f.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro removido!');
    },
    onError: () => {
      toast.error('Erro ao remover filtro');
    },
  });

  const setAsDefault = useMutation({
    mutationFn: async (id: string) => {
      const currentFilters = inMemoryFilters.get(entityType) || [];
      const updatedFilters = currentFilters.map(f => ({
        ...f,
        is_default: f.id === id,
      }));
      inMemoryFilters.set(entityType, updatedFilters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro padrão definido!');
    },
    onError: () => {
      toast.error('Erro ao definir filtro padrão');
    },
  });

  const removeDefault = useMutation({
    mutationFn: async (id: string) => {
      const currentFilters = inMemoryFilters.get(entityType) || [];
      const updatedFilters = currentFilters.map(f => 
        f.id === id ? { ...f, is_default: false } : f
      );
      inMemoryFilters.set(entityType, updatedFilters);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Filtro padrão removido!');
    },
  });

  return {
    filters,
    defaultFilter,
    isLoading,
    error,
    saveFilter: saveFilter.mutate,
    updateFilter: updateFilter.mutate,
    deleteFilter: deleteFilter.mutate,
    setAsDefault: setAsDefault.mutate,
    removeDefault: removeDefault.mutate,
    isSaving: saveFilter.isPending,
    isDeleting: deleteFilter.isPending,
  };
}
