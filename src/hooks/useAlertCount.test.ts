import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAlertCount } from './useAlertCount';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [
            { id: 'a1', type: 'maintenance', severity: 'critical', read: false },
            { id: 'a2', type: 'quality', severity: 'warning', read: false },
            { id: 'a3', type: 'production', severity: 'info', read: true },
            { id: 'a4', type: 'maintenance', severity: 'critical', read: false },
          ],
          error: null,
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAlertCount', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Counting', () => {
    it('should count total alerts', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.totalCount).toBe(4);
    });

    it('should count unread alerts', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.unreadCount).toBe(3);
    });

    it('should count by severity', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.criticalCount).toBe(2);
      expect(result.current.warningCount).toBe(1);
      expect(result.current.infoCount).toBe(1);
    });

    it('should count by type', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.countByType.maintenance).toBe(2);
      expect(result.current.countByType.quality).toBe(1);
    });
  });

  describe('Display', () => {
    it('should indicate if has critical alerts', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.hasCritical).toBe(true);
    });

    it('should provide badge count', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.badgeCount).toBe(3);
    });

    it('should format badge text', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.badgeText).toBeDefined();
    });
  });

  describe('Realtime', () => {
    it('should have refetch function', async () => {
      const { result } = renderHook(() => useAlertCount(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});
