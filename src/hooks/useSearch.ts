import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchOptions {
  table: string;
  columns: string[];
  minChars?: number;
  debounceMs?: number;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, unknown>;
  select?: string;
}

interface UseSearchResult<T> {
  results: T[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  hasResults: boolean;
  totalCount?: number;
}

export function useSearch<T = unknown>(options: SearchOptions): UseSearchResult<T> {
  const { table, columns, minChars = 2, debounceMs = 300, limit = 50, orderBy, filters, select = '*' } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const shouldSearch = useMemo(() => debouncedTerm.length >= minChars, [debouncedTerm, minChars]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', table, debouncedTerm, columns, filters],
    queryFn: async () => {
      // @ts-ignore - Dynamic table access
      let query = supabase.from(table).select(select, { count: 'exact' });

      if (debouncedTerm) {
        const searchConditions = columns.map(col => `${col}.ilike.%${debouncedTerm}%`).join(',');
        query = query.or(searchConditions);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) query = query.eq(key, value);
        });
      }

      if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      if (limit) query = query.limit(limit);

      const { data: resultData, error: queryError, count } = await query;
      if (queryError) throw queryError;
      return { results: (resultData || []) as T[], count };
    },
    enabled: shouldSearch,
    staleTime: 30000,
    gcTime: 300000,
  });

  const clearSearch = useCallback(() => { setSearchTerm(''); setDebouncedTerm(''); }, []);

  return {
    results: data?.results ?? [],
    isLoading: shouldSearch && isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    clearSearch,
    hasResults: (data?.results?.length ?? 0) > 0,
    totalCount: data?.count ?? undefined,
  };
}

export function useQuickSearch<T = unknown>(table: string, searchColumns: string[]): UseSearchResult<T> {
  return useSearch<T>({ table, columns: searchColumns, minChars: 2, debounceMs: 300, limit: 20 });
}

export function useAdvancedSearch<T = unknown>(table: string, columns: string[], filters?: Record<string, unknown>): UseSearchResult<T> {
  return useSearch<T>({ table, columns, filters, minChars: 1, debounceMs: 500, limit: 100 });
}
