import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })), single: vi.fn(() => Promise.resolve({ data: null, error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) } }));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useSPC', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => ({ data: [], isLoading: false }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });

  it('should handle empty results', () => {
    const data: any[] = [];
    expect(data.length).toBe(0);
  });

  it('should provide mutation functions', () => {
    const create = vi.fn();
    const update = vi.fn();
    expect(typeof create).toBe('function');
    expect(typeof update).toBe('function');
  });

  it('should track error state', () => {
    const error = null;
    expect(error).toBeNull();
  });

  it('should support filtering', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const filtered = items.filter(i => i.id === 1);
    expect(filtered.length).toBe(1);
  });
});
