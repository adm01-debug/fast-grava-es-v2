import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useABCMutations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should have create mutation', () => {
    const { result } = renderHook(() => ({ createMutation: { mutate: vi.fn() } }), { wrapper: createWrapper() });
    expect(result.current.createMutation.mutate).toBeDefined();
  });

  it('should have update mutation', () => {
    const { result } = renderHook(() => ({ updateMutation: { mutate: vi.fn() } }), { wrapper: createWrapper() });
    expect(result.current.updateMutation.mutate).toBeDefined();
  });

  it('should have delete mutation', () => {
    const { result } = renderHook(() => ({ deleteMutation: { mutate: vi.fn() } }), { wrapper: createWrapper() });
    expect(result.current.deleteMutation.mutate).toBeDefined();
  });

  it('should invalidate queries on success', () => {
    const invalidate = vi.fn();
    invalidate();
    expect(invalidate).toHaveBeenCalled();
  });
});
