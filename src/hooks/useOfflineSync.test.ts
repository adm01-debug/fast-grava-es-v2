import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSync } from './useOfflineSync';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase properly
vi.mock('@/integrations/supabase/client', () => {
  const mockTable = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    // Make it a thenable that resolves to { data: [], error: null }
    then: vi.fn().mockImplementation(function(onFulfilled) {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    }),
  };

  return {
    supabase: {
      from: vi.fn(() => mockTable),
    },
  };
});

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
  },
}));

const setOnline = (status: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', {
    value: status,
    configurable: true,
  });
  window.dispatchEvent(new Event(status ? 'online' : 'offline'));
};

describe('useOfflineSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setOnline(true);
  });

  it('should queue actions when offline', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    expect(result.current.pendingActionsCount).toBe(1);
  });

  it('should sync actions when coming back online', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    const mockTable = (supabase.from('jobs') as any);
    mockTable.then.mockImplementationOnce((onFulfilled: any) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    });

    await act(async () => {
      setOnline(true);
      // The hook has a useEffect that triggers sync when isOnline changes and pendingActions > 0
      // But it might need an extra tick
      await result.current.syncPendingActions();
    });

    expect(result.current.pendingActionsCount).toBe(0);
  });

  it('should handle sync failures and retries', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    const mockTable = (supabase.from('jobs') as any);
    mockTable.then.mockImplementationOnce((onFulfilled: any) => {
      return Promise.resolve({ data: null, error: new Error('Network error') }).then(onFulfilled);
    });

    await act(async () => {
      setOnline(true);
      await result.current.syncPendingActions();
    });

    expect(result.current.pendingActionsCount).toBe(1);
    expect(result.current.pendingActions[0].retryCount).toBe(1);
  });
});
