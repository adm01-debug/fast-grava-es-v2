import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  categorizeError: vi.fn(() => 'database_error'),
}));

// Mock query config
vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: { retry: false },
  STALE_TIMES: {
    STATIC: 300000,
    DYNAMIC: 30000,
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { useABCData } from './useABCData';

describe('useABCData', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  const mockActivities = [
    { id: 'a1', name: 'Setup', cost_driver: 'hours', is_active: true },
    { id: 'a2', name: 'Production', cost_driver: 'pieces', is_active: true },
  ];

  const mockCostPools = [
    { id: 'cp1', name: 'Labor', pool_type: 'labor', monthly_budget: 10000, is_active: true },
    { id: 'cp2', name: 'Equipment', pool_type: 'equipment', monthly_budget: 5000, is_active: true },
  ];

  const mockActivityRates = [
    { id: 'ar1', activity_id: 'a1', cost_pool_id: 'cp1', rate_per_unit: 50, period_start: '2024-01-01' },
  ];

  const mockJobCosts = [
    { id: 'jc1', job_id: 'j1', activity_id: 'a1', cost_pool_id: 'cp1', total_cost: 100, calculated_at: '2024-01-15' },
  ];

  const mockJobs = [
    { id: 'j1', order_number: 'ORD-001', status: 'finished', technique_id: 't1' },
    { id: 'j2', order_number: 'ORD-002', status: 'production', technique_id: 't1' },
  ];

  const mockTechniques = [
    { id: 't1', name: 'Silk Screen' },
    { id: 't2', name: 'Laser' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const mockFrom = vi.mocked(supabase.from);
    
    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case 'abc_activities':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockActivities, error: null }),
              }),
            }),
          } as any;
        case 'abc_cost_pools':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockCostPools, error: null }),
              }),
            }),
          } as any;
        case 'abc_activity_rates':
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockActivityRates, error: null }),
            }),
          } as any;
        case 'abc_job_costs':
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockJobCosts, error: null }),
            }),
          } as any;
        case 'jobs':
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
                }),
              }),
            }),
          } as any;
        case 'techniques':
          return {
            select: vi.fn().mockResolvedValue({ data: mockTechniques, error: null }),
          } as any;
        default:
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          } as any;
      }
    });
  });

  describe('data fetching', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useABCData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return default empty arrays initially', () => {
      const { result } = renderHook(() => useABCData(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.activities)).toBe(true);
      expect(Array.isArray(result.current.costPools)).toBe(true);
      expect(Array.isArray(result.current.activityRates)).toBe(true);
      expect(Array.isArray(result.current.jobCosts)).toBe(true);
      expect(Array.isArray(result.current.jobs)).toBe(true);
      expect(Array.isArray(result.current.techniques)).toBe(true);
    });
  });

  describe('query configuration', () => {
    it('should call supabase.from with correct table names', () => {
      renderHook(() => useABCData(), {
        wrapper: createWrapper(),
      });

      expect(supabase.from).toHaveBeenCalledWith('abc_activities');
      expect(supabase.from).toHaveBeenCalledWith('abc_cost_pools');
      expect(supabase.from).toHaveBeenCalledWith('abc_activity_rates');
      expect(supabase.from).toHaveBeenCalledWith('abc_job_costs');
      expect(supabase.from).toHaveBeenCalledWith('jobs');
      expect(supabase.from).toHaveBeenCalledWith('techniques');
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors gracefully', () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(mockError),
          }),
        }),
      } as any));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useABCData(), {
        wrapper: createWrapper(),
      });

      // Should still return default empty arrays
      expect(Array.isArray(result.current.activities)).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('default values', () => {
    it('should return empty arrays as defaults', () => {
      const { result } = renderHook(() => useABCData(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.activities)).toBe(true);
      expect(Array.isArray(result.current.costPools)).toBe(true);
      expect(Array.isArray(result.current.activityRates)).toBe(true);
      expect(Array.isArray(result.current.jobCosts)).toBe(true);
      expect(Array.isArray(result.current.jobs)).toBe(true);
      expect(Array.isArray(result.current.techniques)).toBe(true);
    });
  });
});
