/**
 * Hook para Busca Fulltext
 * 
 * @module hooks/useSearch
 * @description Busca em múltiplas colunas com debounce e validação
 * 
 * @example
 * ```tsx
 * const { results, isLoading, searchTerm, setSearchTerm } = useSearch<Produto>({
 *   table: 'produtos',
 *   columns: ['nome', 'descricao', 'codigo'],
 *   minChars: 2,
 *   debounceMs: 300
 * });
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================
// TIPOS
// ============================================

export interface SearchOptions {
  /** Tabela para buscar */
  table: string;
  /** Colunas para buscar */
  columns: string[];
  /** Mínimo de caracteres para iniciar busca */
  minChars?: number;
  /** Tempo de debounce em ms */
  debounceMs?: number;
  /** Limite de resultados */
  limit?: number;
  /** Ordenação */
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  /** Filtros adicionais */
  filters?: Record<string, any>;
  /** Select customizado */
  select?: string;
}

interface UseSearchResult<T> {
  /** Resultados da busca */
  results: T[];
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro se houver */
  error: Error | null;
  /** Termo de busca atual */
  searchTerm: string;
  /** Atualizar termo de busca */
  setSearchTerm: (term: string) => void;
  /** Limpar busca */
  clearSearch: () => void;
  /** Se há resultados */
  hasResults: boolean;
  /** Total de resultados (se disponível) */
  totalCount?: number;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para busca fulltext com debounce
 * 
 * @template T Tipo dos resultados
 * @param options Opções de configuração da busca
 * @returns Objeto com resultados e controles da busca
 */
export function useSearch<T = any>(
  options: SearchOptions
): UseSearchResult<T> {
  const {
    table,
    columns,
    minChars = 2,
    debounceMs = 300,
    limit = 50,
    orderBy,
    filters,
    select = '*'
  } = options;

  // ============================================
  // ESTADO
  // ============================================

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // ============================================
  // DEBOUNCE
  // ============================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // ============================================
  // QUERY
  // ============================================

  const shouldSearch = useMemo(() => {
    return debouncedTerm.length >= minChars;
  }, [debouncedTerm, minChars]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', table, debouncedTerm, columns, filters],
    queryFn: async () => {
      // Construir query base
      let query = supabase
        .from(table)
        .select(select, { count: 'exact' });

      // Adicionar busca fulltext em múltiplas colunas
      if (debouncedTerm) {
        const searchConditions = columns
          .map(col => `${col}.ilike.%${debouncedTerm}%`)
          .join(',');
        
        query = query.or(searchConditions);
      }

      // Aplicar filtros adicionais
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Aplicar ordenação
      if (orderBy) {
        query = query.order(orderBy.column, { 
          ascending: orderBy.ascending ?? true 
        });
      }

      // Aplicar limite
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        results: data as T[],
        count
      };
    },
    enabled: shouldSearch,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  // ============================================
  // CALLBACKS
  // ============================================

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
  }, []);

  // ============================================
  // COMPUTED
  // ============================================

  const results = useMemo(() => {
    return data?.results ?? [];
  }, [data]);

  const hasResults = useMemo(() => {
    return results.length > 0;
  }, [results]);

  // ============================================
  // RETURN
  // ============================================

  return {
    results,
    isLoading: shouldSearch && isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    clearSearch,
    hasResults,
    totalCount: data?.count ?? undefined,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Hook simplificado para busca rápida
 */
export function useQuickSearch<T = any>(
  table: string,
  searchColumns: string[]
): UseSearchResult<T> {
  return useSearch<T>({
    table,
    columns: searchColumns,
    minChars: 2,
    debounceMs: 300,
    limit: 20,
  });
}

/**
 * Hook para busca avançada com filtros
 */
export function useAdvancedSearch<T = any>(
  table: string,
  columns: string[],
  filters?: Record<string, any>
): UseSearchResult<T> {
  return useSearch<T>({
    table,
    columns,
    filters,
    minChars: 1,
    debounceMs: 500,
    limit: 100,
  });
}
