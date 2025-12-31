import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface FulltextSearchOptions {
  table: string;
  searchColumns: string[];
  selectColumns?: string;
  minLength?: number;
  enabled?: boolean;
  additionalFilters?: Record<string, unknown>;
}

export function useFulltextSearch<T = unknown>(
  searchTerm: string,
  options: FulltextSearchOptions
) {
  const {
    table,
    searchColumns,
    selectColumns = '*',
    minLength = 2,
    enabled = true,
    additionalFilters = {},
  } = options;

  const isEnabled = enabled && searchTerm.length >= minLength;

  const queryKey = useMemo(
    () => ['fulltext-search', table, searchTerm, additionalFilters],
    [table, searchTerm, additionalFilters]
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < minLength) {
        return [] as T[];
      }

      // Construir condições OR para busca em múltiplas colunas
      const orConditions = searchColumns
        .map(col => `${col}.ilike.%${searchTerm}%`)
        .join(',');

      let query = supabase
        .from(table)
        .select(selectColumns)
        .or(orConditions);

      // Aplicar filtros adicionais
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return (data ?? []) as T[];
    },
    enabled: isEnabled,
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
  });
}

// Hook específico para Jobs
export function useJobsFulltextSearch(searchTerm: string, filters?: Record<string, unknown>) {
  return useFulltextSearch(searchTerm, {
    table: 'jobs',
    searchColumns: ['client_name', 'job_description', 'material', 'observations'],
    selectColumns: '*, machine:machines(name), operator:operators(name)',
    additionalFilters: filters,
  });
}

// Hook específico para Machines
export function useMachinesFulltextSearch(searchTerm: string) {
  return useFulltextSearch(searchTerm, {
    table: 'machines',
    searchColumns: ['name', 'type', 'location', 'manufacturer', 'model'],
  });
}

// Hook específico para Operators
export function useOperatorsFulltextSearch(searchTerm: string) {
  return useFulltextSearch(searchTerm, {
    table: 'operators',
    searchColumns: ['name', 'email', 'phone', 'specialization'],
  });
}
