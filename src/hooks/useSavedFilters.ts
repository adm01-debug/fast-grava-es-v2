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

export function useSavedFilters(entityType: string) {
  const queryClient = useQueryClient();
  const queryKey = ['saved-filters', entityType];

  const { data: filters = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedFilter[];
    },
  });

  const defaultFilter = filters.find(f => f.is_default);

  const saveFilter = useMutation({
    mutationFn: async (input: SaveFilterInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          name: input.name,
          filters: input.filters,
          is_default: input.is_default ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SavedFilter;
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
      const { data, error } = await supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as SavedFilter;
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
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Remove default de todos os filtros do usuário
      await supabase
        .from('saved_filters')
        .update({ is_default: false })
        .eq('entity_type', entityType)
        .eq('user_id', user.id);
      
      // Define o novo default
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
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
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_default: false })
        .eq('id', id);
      
      if (error) throw error;
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
