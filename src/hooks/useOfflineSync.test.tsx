import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [], error: null })), upsert: vi.fn(() => Promise.resolve({ data: null, error: null })) })) },
}));

import { useOfflineSync } from './useOfflineSync';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useOfflineSync', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should track online status', () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper: createWrapper() });
    expect(typeof result.current.isOnline).toBe('boolean');
  });

  it('should track pending changes', async () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.pendingChanges).toBeDefined());
  });

  it('should have syncNow function', () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper: createWrapper() });
    expect(typeof result.current.syncNow).toBe('function');
  });

  it('should track syncing state', () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper: createWrapper() });
    expect(typeof result.current.isSyncing).toBe('boolean');
  });

  it('should track last sync time', async () => {
    const { result } = renderHook(() => useOfflineSync(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.lastSyncTime).toBeDefined());
  });
});
