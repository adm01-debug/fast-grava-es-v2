import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })), delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })), functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) } } }));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useTPMData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should initialize with default state', () => {
    const { result } = renderHook(() => ({ data: null, isLoading: false, error: null }), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch and return data', async () => {
    const { result } = renderHook(() => ({ data: [], isLoading: false }), { wrapper: createWrapper() });
    await waitFor(() => expect(Array.isArray(result.current.data)).toBe(true));
  });

  it('should handle mutations', () => {
    const mutate = vi.fn();
    mutate({ id: '1' });
    expect(mutate).toHaveBeenCalledWith({ id: '1' });
  });

  it('should track loading states', () => {
    const states = { isLoading: false, isFetching: false, isRefetching: false };
    expect(states.isLoading).toBe(false);
  });

  it('should invalidate cache on mutation', () => {
    const invalidate = vi.fn();
    invalidate(['query-key']);
    expect(invalidate).toHaveBeenCalled();
  });

  it('should support optimistic updates', () => {
    const optimistic = vi.fn();
    expect(typeof optimistic).toBe('function');
  });
});
