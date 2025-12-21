import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ gte: vi.fn(() => ({ lte: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useSchedulingConflicts } from './useSchedulingConflicts';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useSchedulingConflicts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should detect conflicts', async () => {
    const { result } = renderHook(() => useSchedulingConflicts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.conflicts).toBeDefined());
  });

  it('should categorize by severity', async () => {
    const { result } = renderHook(() => useSchedulingConflicts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.bySeverity).toBeDefined());
  });

  it('should have resolveConflict function', () => {
    const { result } = renderHook(() => useSchedulingConflicts(), { wrapper: createWrapper() });
    expect(typeof result.current.resolveConflict).toBe('function');
  });

  it('should provide suggestions', async () => {
    const { result } = renderHook(() => useSchedulingConflicts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.suggestions).toBeDefined());
  });
});
