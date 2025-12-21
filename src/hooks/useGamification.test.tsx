import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

import { useGamification } from './useGamification';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGamification', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Points', () => {
    it('should fetch user points', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.points).toBeDefined());
    });

    it('should fetch total points', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.totalPoints).toBeDefined());
    });
  });

  describe('Achievements', () => {
    it('should fetch achievements', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.achievements).toBeDefined());
    });

    it('should fetch unlocked achievements', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.unlockedAchievements).toBeDefined());
    });
  });

  describe('Leaderboard', () => {
    it('should fetch leaderboard', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.leaderboard).toBeDefined());
    });

    it('should get user rank', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.userRank).toBeDefined());
    });
  });

  describe('Streaks', () => {
    it('should track current streak', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.currentStreak).toBeDefined());
    });

    it('should track longest streak', async () => {
      const { result } = renderHook(() => useGamification('user-1'), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.longestStreak).toBeDefined());
    });
  });
});
