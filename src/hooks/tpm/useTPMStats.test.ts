import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTPMStats } from './useTPMStats';
import { MaintenanceSchedule, MaintenanceRecord, MaintenanceAlert } from './types';

// Mock date-fns functions for consistent testing
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    isPast: vi.fn((date: Date) => date < new Date('2024-01-15T12:00:00Z')),
    isToday: vi.fn((date: Date) => {
      const today = new Date('2024-01-15');
      return date.toDateString() === today.toDateString();
    }),
    isFuture: vi.fn((date: Date) => date > new Date('2024-01-15T23:59:59Z')),
    differenceInDays: vi.fn((date1: Date, date2: Date) => {
      return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    }),
  };
});

describe('useTPMStats', () => {
  const mockSchedules: MaintenanceSchedule[] = [
    {
      id: '1',
      machine_id: 'm1',
      maintenance_type_id: 'mt1',
      name: 'Daily Check',
      description: null,
      next_due_at: '2024-01-15T10:00:00Z', // Today
      interval_days: 1,
      is_active: true,
      estimated_duration_minutes: 30,
      last_completed_at: null,
      created_by: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      machine_id: 'm2',
      maintenance_type_id: 'mt1',
      name: 'Weekly Check',
      description: null,
      next_due_at: '2024-01-10T10:00:00Z', // Overdue (past)
      interval_days: 7,
      is_active: true,
      estimated_duration_minutes: 60,
      last_completed_at: null,
      created_by: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      machine_id: 'm3',
      maintenance_type_id: 'mt2',
      name: 'Monthly Check',
      description: null,
      next_due_at: '2024-01-20T10:00:00Z', // Upcoming (within 7 days)
      interval_days: 30,
      is_active: true,
      estimated_duration_minutes: 120,
      last_completed_at: null,
      created_by: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      machine_id: 'm4',
      maintenance_type_id: 'mt2',
      name: 'Quarterly Check',
      description: null,
      next_due_at: '2024-02-15T10:00:00Z', // Future (beyond 7 days)
      interval_days: 90,
      is_active: true,
      estimated_duration_minutes: 240,
      last_completed_at: null,
      created_by: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockRecords: MaintenanceRecord[] = [
    {
      id: 'r1',
      schedule_id: '1',
      machine_id: 'm1',
      maintenance_type_id: 'mt1',
      status: 'completed',
      started_at: '2024-01-14T10:00:00Z',
      completed_at: '2024-01-14T10:30:00Z',
      performed_by: null,
      performed_by_name: null,
      notes: null,
      photos: [],
      total_cost: 0,
      downtime_minutes: 30,
      created_at: '2024-01-14T10:00:00Z',
    },
    {
      id: 'r2',
      schedule_id: '2',
      machine_id: 'm2',
      maintenance_type_id: 'mt1',
      status: 'completed',
      started_at: '2024-01-10T09:00:00Z',
      completed_at: '2024-01-10T10:00:00Z',
      performed_by: null,
      performed_by_name: null,
      notes: null,
      photos: [],
      total_cost: 0,
      downtime_minutes: 60,
      created_at: '2024-01-10T09:00:00Z',
    },
    {
      id: 'r3',
      schedule_id: '3',
      machine_id: 'm3',
      maintenance_type_id: 'mt2',
      status: 'in_progress',
      started_at: '2024-01-15T08:00:00Z',
      completed_at: null,
      performed_by: null,
      performed_by_name: null,
      notes: null,
      photos: [],
      total_cost: 0,
      downtime_minutes: 0,
      created_at: '2024-01-15T08:00:00Z',
    },
  ];

  const mockAlerts: MaintenanceAlert[] = [
    {
      id: 'a1',
      schedule_id: '2',
      machine_id: 'm2',
      alert_type: 'critical',
      message: 'Maintenance overdue',
      is_read: false,
      is_resolved: false,
      resolved_by: null,
      resolved_at: null,
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'a2',
      schedule_id: '1',
      machine_id: 'm1',
      alert_type: 'due',
      message: 'Maintenance due today',
      is_read: true,
      is_resolved: false,
      resolved_by: null,
      resolved_at: null,
      created_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 'a3',
      schedule_id: '3',
      machine_id: 'm3',
      alert_type: 'upcoming',
      message: 'Maintenance completed',
      is_read: true,
      is_resolved: true,
      resolved_by: 'user1',
      resolved_at: '2024-01-14T12:00:00Z',
      created_at: '2024-01-14T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('stats calculation', () => {
    it('should calculate totalScheduled correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      expect(result.current.stats.totalScheduled).toBe(4);
    });

    it('should calculate dueToday correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      expect(result.current.stats.dueToday).toBe(1);
    });

    it('should calculate overdue correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      expect(result.current.stats.overdue).toBe(1);
    });

    it('should calculate activeAlerts correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      expect(result.current.stats.activeAlerts).toBe(2);
    });

    it('should calculate criticalAlerts correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      expect(result.current.stats.criticalAlerts).toBe(1);
    });

    it('should return zero stats for empty data', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: [], records: [], alerts: [] })
      );

      expect(result.current.stats).toEqual({
        totalScheduled: 0,
        dueToday: 0,
        overdue: 0,
        upcoming7Days: 0,
        completedThisMonth: 0,
        activeAlerts: 0,
        criticalAlerts: 0,
      });
    });
  });

  describe('getSchedulesByStatus', () => {
    it('should categorize schedules by status correctly', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      const categorized = result.current.getSchedulesByStatus();

      expect(categorized.dueToday).toHaveLength(1);
      expect(categorized.dueToday[0].id).toBe('1');

      expect(categorized.overdue).toHaveLength(1);
      expect(categorized.overdue[0].id).toBe('2');

      expect(categorized.upcoming.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty arrays for empty schedules', () => {
      const { result } = renderHook(() =>
        useTPMStats({ schedules: [], records: [], alerts: [] })
      );

      const categorized = result.current.getSchedulesByStatus();

      expect(categorized.dueToday).toHaveLength(0);
      expect(categorized.overdue).toHaveLength(0);
      expect(categorized.upcoming).toHaveLength(0);
    });
  });

  describe('memoization', () => {
    it('should return same stats reference when inputs do not change', () => {
      const { result, rerender } = renderHook(() =>
        useTPMStats({ schedules: mockSchedules, records: mockRecords, alerts: mockAlerts })
      );

      const firstStats = result.current.stats;
      rerender();
      const secondStats = result.current.stats;

      expect(firstStats).toBe(secondStats);
    });
  });
});
