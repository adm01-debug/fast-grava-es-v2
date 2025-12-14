import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useCallback } from 'react';
import { DbJob } from './useJobs';
import { 
  STALE_TIMES, 
  defaultQueryOptions, 
  calculateRange, 
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
  type PaginatedResult 
} from '@/lib/queryConfig';
import { showErrorToast, createAppError } from '@/lib/errorHandling';

export interface JobFilters {
  status?: DbJob['status'] | DbJob['status'][];
  techniqueId?: string;
  machineId?: string;
  clientSearch?: string;
  orderSearch?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UsePaginatedJobsOptions {
  page?: number;
  pageSize?: number;
  filters?: JobFilters;
  enabled?: boolean;
}

export function usePaginatedJobs(options: UsePaginatedJobsOptions = {}) {
  const {
    page: initialPage = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    filters = {},
    enabled = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const queryClient = useQueryClient();

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters)]);

  const queryKey = ['jobs-paginated', page, pageSize, filters];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<PaginatedResult<DbJob>> => {
      const { from, to } = calculateRange(page, pageSize);
      
      // Build the query
      let countQuery = supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      
      let dataQuery = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply filters to both queries
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        countQuery = countQuery.in('status', statuses);
        dataQuery = dataQuery.in('status', statuses);
      }
      
      if (filters.techniqueId) {
        countQuery = countQuery.eq('technique_id', filters.techniqueId);
        dataQuery = dataQuery.eq('technique_id', filters.techniqueId);
      }
      
      if (filters.machineId) {
        countQuery = countQuery.eq('machine_id', filters.machineId);
        dataQuery = dataQuery.eq('machine_id', filters.machineId);
      }
      
      if (filters.clientSearch) {
        const search = `%${filters.clientSearch}%`;
        countQuery = countQuery.ilike('client', search);
        dataQuery = dataQuery.ilike('client', search);
      }
      
      if (filters.orderSearch) {
        const search = `%${filters.orderSearch}%`;
        countQuery = countQuery.ilike('order_number', search);
        dataQuery = dataQuery.ilike('order_number', search);
      }
      
      if (filters.dateFrom) {
        countQuery = countQuery.gte('scheduled_date', filters.dateFrom);
        dataQuery = dataQuery.gte('scheduled_date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        countQuery = countQuery.lte('scheduled_date', filters.dateTo);
        dataQuery = dataQuery.lte('scheduled_date', filters.dateTo);
      }

      // Execute both queries in parallel
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery,
      ]);

      if (countResult.error) throw countResult.error;
      if (dataResult.error) throw dataResult.error;

      const totalCount = countResult.count ?? 0;
      const data = dataResult.data as DbJob[];

      return createPaginatedResult(data, totalCount, page, pageSize);
    },
    ...defaultQueryOptions,
    staleTime: STALE_TIMES.DYNAMIC,
    placeholderData: keepPreviousData,
    enabled,
  });

  // Handle errors with toast
  useEffect(() => {
    if (query.error) {
      showErrorToast(query.error, 'Erro ao carregar jobs');
    }
  }, [query.error]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('jobs-paginated-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          // Invalidate current page and prefetch
          queryClient.invalidateQueries({ queryKey: ['jobs-paginated'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, enabled]);

  // Prefetch next page
  useEffect(() => {
    if (query.data?.hasNextPage) {
      const nextPageKey = ['jobs-paginated', page + 1, pageSize, filters];
      queryClient.prefetchQuery({
        queryKey: nextPageKey,
        queryFn: async () => {
          const { from, to } = calculateRange(page + 1, pageSize);
          
          let dataQuery = supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

          // Apply same filters
          if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
            dataQuery = dataQuery.in('status', statuses);
          }
          if (filters.techniqueId) {
            dataQuery = dataQuery.eq('technique_id', filters.techniqueId);
          }
          if (filters.machineId) {
            dataQuery = dataQuery.eq('machine_id', filters.machineId);
          }

          const { data, error } = await dataQuery;
          if (error) throw error;

          return createPaginatedResult(
            data as DbJob[],
            query.data?.totalCount ?? 0,
            page + 1,
            pageSize
          );
        },
        staleTime: STALE_TIMES.DYNAMIC,
      });
    }
  }, [page, pageSize, filters, query.data, queryClient]);

  // Navigation helpers
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && (!query.data || newPage <= query.data.totalPages)) {
      setPage(newPage);
    }
  }, [query.data]);

  const nextPage = useCallback(() => {
    if (query.data?.hasNextPage) {
      setPage(p => p + 1);
    }
  }, [query.data]);

  const previousPage = useCallback(() => {
    if (query.data?.hasPreviousPage) {
      setPage(p => p - 1);
    }
  }, [query.data]);

  const firstPage = useCallback(() => setPage(1), []);

  const lastPage = useCallback(() => {
    if (query.data) {
      setPage(query.data.totalPages);
    }
  }, [query.data]);

  return {
    // Query state
    data: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ? createAppError(query.error) : null,
    
    // Pagination state
    page,
    pageSize,
    totalPages: query.data?.totalPages ?? 0,
    hasNextPage: query.data?.hasNextPage ?? false,
    hasPreviousPage: query.data?.hasPreviousPage ?? false,
    
    // Navigation
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPage,
    
    // Refetch
    refetch: query.refetch,
  };
}
