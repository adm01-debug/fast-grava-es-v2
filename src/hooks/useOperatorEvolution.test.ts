import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useOperatorEvolution } from './useOperatorEvolution';

// Mocks
const mockSupabaseSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: (fields?: string) => ({
        eq: (field: string, value: any) => ({
          gte: (field: string, value: any) => mockSupabaseSelect(table, 'jobs'),
          eq: (field: string, value: any) => ({
            then: (resolve: any) => resolve(mockSupabaseSelect(table, 'user_roles')),
          }),
        }),
        in: (field: string, values: any[]) => mockSupabaseSelect(table, 'profiles'),
        then: (resolve: any) => resolve(mockSupabaseSelect(table, 'operator_machines')),
      }),
    }),
  },
}));

// Wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Factory functions
const createMockJob = (overrides: any = {}) => {
  const now = new Date();
  const startTime = new Date(now.getTime() - 3600000);
  
  return {
    id: overrides.id || 'job-1',
    machine_id: overrides.machine_id || 'machine-1',
    quantity: overrides.quantity ?? 100,
    lost_pieces: overrides.lost_pieces ?? 5,
    estimated_duration: overrides.estimated_duration ?? 60,
    actual_start_time: overrides.actual_start_time || startTime.toISOString(),
    actual_end_time: overrides.actual_end_time || now.toISOString(),
    ...overrides,
  };
};

describe('useOperatorEvolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should return loading state initially', () => {
      mockSupabaseSelect.mockReturnValue({ data: null, error: null });

      const { result } = renderHook(() => useOperatorEvolution(7), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Empty Data', () => {
    it('should return empty arrays when no data', async () => {
      mockSupabaseSelect.mockReturnValue({ data: [], error: null });

      const { result } = renderHook(() => useOperatorEvolution(7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.evolutionData).toEqual([]);
      });
    });
  });

  describe('Data Calculation', () => {
    it('should return evolution data structure', async () => {
      mockSupabaseSelect.mockReturnValue({ data: [], error: null });

      const { result } = renderHook(() => useOperatorEvolution(7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.evolutionData).toBeDefined();
      expect(result.current.overallDailyData).toBeDefined();
      expect(Array.isArray(result.current.evolutionData)).toBe(true);
      expect(Array.isArray(result.current.overallDailyData)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle different day ranges', async () => {
      mockSupabaseSelect.mockReturnValue({ data: [], error: null });

      const { result: result7 } = renderHook(() => useOperatorEvolution(7), {
        wrapper: createWrapper(),
      });

      const { result: result30 } = renderHook(() => useOperatorEvolution(30), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result7.current.isLoading).toBe(false);
        expect(result30.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockSupabaseSelect.mockReturnValue({ data: null, error: { message: 'Database error' } });

      const { result } = renderHook(() => useOperatorEvolution(7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.evolutionData).toBeDefined();
      });
    });
  });
});
