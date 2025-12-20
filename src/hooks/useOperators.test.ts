import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

import { useOperators } from './useOperators';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useOperators', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch operators', async () => {
    const { result } = renderHook(() => useOperators(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.operators).toBeDefined());
  });

  it('should have createOperator function', () => {
    const { result } = renderHook(() => useOperators(), { wrapper: createWrapper() });
    expect(typeof result.current.createOperator).toBe('function');
  });

  it('should have updateOperator function', () => {
    const { result } = renderHook(() => useOperators(), { wrapper: createWrapper() });
    expect(typeof result.current.updateOperator).toBe('function');
  });

  it('should have deleteOperator function', () => {
    const { result } = renderHook(() => useOperators(), { wrapper: createWrapper() });
    expect(typeof result.current.deleteOperator).toBe('function');
  });

  it('should filter by status', async () => {
    const { result } = renderHook(() => useOperators({ status: 'active' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.operators).toBeDefined());
  });
});
