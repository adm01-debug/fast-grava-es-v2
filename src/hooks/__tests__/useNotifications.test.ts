import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from './useNotifications';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) })),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } })) },
    channel: vi.fn(() => ({ on: vi.fn(() => ({ subscribe: vi.fn() })) })),
    removeChannel: vi.fn(),
    rpc: vi.fn(() => Promise.resolve({ error: null })),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useNotifications', () => {
  it('should return empty notifications initially', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toEqual([]);
  });

  it('should have markAsRead function', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current.markAsRead).toBeInstanceOf(Function);
  });

  it('should have markAllAsRead function', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current.markAllAsRead).toBeInstanceOf(Function);
  });
});
