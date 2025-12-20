import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useOperatorGoals, calculateGoalProgress, OperatorGoal, GoalType } from './useOperatorGoals';

// Mock data
const mockUser = { id: 'user-123' };
let mockGoals: OperatorGoal[] = [];
const mockSupabaseQuery = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseChannel = vi.fn();
const mockSupabaseRemoveChannel = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        order: () => mockSupabaseQuery(table),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => mockSupabaseInsert(data),
        }),
      }),
      update: (data: any) => ({
        eq: () => ({
          select: () => ({
            single: () => mockSupabaseUpdate(data),
          }),
        }),
      }),
      delete: () => ({
        eq: () => mockSupabaseDelete(),
      }),
    }),
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => mockSupabaseChannel(name),
      }),
    }),
    removeChannel: mockSupabaseRemoveChannel,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  categorizeError: vi.fn(() => 'unknown'),
}));

vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: {},
  STALE_TIMES: { USER: 60000 },
}));

// Helper to create wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factory
const createMockGoal = (overrides: Partial<OperatorGoal> = {}): OperatorGoal => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    id: 'goal-1',
    operator_id: 'operator-1',
    goal_type: 'efficiency',
    target_value: 85,
    period_start: startOfMonth.toISOString(),
    period_end: endOfMonth.toISOString(),
    created_by: 'user-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

describe('useOperatorGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoals = [];
    mockSupabaseChannel.mockReturnValue({ unsubscribe: vi.fn() });
  });

  describe('Initial State and Data Fetching', () => {
    it('should return empty goals initially', () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      expect(result.current.goals).toEqual([]);
      expect(result.current.activeGoals).toEqual([]);
    });

    it('should fetch and return goals', async () => {
      const mockGoalsList = [
        createMockGoal({ id: 'goal-1' }),
        createMockGoal({ id: 'goal-2', goal_type: 'jobs_completed', target_value: 50 }),
      ];

      mockSupabaseQuery.mockResolvedValue({ data: mockGoalsList, error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.goals.length).toBe(2);
      });
    });

    it('should filter active goals by current period', async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const pastMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const pastMonthEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);

      const mockGoalsList = [
        createMockGoal({ 
          id: 'active-goal', 
          period_start: startOfMonth.toISOString(),
          period_end: endOfMonth.toISOString(),
        }),
        createMockGoal({ 
          id: 'past-goal', 
          period_start: pastMonth.toISOString(),
          period_end: pastMonthEnd.toISOString(),
        }),
      ];

      mockSupabaseQuery.mockResolvedValue({ data: mockGoalsList, error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.goals.length).toBe(2);
        expect(result.current.activeGoals.length).toBe(1);
        expect(result.current.activeGoals[0].id).toBe('active-goal');
      });
    });
  });

  describe('getGoalsByOperator', () => {
    it('should filter goals by operator ID', async () => {
      const mockGoalsList = [
        createMockGoal({ id: 'goal-1', operator_id: 'operator-1' }),
        createMockGoal({ id: 'goal-2', operator_id: 'operator-2' }),
        createMockGoal({ id: 'goal-3', operator_id: 'operator-1' }),
      ];

      mockSupabaseQuery.mockResolvedValue({ data: mockGoalsList, error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.goals.length).toBe(3);
      });

      const operator1Goals = result.current.getGoalsByOperator('operator-1');
      expect(operator1Goals.length).toBe(2);
      expect(operator1Goals.every(g => g.operator_id === 'operator-1')).toBe(true);
    });
  });

  describe('getCurrentMonthPeriod', () => {
    it('should return current month start and end dates', () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      const period = result.current.getCurrentMonthPeriod();
      
      expect(period.start).toMatch(/^\d{4}-\d{2}-01$/); // Should be YYYY-MM-01
      expect(period.end).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Should be YYYY-MM-DD
    });
  });

  describe('createGoal mutation', () => {
    it('should create a goal successfully', async () => {
      const newGoal = createMockGoal({ id: 'new-goal' });
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseInsert.mockResolvedValue({ data: newGoal, error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.createGoal({
          operator_id: 'operator-1',
          goal_type: 'efficiency',
          target_value: 85,
          period_start: '2024-12-01',
          period_end: '2024-12-31',
        });
      });

      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          operator_id: 'operator-1',
          goal_type: 'efficiency',
          target_value: 85,
          created_by: 'user-123',
        })
      );
    });
  });

  describe('updateGoal mutation', () => {
    it('should update a goal successfully', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseUpdate.mockResolvedValue({ data: { id: 'goal-1', target_value: 90 }, error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.updateGoal({ id: 'goal-1', target_value: 90 });
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          target_value: 90,
        })
      );
    });
  });

  describe('deleteGoal mutation', () => {
    it('should delete a goal successfully', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseDelete.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.deleteGoal('goal-1');
      });

      expect(mockSupabaseDelete).toHaveBeenCalled();
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to goal changes', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSupabaseChannel).toHaveBeenCalledWith('operator-goals-changes');
      });
    });

    it('should cleanup subscription on unmount', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { unmount } = renderHook(() => useOperatorGoals(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockSupabaseRemoveChannel).toHaveBeenCalled();
    });
  });
});

describe('calculateGoalProgress', () => {
  describe('Efficiency/Jobs/Pieces (higher is better)', () => {
    it('should calculate 0% progress when current is 0', () => {
      const goal = createMockGoal({ goal_type: 'efficiency', target_value: 85 });
      const result = calculateGoalProgress(goal, 0);

      expect(result.current_value).toBe(0);
      expect(result.progress_percentage).toBe(0);
      expect(result.is_achieved).toBe(false);
    });

    it('should calculate partial progress correctly', () => {
      const goal = createMockGoal({ goal_type: 'efficiency', target_value: 100 });
      const result = calculateGoalProgress(goal, 75);

      expect(result.progress_percentage).toBe(75);
      expect(result.is_achieved).toBe(false);
    });

    it('should calculate 100% when goal is achieved', () => {
      const goal = createMockGoal({ goal_type: 'jobs_completed', target_value: 50 });
      const result = calculateGoalProgress(goal, 50);

      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });

    it('should cap at 100% when exceeded', () => {
      const goal = createMockGoal({ goal_type: 'pieces_produced', target_value: 1000 });
      const result = calculateGoalProgress(goal, 1500);

      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });
  });

  describe('Loss Rate (lower is better)', () => {
    it('should achieve goal when loss rate is below target', () => {
      const goal = createMockGoal({ goal_type: 'loss_rate', target_value: 5 });
      const result = calculateGoalProgress(goal, 3);

      expect(result.is_achieved).toBe(true);
      expect(result.progress_percentage).toBeGreaterThan(100);
    });

    it('should not achieve goal when loss rate is above target', () => {
      const goal = createMockGoal({ goal_type: 'loss_rate', target_value: 5 });
      const result = calculateGoalProgress(goal, 8);

      expect(result.is_achieved).toBe(false);
    });

    it('should achieve 100% when loss rate is 0', () => {
      const goal = createMockGoal({ goal_type: 'loss_rate', target_value: 5 });
      const result = calculateGoalProgress(goal, 0);

      expect(result.is_achieved).toBe(true);
    });

    it('should exactly achieve goal when at target', () => {
      const goal = createMockGoal({ goal_type: 'loss_rate', target_value: 5 });
      const result = calculateGoalProgress(goal, 5);

      expect(result.is_achieved).toBe(true);
      expect(result.progress_percentage).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero target value', () => {
      const goal = createMockGoal({ goal_type: 'efficiency', target_value: 0 });
      const result = calculateGoalProgress(goal, 50);

      expect(result.progress_percentage).toBe(0);
    });

    it('should round progress to 1 decimal place', () => {
      const goal = createMockGoal({ goal_type: 'efficiency', target_value: 90 });
      const result = calculateGoalProgress(goal, 77);

      // 77/90 * 100 = 85.555... should round to 85.6
      expect(result.progress_percentage).toBe(85.6);
    });

    it('should include all original goal properties', () => {
      const goal = createMockGoal({ 
        id: 'test-goal',
        operator_id: 'op-123',
        goal_type: 'efficiency',
        target_value: 85,
      });
      const result = calculateGoalProgress(goal, 70);

      expect(result.id).toBe('test-goal');
      expect(result.operator_id).toBe('op-123');
      expect(result.goal_type).toBe('efficiency');
      expect(result.target_value).toBe(85);
    });
  });
});
