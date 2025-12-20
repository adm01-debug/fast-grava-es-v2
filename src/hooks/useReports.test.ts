import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReports } from './useReports';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 'r1', type: 'productivity', period: 'daily', generated_at: '2024-01-15', data: { efficiency: 85 } },
          { id: 'r2', type: 'quality', period: 'weekly', generated_at: '2024-01-14', data: { defect_rate: 2.5 } },
          { id: 'r3', type: 'maintenance', period: 'monthly', generated_at: '2024-01-01', data: { uptime: 98 } },
        ],
        error: null,
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new' }, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: { total: 1000 }, error: null })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useReports', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch reports', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.reports).toBeDefined();
      expect(result.current.reports.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Report Types', () => {
    it('should list available report types', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.availableReportTypes).toContain('productivity');
      expect(result.current.availableReportTypes).toContain('quality');
      expect(result.current.availableReportTypes).toContain('maintenance');
    });

    it('should filter by type', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const productivityReports = result.current.filterByType('productivity');
      expect(productivityReports.every(r => r.type === 'productivity')).toBe(true);
    });
  });

  describe('Report Generation', () => {
    it('should have generate function', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.generateReport).toBe('function');
    });

    it('should have export to PDF function', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.exportToPDF).toBe('function');
    });

    it('should have export to Excel function', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.exportToExcel).toBe('function');
    });
  });

  describe('Scheduling', () => {
    it('should have schedule function', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.scheduleReport).toBe('function');
    });

    it('should list scheduled reports', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.scheduledReports).toBeDefined();
    });
  });

  describe('Period Selection', () => {
    it('should filter by period', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const dailyReports = result.current.filterByPeriod('daily');
      expect(dailyReports.every(r => r.period === 'daily')).toBe(true);
    });

    it('should support custom date range', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.getReportsInRange).toBe('function');
    });
  });

  describe('Dashboard Integration', () => {
    it('should provide dashboard data', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.dashboardData).toBeDefined();
    });

    it('should provide chart data', async () => {
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.chartData).toBeDefined();
    });
  });
});
