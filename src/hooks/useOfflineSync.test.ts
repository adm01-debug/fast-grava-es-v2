import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSync } from './useOfflineSync';
import { supabase } from '@/integrations/supabase/client';

// Better Mocking Strategy
vi.mock('@/integrations/supabase/client', () => {
  const mockTable = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((resolve) => resolve({ data: [], error: null })),
  };

  return {
    supabase: {
      from: vi.fn(() => mockTable),
    },
  };
});

// Mock logger to avoid errors during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    critical: vi.fn(),
  },
}));

// Mock navigator.onLine
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

  it('should initialize with online status', () => {
    const { result } = renderHook(() => useOfflineSync());
    expect(result.current.isOnline).toBe(true);
  });

  it('should queue actions when offline', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    expect(result.current.pendingActionsCount).toBe(1);
    expect(result.current.pendingActions[0].type).toBe('update_job');
    expect(localStorage.getItem('fastgravacoes_pending_actions')).toContain('update_job');
  });

  it('should sync actions when coming back online', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    expect(result.current.pendingActionsCount).toBe(1);

    // Mock successful update
    const mockTable = (supabase.from('jobs') as any);
    mockTable.then.mockImplementationOnce((resolve: any) => resolve({ data: [], error: null }));

    setOnline(true);
    
    // Explicitly call sync
    await act(async () => {
      await result.current.syncPendingActions();
    });

    expect(result.current.pendingActionsCount).toBe(0);
  });

  it('should handle sync failures and retries', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    act(() => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    // Mock failed update
    const mockTable = (supabase.from('jobs') as any);
    mockTable.then.mockImplementationOnce((resolve: any) => resolve({ data: null, error: new Error('Network error') }));

    setOnline(true);
    
    await act(async () => {
      await result.current.syncPendingActions();
    });

    // Should still be in pending actions with retryCount 1
    expect(result.current.pendingActionsCount).toBe(1);
    expect(result.current.pendingActions[0].retryCount).toBe(1);
  });
});
