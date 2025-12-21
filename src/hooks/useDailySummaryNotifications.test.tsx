import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

import { useDailySummaryNotifications } from './useDailySummaryNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDailySummaryNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Summary Data', () => {
    it('should fetch daily summary', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.dailySummary).toBeDefined();
      });
    });

    it('should include jobs statistics', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.jobsStats).toBeDefined();
      });
    });

    it('should include efficiency metrics', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.efficiencyMetrics).toBeDefined();
      });
    });

    it('should include production totals', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.productionTotals).toBeDefined();
      });
    });
  });

  describe('Notification Settings', () => {
    it('should track enabled state', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.isEnabled).toBe('boolean');
      });
    });

    it('should have toggle function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.toggleEnabled).toBe('function');
    });

    it('should have notification time setting', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notificationTime).toBeDefined();
      });
    });

    it('should have setNotificationTime function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.setNotificationTime).toBe('function');
    });
  });

  describe('Summary Generation', () => {
    it('should generate summary text', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.summaryText).toBeDefined();
      });
    });

    it('should format summary for notification', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.formatForNotification).toBe('function');
      });
    });

    it('should generate highlights', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.highlights).toBeDefined();
      });
    });

    it('should identify issues', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.issues).toBeDefined();
      });
    });
  });

  describe('History', () => {
    it('should fetch sent notifications history', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.notificationHistory).toBeDefined();
      });
    });

    it('should track last notification time', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.lastNotificationTime).toBeDefined();
      });
    });
  });

  describe('Manual Trigger', () => {
    it('should have sendNow function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.sendNow).toBe('function');
    });

    it('should have preview function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.preview).toBe('function');
    });
  });

  describe('Recipients', () => {
    it('should manage recipients list', async () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.recipients).toBeDefined();
      });
    });

    it('should have addRecipient function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.addRecipient).toBe('function');
    });

    it('should have removeRecipient function', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.removeRecipient).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should track sending state', () => {
      const { result } = renderHook(() => useDailySummaryNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isSending).toBe('boolean');
    });
  });
});
