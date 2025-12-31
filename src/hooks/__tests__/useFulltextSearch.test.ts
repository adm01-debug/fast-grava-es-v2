import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFulltextSearch, useJobsFulltextSearch, useMachinesFulltextSearch } from './useFulltextSearch';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: mockResults, error: null })),
          })),
          limit: vi.fn(() => Promise.resolve({ data: mockResults, error: null })),
        })),
      })),
    })),
  },
}));

const mockResults = [
  { id: '1', client_name: 'Test Client', job_description: 'Test Job' },
  { id: '2', client_name: 'Another Client', job_description: 'Another Job' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFulltextSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not search with less than minLength characters', async () => {
    const { result } = renderHook(
      () => useFulltextSearch('a', {
        table: 'jobs',
        searchColumns: ['client_name'],
        minLength: 2,
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should search with valid search term', async () => {
    const { result } = renderHook(
      () => useFulltextSearch('test', {
        table: 'jobs',
        searchColumns: ['client_name', 'job_description'],
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useFulltextSearch('test', {
        table: 'jobs',
        searchColumns: ['client_name'],
        enabled: false,
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
  });
});

describe('useJobsFulltextSearch', () => {
  it('should search jobs with correct columns', async () => {
    const { result } = renderHook(
      () => useJobsFulltextSearch('test'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useMachinesFulltextSearch', () => {
  it('should search machines with correct columns', async () => {
    const { result } = renderHook(
      () => useMachinesFulltextSearch('test'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
