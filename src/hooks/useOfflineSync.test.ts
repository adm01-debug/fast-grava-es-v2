import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSync } from './useOfflineSync';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  }));
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

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

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    expect(result.current.pendingActionsCount).toBe(1);
    expect(result.current.pendingActions[0].type).toBe('update_job');
    expect(localStorage.getItem('fastgravacoes_pending_actions')).toContain('update_job');
  });

  it('should sync actions when coming back online', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    expect(result.current.pendingActionsCount).toBe(1);

    // Mock successful update
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(mockUpdate),
    });

    await act(async () => {
      setOnline(true);
    });

    // We need to wait for the sync effect to run
    // Since it's inside a useEffect with a ref, it might take a moment
    await act(async () => {
      await result.current.syncPendingActions();
    });

    expect(result.current.pendingActionsCount).toBe(0);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should handle sync failures and retries', async () => {
    setOnline(false);
    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      result.current.updateJobOffline('job-1', { status: 'in_progress' });
    });

    // Mock failed update
    (supabase.from as any).mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: new Error('Network error') }),
    });

    await act(async () => {
      setOnline(true);
      await result.current.syncPendingActions();
    });

    // Should still be in pending actions with retryCount 1
    expect(result.current.pendingActionsCount).toBe(1);
    expect(result.current.pendingActions[0].retryCount).toBe(1);
  });
});
