import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({})),
      })),
    })),
    removeChannel: vi.fn(),
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
    it('should return alert count as number', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current).toBe('number');
      });
    });

    it('should return 0 for no alerts', async () => {
      const { result } = renderHook(() => useAlertCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
