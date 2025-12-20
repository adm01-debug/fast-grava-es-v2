import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamification } from './useGamification';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: getMockDataForTable(table),
          error: null,
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: getMockDataForTable(table),
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new-1' }, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
      })),
    })),
  },
}));

function getMockDataForTable(table: string) {
  const mockData: Record<string, any[]> = {
    operator_achievements: [
      { id: '1', operator_id: 'op-1', achievement_id: 'ach-1', earned_at: '2024-01-15', points: 100 },
      { id: '2', operator_id: 'op-1', achievement_id: 'ach-2', earned_at: '2024-01-16', points: 50 },
    ],
    achievements: [
      { id: 'ach-1', name: 'First Job', description: 'Complete your first job', points: 100, icon: '🏆' },
      { id: 'ach-2', name: 'Speed Demon', description: 'Complete 10 jobs in a day', points: 50, icon: '⚡' },
      { id: 'ach-3', name: 'Perfect Week', description: 'No defects for a week', points: 200, icon: '✨' },
    ],
    leaderboard: [
      { operator_id: 'op-1', name: 'Operator 1', total_points: 1500, rank: 1 },
      { operator_id: 'op-2', name: 'Operator 2', total_points: 1200, rank: 2 },
      { operator_id: 'op-3', name: 'Operator 3', total_points: 1000, rank: 3 },
    ],
    operator_streaks: [
      { operator_id: 'op-1', streak_type: 'daily', current_streak: 5, best_streak: 10 },
    ],
  };
  return mockData[table] || [];
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Points System', () => {
    it('should fetch operator points', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it('should calculate level from points', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.level).toBeGreaterThanOrEqual(1);
    });

    it('should calculate progress to next level', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.progressToNextLevel).toBeGreaterThanOrEqual(0);
      expect(result.current.progressToNextLevel).toBeLessThanOrEqual(100);
    });

    it('should show points needed for next level', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pointsToNextLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Achievements', () => {
    it('should fetch earned achievements', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.earnedAchievements).toBeDefined();
      expect(Array.isArray(result.current.earnedAchievements)).toBe(true);
    });

    it('should fetch available achievements', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.availableAchievements).toBeDefined();
      expect(Array.isArray(result.current.availableAchievements)).toBe(true);
    });

    it('should identify locked achievements', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lockedAchievements).toBeDefined();
    });

    it('should show achievement progress', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.achievementProgress).toBeDefined();
    });
  });

  describe('Leaderboard', () => {
    it('should fetch leaderboard', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.leaderboard).toBeDefined();
      expect(Array.isArray(result.current.leaderboard)).toBe(true);
    });

    it('should show operator rank', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentRank).toBeGreaterThanOrEqual(1);
    });

    it('should sort leaderboard by points', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const leaderboard = result.current.leaderboard;
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i - 1].total_points).toBeGreaterThanOrEqual(leaderboard[i].total_points);
      }
    });

    it('should filter leaderboard by period', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1', leaderboardPeriod: 'weekly' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.leaderboard).toBeDefined();
    });
  });

  describe('Streaks', () => {
    it('should track current streak', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBeGreaterThanOrEqual(0);
    });

    it('should track best streak', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bestStreak).toBeGreaterThanOrEqual(0);
    });

    it('should indicate if streak is at risk', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.streakAtRisk).toBe('boolean');
    });
  });

  describe('Badges', () => {
    it('should return earned badges', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.badges).toBeDefined();
      expect(Array.isArray(result.current.badges)).toBe(true);
    });

    it('should categorize badges by type', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.badgesByCategory).toBeDefined();
    });
  });

  describe('Challenges', () => {
    it('should fetch active challenges', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activeChallenges).toBeDefined();
      expect(Array.isArray(result.current.activeChallenges)).toBe(true);
    });

    it('should show challenge progress', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.activeChallenges.forEach(challenge => {
        expect(challenge.progress).toBeGreaterThanOrEqual(0);
        expect(challenge.progress).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Rewards', () => {
    it('should list available rewards', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.availableRewards).toBeDefined();
    });

    it('should check if reward is redeemable', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.canRedeemReward).toBe('function');
    });
  });

  describe('Notifications', () => {
    it('should return recent achievements notifications', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recentNotifications).toBeDefined();
    });

    it('should mark notifications as read', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.markNotificationRead).toBe('function');
    });
  });

  describe('Stats', () => {
    it('should calculate achievement completion percentage', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.achievementCompletion).toBeGreaterThanOrEqual(0);
      expect(result.current.stats.achievementCompletion).toBeLessThanOrEqual(100);
    });

    it('should track total achievements earned', async () => {
      const { result } = renderHook(
        () => useGamification({ operatorId: 'op-1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.totalAchievements).toBeGreaterThanOrEqual(0);
    });
  });
});
