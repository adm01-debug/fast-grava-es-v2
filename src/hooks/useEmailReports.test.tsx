import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

import { useEmailReports } from './useEmailReports';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEmailReports', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should have sendReport function', () => {
    const { result } = renderHook(() => useEmailReports(), { wrapper: createWrapper() });
    expect(typeof result.current.sendReport).toBe('function');
  });

  it('should have scheduleReport function', () => {
    const { result } = renderHook(() => useEmailReports(), { wrapper: createWrapper() });
    expect(typeof result.current.scheduleReport).toBe('function');
  });

  it('should fetch scheduled reports', async () => {
    const { result } = renderHook(() => useEmailReports(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.scheduledReports).toBeDefined());
  });

  it('should track sending state', () => {
    const { result } = renderHook(() => useEmailReports(), { wrapper: createWrapper() });
    expect(typeof result.current.isSending).toBe('boolean');
  });
});
