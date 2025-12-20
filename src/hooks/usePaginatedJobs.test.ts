import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePaginatedJobs, JobFilters } from './usePaginatedJobs';

// Mock data
const mockSupabaseSelect = vi.fn();
const mockSupabaseChannel = vi.fn();
const mockSupabaseRemoveChannel = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: (resolve: any) => resolve(mockSupabaseSelect(table)),
      };
      // Make it thenable
      Object.assign(chainable, {
        [Symbol.toStringTag]: 'Promise',
      });
      return chainable;
    },
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => {
          mockSupabaseChannel(name);
          return { unsubscribe: vi.fn() };
        },
      }),
    }),
    removeChannel: mockSupabaseRemoveChannel,
  },
}));

vi.mock('@/lib/queryConfig', () => ({
  STALE_TIMES: { DYNAMIC: 30000 },
  defaultQueryOptions: {},
  DEFAULT_PAGE_SIZE: 20,
  calculateRange: (page: number, pageSize: number) => ({
    from: (page - 1) * pageSize,
    to: page * pageSize - 1,
  }),
  createPaginatedResult: (data: any[], total: number, page: number, pageSize: number) => ({
    data,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: page < Math.ceil(total / pageSize),
    hasPreviousPage: page > 1,
  }),
}));

vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  createAppError: vi.fn((error) => error),
}));

// Wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock job factory
const createMockJob = (id: string, overrides = {}) => ({
  id,
  order_number: `ORD-${id}`,
  client: `Client ${id}`,
  product: `Product ${id}`,
  quantity: 100,
  status: 'queue',
  technique_id: 'tech-1',
  machine_id: null,
  scheduled_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('usePaginatedJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChannel.mockReturnValue({ unsubscribe: vi.fn() });
  });

  describe('Initial State', () => {
    it('should have correct initial state', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.data).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });

    it('should respect custom initial page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      const { result } = renderHook(
        () => usePaginatedJobs({ page: 3, pageSize: 10 }),
        { wrapper: createWrapper() }
      );

      expect(result.current.page).toBe(3);
      expect(result.current.pageSize).toBe(10);
    });

    it('should be disabled when enabled is false', async () => {
      const { result } = renderHook(
        () => usePaginatedJobs({ enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockSupabaseSelect).not.toHaveBeenCalled();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch paginated jobs', async () => {
      const mockJobs = [
        createMockJob('1'),
        createMockJob('2'),
        createMockJob('3'),
      ];

      mockSupabaseSelect.mockResolvedValue({ 
        data: mockJobs, 
        error: null, 
        count: 50 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data.length).toBe(3);
        expect(result.current.totalCount).toBe(50);
      });
    });

    it('should calculate pagination correctly', async () => {
      const mockJobs = Array.from({ length: 20 }, (_, i) => createMockJob(`${i + 1}`));

      mockSupabaseSelect.mockResolvedValue({ 
        data: mockJobs, 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(
        () => usePaginatedJobs({ pageSize: 20 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
        expect(result.current.hasNextPage).toBe(true);
        expect(result.current.hasPreviousPage).toBe(false);
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const mockJobs = [
        createMockJob('1', { status: 'production' }),
      ];

      mockSupabaseSelect.mockResolvedValue({ 
        data: mockJobs, 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { status: 'production' };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should filter by multiple statuses', async () => {
      const mockJobs = [
        createMockJob('1', { status: 'queue' }),
        createMockJob('2', { status: 'ready' }),
      ];

      mockSupabaseSelect.mockResolvedValue({ 
        data: mockJobs, 
        error: null, 
        count: 2 
      });

      const filters: JobFilters = { status: ['queue', 'ready'] };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(2);
      });
    });

    it('should filter by technique', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [createMockJob('1', { technique_id: 'tech-laser' })], 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { techniqueId: 'tech-laser' };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should filter by machine', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [createMockJob('1', { machine_id: 'machine-1' })], 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { machineId: 'machine-1' };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should filter by client search', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [createMockJob('1', { client: 'Empresa ABC' })], 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { clientSearch: 'ABC' };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should filter by order search', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [createMockJob('1', { order_number: 'PED-2024-001' })], 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { orderSearch: '2024-001' };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should filter by date range', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [createMockJob('1', { scheduled_date: '2024-12-15' })], 
        error: null, 
        count: 1 
      });

      const filters: JobFilters = { 
        dateFrom: '2024-12-01', 
        dateTo: '2024-12-31' 
      };

      const { result } = renderHook(
        () => usePaginatedJobs({ filters }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
      });
    });

    it('should reset to page 1 when filters change', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      const { result, rerender } = renderHook(
        ({ filters }) => usePaginatedJobs({ filters, page: 3 }),
        { 
          wrapper: createWrapper(),
          initialProps: { filters: {} as JobFilters }
        }
      );

      // Change filters
      rerender({ filters: { status: 'production' } });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });
  });

  describe('Navigation', () => {
    it('should go to next page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: Array.from({ length: 20 }, (_, i) => createMockJob(`${i}`)), 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should go to previous page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(
        () => usePaginatedJobs({ page: 3 }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.page).toBe(2);
    });

    it('should not go to previous page on first page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(
        () => usePaginatedJobs({ page: 1 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.hasPreviousPage).toBe(false);
      });
    });

    it('should go to specific page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
      });

      act(() => {
        result.current.goToPage(4);
      });

      expect(result.current.page).toBe(4);
    });

    it('should go to first page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(
        () => usePaginatedJobs({ page: 5 }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.firstPage();
      });

      expect(result.current.page).toBe(1);
    });

    it('should go to last page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
      });

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.page).toBe(5);
    });

    it('should not go to invalid page', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.totalPages).toBe(5);
      });

      act(() => {
        result.current.goToPage(10); // Beyond total pages
      });

      expect(result.current.page).toBe(1); // Should not change
    });

    it('should not go to page 0 or negative', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 100 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.goToPage(0);
      });

      expect(result.current.page).toBe(1);

      act(() => {
        result.current.goToPage(-1);
      });

      expect(result.current.page).toBe(1);
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to job changes', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSupabaseChannel).toHaveBeenCalledWith('jobs-paginated-changes');
      });
    });

    it('should not subscribe when disabled', async () => {
      renderHook(
        () => usePaginatedJobs({ enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(mockSupabaseChannel).not.toHaveBeenCalled();
    });

    it('should cleanup subscription on unmount', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      const { unmount } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockSupabaseRemoveChannel).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' }, 
        count: null 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should return empty data on error', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: null, 
        error: { message: 'Error' }, 
        count: null 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([]);
        expect(result.current.totalCount).toBe(0);
      });
    });
  });

  describe('Refetch', () => {
    it('should provide refetch function', async () => {
      mockSupabaseSelect.mockResolvedValue({ 
        data: [], 
        error: null, 
        count: 0 
      });

      const { result } = renderHook(() => usePaginatedJobs(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
