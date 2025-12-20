import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDailySummaryNotifications } from './useDailySummaryNotifications';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: {
          jobs_completed: 45,
          jobs_pending: 12,
          efficiency_rate: 87.5,
          defect_rate: 2.3,
          top_operator: 'João Silva',
          issues: ['Máquina 3 parada', 'Atraso fornecedor'],
        },
        error: null,
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: { summary: {} }, error: null })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDailySummaryNotifications', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Summary Data', () => {
    it('should fetch daily summary', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.summary).toBeDefined();
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should include jobs statistics', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.summary.jobs_completed).toBeDefined();
      expect(result.current.summary.jobs_pending).toBeDefined();
    });

    it('should include efficiency metrics', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.summary.efficiency_rate).toBeDefined();
    });
  });

  describe('Notification Settings', () => {
    it('should have notification enabled state', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.notificationsEnabled).toBe('boolean');
    });

    it('should toggle notifications', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.toggleNotifications).toBe('function');
    });

    it('should set notification time', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.setNotificationTime).toBe('function');
    });
  });

  describe('Summary Generation', () => {
    it('should generate summary text', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.summaryText).toBeDefined();
      expect(typeof result.current.summaryText).toBe('string');
    });

    it('should format for notification', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.notificationPayload).toBeDefined();
    });
  });

  describe('History', () => {
    it('should track sent notifications', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.notificationHistory).toBeDefined();
    });

    it('should get last notification time', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.lastNotificationSent).toBeDefined();
    });
  });

  describe('Manual Trigger', () => {
    it('should have send now function', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.sendNow).toBe('function');
    });

    it('should have preview function', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.previewSummary).toBe('function');
    });
  });
});
