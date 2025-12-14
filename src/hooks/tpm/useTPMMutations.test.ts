import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase client
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      select: mockSelect,
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  categorizeError: vi.fn(() => 'database_error'),
  showErrorToast: vi.fn(),
}));

import { useTPMMutations } from './useTPMMutations';
import { MaintenanceSchedule, MaintenanceAlert } from './types';
import { toast } from 'sonner';

describe('useTPMMutations', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  const mockSchedules: MaintenanceSchedule[] = [
    {
      id: 's1',
      machine_id: 'm1',
      maintenance_type_id: 'mt1',
      name: 'Weekly Check',
      description: null,
      interval_days: 7,
      last_completed_at: null,
      next_due_at: new Date().toISOString(), // Due today
      estimated_duration_minutes: 60,
      is_active: true,
      created_by: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 's2',
      machine_id: 'm2',
      maintenance_type_id: 'mt1',
      name: 'Monthly Check',
      description: null,
      interval_days: 30,
      last_completed_at: null,
      next_due_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Overdue 5 days
      estimated_duration_minutes: 120,
      is_active: true,
      created_by: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockAlerts: MaintenanceAlert[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mock implementations
    mockInsert.mockReturnValue({ error: null });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: mockSchedules[0], error: null }),
        single: vi.fn().mockResolvedValue({ data: { id: 'r1' }, error: null }),
      }),
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({ data: { id: 'r1' }, error: null });
  });

  describe('createSchedule', () => {
    it('should call supabase insert with correct data', async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: mockAlerts }),
        { wrapper: createWrapper() }
      );

      const scheduleData = {
        machine_id: 'm1',
        maintenance_type_id: 'mt1',
        name: 'New Schedule',
        interval_days: 7,
        next_due_at: '2024-02-01T10:00:00Z',
        estimated_duration_minutes: 60,
      };

      await act(async () => {
        await result.current.createSchedule.mutateAsync(scheduleData);
      });

      expect(mockInsert).toHaveBeenCalledWith(scheduleData);
      expect(toast.success).toHaveBeenCalledWith('Manutenção agendada com sucesso');
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Database error');
      mockInsert.mockResolvedValue({ error });

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: mockAlerts }),
        { wrapper: createWrapper() }
      );

      await expect(
        act(async () => {
          await result.current.createSchedule.mutateAsync({
            machine_id: 'm1',
            maintenance_type_id: 'mt1',
            name: 'New Schedule',
            interval_days: 7,
            next_due_at: '2024-02-01',
            estimated_duration_minutes: 60,
          });
        })
      ).rejects.toThrow();
    });
  });

  describe('resolveAlert', () => {
    it('should update alert with resolved status', async () => {
      mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: mockAlerts }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.resolveAlert.mutateAsync('alert-1');
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          is_resolved: true,
          resolved_at: expect.any(String),
        })
      );
    });
  });

  describe('checkAndGenerateAlerts', () => {
    it('should generate alerts for due and overdue schedules', async () => {
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: [] }),
        { wrapper: createWrapper() }
      );

      let count: number = 0;
      await act(async () => {
        count = await result.current.checkAndGenerateAlerts.mutateAsync();
      });

      expect(count).toBeGreaterThan(0);
    });

    it('should not create duplicate alerts', async () => {
      const existingAlerts: MaintenanceAlert[] = [
        {
          id: 'a1',
          schedule_id: 's1',
          machine_id: 'm1',
          alert_type: 'due',
          message: 'Existing alert',
          is_read: false,
          is_resolved: false,
          resolved_by: null,
          resolved_at: null,
          created_at: '2024-01-15',
        },
      ];

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: existingAlerts }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.checkAndGenerateAlerts.mutateAsync();
      });

      // Should only create alert for s2, not s1 (already has alert)
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('mutation states', () => {
    it('should track isPending state correctly', async () => {
      mockInsert.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );

      const { result } = renderHook(
        () => useTPMMutations({ schedules: mockSchedules, alerts: mockAlerts }),
        { wrapper: createWrapper() }
      );

      expect(result.current.createSchedule.isPending).toBe(false);

      const promise = act(async () => {
        await result.current.createSchedule.mutateAsync({
          machine_id: 'm1',
          maintenance_type_id: 'mt1',
          name: 'New Schedule',
          interval_days: 7,
          next_due_at: '2024-02-01',
          estimated_duration_minutes: 60,
        });
      });

      // isPending should be true during mutation
      expect(result.current.createSchedule.isPending).toBe(true);

      await promise;
    });
  });
});
