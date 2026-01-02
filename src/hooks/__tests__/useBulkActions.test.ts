import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBulkActions } from './useBulkActions';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({ in: vi.fn(() => Promise.resolve({ error: null })) })),
      update: vi.fn(() => ({ in: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useBulkActions', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    expect(result.current.selectedCount).toBe(0);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    result.current.toggleSelection('id-1');
    expect(result.current.selectedCount).toBe(1);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    result.current.toggleSelection('id-1');
    result.current.clearSelection();
    expect(result.current.selectedCount).toBe(0);
  });

  it('should select all', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'jobs', queryKey: ['jobs'] }), { wrapper: createWrapper() });
    result.current.selectAll(['id-1', 'id-2', 'id-3']);
    expect(result.current.selectedCount).toBe(3);
  });
});
