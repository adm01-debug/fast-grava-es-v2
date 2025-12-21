import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) },
}));

import { useOperatorGoals } from './useOperatorGoals';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useOperatorGoals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch goals', async () => {
    const { result } = renderHook(() => useOperatorGoals('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.goals).toBeDefined());
  });

  it('should track progress', async () => {
    const { result } = renderHook(() => useOperatorGoals('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.progress).toBeDefined());
  });

  it('should have setGoal function', () => {
    const { result } = renderHook(() => useOperatorGoals('op-1'), { wrapper: createWrapper() });
    expect(typeof result.current.setGoal).toBe('function');
  });

  it('should have updateProgress function', () => {
    const { result } = renderHook(() => useOperatorGoals('op-1'), { wrapper: createWrapper() });
    expect(typeof result.current.updateProgress).toBe('function');
  });
});
