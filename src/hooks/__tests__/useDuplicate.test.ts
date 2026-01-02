import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDuplicate } from './useDuplicate';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'Test' }, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '2', name: 'Test (Cópia)' }, error: null })),
        })),
      })),
    })),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useDuplicate', () => {
  it('should have duplicate function', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    expect(result.current.duplicate).toBeInstanceOf(Function);
  });

  it('should have bulkDuplicate function', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    expect(result.current.bulkDuplicate).toBeInstanceOf(Function);
  });

  it('should not be duplicating initially', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    expect(result.current.isDuplicating).toBe(false);
  });
});
