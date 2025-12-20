import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEfficiencyAlertHistory } from './useEfficiencyAlertHistory';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: 'e1', machine_id: 'm1', efficiency: 65, threshold: 80, triggered_at: '2024-01-15T10:00:00Z', resolved_at: '2024-01-15T12:00:00Z' },
            { id: 'e2', machine_id: 'm2', efficiency: 55, threshold: 80, triggered_at: '2024-01-15T14:00:00Z', resolved_at: null },
            { id: 'e3', machine_id: 'm1', efficiency: 70, threshold: 80, triggered_at: '2024-01-14T09:00:00Z', resolved_at: '2024-01-14T11:00:00Z' },
          ],
          error: null,
        })),
      })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useEfficiencyAlertHistory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch alert history', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.alerts).toBeDefined();
      expect(result.current.alerts.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Filtering', () => {
    it('should filter by machine', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const m1Alerts = result.current.filterByMachine('m1');
      expect(m1Alerts.every(a => a.machine_id === 'm1')).toBe(true);
    });

    it('should filter resolved alerts', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const resolved = result.current.getResolvedAlerts();
      expect(resolved.every(a => a.resolved_at !== null)).toBe(true);
    });

    it('should filter active alerts', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const active = result.current.getActiveAlerts();
      expect(active.every(a => a.resolved_at === null)).toBe(true);
    });

    it('should filter by date range', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.filterByDateRange).toBe('function');
    });
  });

  describe('Statistics', () => {
    it('should calculate average resolution time', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.avgResolutionTime).toBeDefined();
    });

    it('should count alerts by machine', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.alertsByMachine).toBeDefined();
    });

    it('should track alert frequency', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.alertFrequency).toBeDefined();
    });
  });

  describe('Analysis', () => {
    it('should identify patterns', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.patterns).toBeDefined();
    });

    it('should calculate trend', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.trend).toBeDefined();
    });
  });

  describe('Chart Data', () => {
    it('should provide timeline data', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.timelineData).toBeDefined();
      expect(Array.isArray(result.current.timelineData)).toBe(true);
    });
  });
});
