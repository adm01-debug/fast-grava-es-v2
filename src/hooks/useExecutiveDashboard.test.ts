import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExecutiveDashboard } from './useExecutiveDashboard';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({
              data: getMockDataForTable(table),
              error: null,
            })),
          })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => Promise.resolve({
            data: getMockDataForTable(table),
            error: null,
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: { total_revenue: 150000, total_jobs: 500 },
      error: null,
    })),
  },
}));

function getMockDataForTable(table: string) {
  const mockData: Record<string, any[]> = {
    jobs: [
      { id: '1', status: 'completed', revenue: 5000, created_at: '2024-01-15' },
      { id: '2', status: 'in_progress', revenue: 3000, created_at: '2024-01-16' },
      { id: '3', status: 'pending', revenue: 2000, created_at: '2024-01-17' },
    ],
    machines: [
      { id: '1', name: 'Machine 1', status: 'active', oee: 85 },
      { id: '2', name: 'Machine 2', status: 'active', oee: 78 },
    ],
    operators: [
      { id: '1', name: 'Operator 1', productivity: 92 },
      { id: '2', name: 'Operator 2', productivity: 88 },
    ],
  };
  return mockData[table] || [];
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useExecutiveDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch dashboard data successfully', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('KPI Calculations', () => {
    it('should calculate total revenue', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.kpis.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average OEE', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.kpis.averageOEE).toBeGreaterThanOrEqual(0);
      expect(result.current.kpis.averageOEE).toBeLessThanOrEqual(100);
    });

    it('should calculate job completion rate', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.kpis.completionRate).toBeGreaterThanOrEqual(0);
      expect(result.current.kpis.completionRate).toBeLessThanOrEqual(100);
    });

    it('should calculate average productivity', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.kpis.averageProductivity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Trends', () => {
    it('should calculate revenue trend', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.trends.revenue).toBeDefined();
      expect(result.current.trends.revenue.direction).toMatch(/up|down|stable/);
    });

    it('should calculate OEE trend', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.trends.oee).toBeDefined();
    });

    it('should calculate productivity trend', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.trends.productivity).toBeDefined();
    });
  });

  describe('Charts Data', () => {
    it('should provide revenue chart data', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.charts.revenueChart).toBeDefined();
      expect(Array.isArray(result.current.charts.revenueChart)).toBe(true);
    });

    it('should provide OEE chart data', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.charts.oeeChart).toBeDefined();
    });

    it('should provide jobs distribution data', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.charts.jobsDistribution).toBeDefined();
    });
  });

  describe('Alerts and Notifications', () => {
    it('should identify critical alerts', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.alerts).toBeDefined();
      expect(Array.isArray(result.current.alerts)).toBe(true);
    });

    it('should categorize alerts by severity', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.alerts.forEach(alert => {
        expect(['critical', 'warning', 'info']).toContain(alert.severity);
      });
    });
  });

  describe('Period Selection', () => {
    it('should support daily period', async () => {
      const { result } = renderHook(
        () => useExecutiveDashboard({ period: 'daily' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.selectedPeriod).toBe('daily');
    });

    it('should support weekly period', async () => {
      const { result } = renderHook(
        () => useExecutiveDashboard({ period: 'weekly' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.selectedPeriod).toBe('weekly');
    });

    it('should support monthly period', async () => {
      const { result } = renderHook(
        () => useExecutiveDashboard({ period: 'monthly' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.selectedPeriod).toBe('monthly');
    });
  });

  describe('Comparisons', () => {
    it('should compare with previous period', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.comparison).toBeDefined();
      expect(result.current.comparison.previousPeriod).toBeDefined();
    });

    it('should calculate percentage changes', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.comparison.revenueChange).toBeDefined();
      expect(typeof result.current.comparison.revenueChange).toBe('number');
    });
  });

  describe('Top Performers', () => {
    it('should list top performing machines', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topPerformers.machines).toBeDefined();
      expect(Array.isArray(result.current.topPerformers.machines)).toBe(true);
    });

    it('should list top performing operators', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.topPerformers.operators).toBeDefined();
      expect(Array.isArray(result.current.topPerformers.operators)).toBe(true);
    });
  });

  describe('Export Functionality', () => {
    it('should support data export', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.exportData).toBe('function');
    });

    it('should support PDF export', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.exportToPDF).toBe('function');
    });
  });

  describe('Refresh', () => {
    it('should support manual refresh', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe('function');
    });

    it('should track last refresh time', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastRefresh).toBeDefined();
    });
  });
});
