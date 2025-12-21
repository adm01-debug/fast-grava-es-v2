import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          count: vi.fn(() => Promise.resolve({ count: 5, error: null })),
        })),
        in: vi.fn(() => ({
          count: vi.fn(() => Promise.resolve({ count: 3, error: null })),
        })),
        count: vi.fn(() => Promise.resolve({ count: 10, error: null })),
      })),
    })),
  },
}));

import { useAlertCount } from './useAlertCount';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAlertCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Counting', () => {
    it('should return total alert count', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.totalCount).toBeDefined();
      });
    });

    it('should return unread count', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBeDefined();
      });
    });

    it('should count by severity', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.criticalCount).toBeDefined();
        expect(result.current.warningCount).toBeDefined();
        expect(result.current.infoCount).toBeDefined();
      });
    });

    it('should count by type', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.countByType).toBeDefined();
      });
    });
  });

  describe('Display Properties', () => {
    it('should indicate if has critical alerts', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.hasCritical).toBe('boolean');
      });
    });

    it('should provide badge count', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.badgeCount).toBeDefined();
      });
    });

    it('should provide badge text', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.badgeText).toBeDefined();
      });
    });
  });

  describe('Realtime Updates', () => {
    it('should have refetch function', () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
