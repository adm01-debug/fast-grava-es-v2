import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMaintenanceSchedule } from './useMaintenanceSchedule';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 'm1', machine_id: 'machine-1', type: 'preventive', scheduled_date: '2024-02-15', status: 'pending', priority: 'high' },
          { id: 'm2', machine_id: 'machine-2', type: 'corrective', scheduled_date: '2024-02-10', status: 'completed', priority: 'critical' },
          { id: 'm3', machine_id: 'machine-1', type: 'preventive', scheduled_date: '2024-03-15', status: 'pending', priority: 'medium' },
        ],
        error: null,
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new' }, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: {}, error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMaintenanceSchedule', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch maintenance schedules', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.schedules).toBeDefined();
      expect(result.current.schedules.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Filtering', () => {
    it('should filter by machine', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const machine1Schedules = result.current.filterByMachine('machine-1');
      expect(machine1Schedules.every(s => s.machine_id === 'machine-1')).toBe(true);
    });

    it('should filter by status', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const pendingSchedules = result.current.filterByStatus('pending');
      expect(pendingSchedules.every(s => s.status === 'pending')).toBe(true);
    });

    it('should filter by type', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const preventive = result.current.filterByType('preventive');
      expect(preventive.every(s => s.type === 'preventive')).toBe(true);
    });

    it('should filter by priority', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const critical = result.current.filterByPriority('critical');
      expect(critical.every(s => s.priority === 'critical')).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should count pending maintenance', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.pendingCount).toBe(2);
    });

    it('should count completed maintenance', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.completedCount).toBe(1);
    });

    it('should identify overdue maintenance', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.overdueMaintenances).toBeDefined();
    });

    it('should get upcoming maintenance', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.upcomingMaintenances).toBeDefined();
    });
  });

  describe('Operations', () => {
    it('should have schedule function', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.scheduleMaintenance).toBe('function');
    });

    it('should have complete function', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.completeMaintenance).toBe('function');
    });

    it('should have reschedule function', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.rescheduleMaintenance).toBe('function');
    });
  });

  describe('Calendar Integration', () => {
    it('should get events for calendar', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.calendarEvents).toBeDefined();
      expect(Array.isArray(result.current.calendarEvents)).toBe(true);
    });

    it('should get maintenance for date range', async () => {
      const { result } = renderHook(() => useMaintenanceSchedule(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const range = result.current.getMaintenanceInRange(new Date('2024-02-01'), new Date('2024-02-28'));
      expect(Array.isArray(range)).toBe(true);
    });
  });
});
