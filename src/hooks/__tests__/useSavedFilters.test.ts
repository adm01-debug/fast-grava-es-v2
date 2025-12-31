import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSavedFilters } from './useSavedFilters';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockFilters, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'new-id', name: 'Test Filter' }, error: null })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } } })),
    },
  },
}));

const mockFilters = [
  { id: '1', name: 'Filter 1', filters: { status: 'active' }, is_default: true },
  { id: '2', name: 'Filter 2', filters: { status: 'pending' }, is_default: false },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSavedFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return filters for entity type', async () => {
    const { result } = renderHook(() => useSavedFilters('jobs'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.filters).toBeDefined();
  });

  it('should identify default filter', async () => {
    const { result } = renderHook(() => useSavedFilters('jobs'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.defaultFilter).toBeDefined();
  });

  it('should have save filter function', () => {
    const { result } = renderHook(() => useSavedFilters('jobs'), {
      wrapper: createWrapper(),
    });

    expect(result.current.saveFilter).toBeInstanceOf(Function);
  });

  it('should have delete filter function', () => {
    const { result } = renderHook(() => useSavedFilters('jobs'), {
      wrapper: createWrapper(),
    });

    expect(result.current.deleteFilter).toBeInstanceOf(Function);
  });

  it('should have setAsDefault function', () => {
    const { result } = renderHook(() => useSavedFilters('jobs'), {
      wrapper: createWrapper(),
    });

    expect(result.current.setAsDefault).toBeInstanceOf(Function);
  });
});
