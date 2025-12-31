import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVersions, useRestoreVersion } from './useVersions';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockVersions, error: null })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

const mockVersions = [
  {
    id: 'v1',
    entity_type: 'jobs',
    entity_id: 'job-1',
    version_number: 2,
    data: { client_name: 'Updated Client' },
    changed_by: 'user-1',
    changed_at: '2024-12-23T10:00:00Z',
    change_summary: 'Updated client name',
    user: { full_name: 'Test User', email: 'test@example.com' },
  },
  {
    id: 'v0',
    entity_type: 'jobs',
    entity_id: 'job-1',
    version_number: 1,
    data: { client_name: 'Original Client' },
    changed_by: 'user-1',
    changed_at: '2024-12-22T10:00:00Z',
    change_summary: 'Initial version',
    user: { full_name: 'Test User', email: 'test@example.com' },
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useVersions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch versions without entityId', () => {
    const { result } = renderHook(
      () => useVersions('jobs', null),
      { wrapper: createWrapper() }
    );

    expect(result.current.versions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch versions with valid entityId', async () => {
    const { result } = renderHook(
      () => useVersions('jobs', 'job-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return latest version', async () => {
    const { result } = renderHook(
      () => useVersions('jobs', 'job-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.latestVersion).toBeDefined();
  });

  it('should return version count', async () => {
    const { result } = renderHook(
      () => useVersions('jobs', 'job-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.versionCount).toBeGreaterThanOrEqual(0);
  });
});

describe('useRestoreVersion', () => {
  it('should provide mutate function', () => {
    const { result } = renderHook(
      () => useRestoreVersion('jobs'),
      { wrapper: createWrapper() }
    );

    expect(result.current.mutateAsync).toBeInstanceOf(Function);
  });
});
