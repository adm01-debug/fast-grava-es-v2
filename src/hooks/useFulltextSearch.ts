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

      const orConditions = searchColumns
        .map(col => `${col}.ilike.%${searchTerm}%`)
        .join(',');

      // @ts-ignore - Dynamic table access
      let query = supabase.from(table).select(selectColumns).or(orConditions);

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
    staleTime: 30000,
    gcTime: 60000,
  });
}

export function useJobsFulltextSearch(searchTerm: string, filters?: Record<string, unknown>) {
  return useFulltextSearch(searchTerm, {
    table: 'jobs',
    searchColumns: ['client', 'product', 'order_number', 'notes'],
    selectColumns: '*, machine:machines(name)',
    additionalFilters: filters,
  });
}

export function useMachinesFulltextSearch(searchTerm: string) {
  return useFulltextSearch(searchTerm, {
    table: 'machines',
    searchColumns: ['name', 'code'],
  });
}

export function useOperatorsFulltextSearch(searchTerm: string) {
  return useFulltextSearch(searchTerm, {
    table: 'profiles',
    searchColumns: ['full_name', 'phone'],
  });
}
