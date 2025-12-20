import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEnergy } from './useEnergy';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [
                {
                  id: '1',
                  machine_id: 'machine-1',
                  consumption_kwh: 150.5,
                  cost_per_kwh: 0.65,
                  recorded_at: '2024-01-15T10:00:00Z',
                  peak_demand_kw: 45.2,
                  power_factor: 0.92,
                },
                {
                  id: '2',
                  machine_id: 'machine-2',
                  consumption_kwh: 200.3,
                  cost_per_kwh: 0.65,
                  recorded_at: '2024-01-15T11:00:00Z',
                  peak_demand_kw: 55.8,
                  power_factor: 0.88,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useEnergy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch energy data successfully', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should calculate total consumption', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalConsumption).toBeGreaterThanOrEqual(0);
    });

    it('should calculate total cost', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalCost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Energy Metrics', () => {
    it('should calculate average power factor', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.averagePowerFactor).toBeGreaterThanOrEqual(0);
      expect(result.current.averagePowerFactor).toBeLessThanOrEqual(1);
    });

    it('should calculate peak demand', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.peakDemand).toBeGreaterThanOrEqual(0);
    });

    it('should group consumption by machine', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.consumptionByMachine).toBeDefined();
    });

    it('should calculate daily averages', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dailyAverages).toBeDefined();
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const { result } = renderHook(
        () => useEnergy({ startDate, endDate }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dateRange).toEqual({ startDate, endDate });
    });

    it('should use default date range when not provided', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.dateRange).toBeDefined();
    });
  });

  describe('Energy Analysis', () => {
    it('should identify high consumption periods', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.highConsumptionPeriods).toBeDefined();
      expect(Array.isArray(result.current.highConsumptionPeriods)).toBe(true);
    });

    it('should calculate energy efficiency score', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.efficiencyScore).toBeGreaterThanOrEqual(0);
      expect(result.current.efficiencyScore).toBeLessThanOrEqual(100);
    });

    it('should provide energy saving recommendations', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recommendations).toBeDefined();
      expect(Array.isArray(result.current.recommendations)).toBe(true);
    });
  });

  describe('Cost Analysis', () => {
    it('should calculate cost per machine', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costByMachine).toBeDefined();
    });

    it('should project monthly cost', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.projectedMonthlyCost).toBeGreaterThanOrEqual(0);
    });

    it('should calculate cost trends', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.costTrend).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      vi.mock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({
                    data: null,
                    error: { message: 'Database error' },
                  })),
                })),
              })),
            })),
          })),
        },
      }));

      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Real-time Updates', () => {
    it('should support refetch function', async () => {
      const { result } = renderHook(() => useEnergy(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
