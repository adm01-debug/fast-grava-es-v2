import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { format, addDays } from 'date-fns';

// Mock useJobs hooks
vi.mock('./useJobs', () => ({
  useJobs: vi.fn(),
  useMachines: vi.fn(),
  useTechniques: vi.fn(),
}));

import { useBottleneckPrediction } from './useBottleneckPrediction';
import { useJobs, useMachines, useTechniques } from './useJobs';

const mockUseJobs = useJobs as ReturnType<typeof vi.fn>;
const mockUseMachines = useMachines as ReturnType<typeof vi.fn>;
const mockUseTechniques = useTechniques as ReturnType<typeof vi.fn>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useBottleneckPrediction', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, 'yyyy-MM-dd');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug Fix #9: Exclude paused jobs from capacity calculations', () => {
    it('should NOT include paused jobs in pending job calculations', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'queue',
            scheduled_date: null,
            estimated_duration: 120,
          },
          {
            id: 'job-2',
            technique_id: 'tech-1',
            status: 'paused', // This should be EXCLUDED
            scheduled_date: null,
            estimated_duration: 180,
          },
          {
            id: 'job-3',
            technique_id: 'tech-1',
            status: 'ready',
            scheduled_date: null,
            estimated_duration: 60,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [
          { id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' },
        ],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      // Find capacity data for today
      const todayCapacity = result.current.capacityByDate.find(
        c => c.technique.id === 'tech-1' && format(c.date, 'yyyy-MM-dd') === todayStr
      );

      // Pending minutes should only include job-1 (120) and job-3 (60) = 180
      // NOT job-2 (180) because it's paused
      expect(todayCapacity?.pendingMinutes).toBe(180);
      expect(todayCapacity?.pendingJobs).toBe(2); // Only 2 pending jobs, not 3
    });

    it('should exclude finished jobs from capacity', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'finished',
            scheduled_date: todayStr,
            estimated_duration: 120,
          },
          {
            id: 'job-2',
            technique_id: 'tech-1',
            status: 'scheduled',
            scheduled_date: todayStr,
            estimated_duration: 60,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      const todayCapacity = result.current.capacityByDate.find(
        c => c.technique.id === 'tech-1' && format(c.date, 'yyyy-MM-dd') === todayStr
      );

      // Only scheduled job should be counted (60 min), not finished (120 min)
      expect(todayCapacity?.usedMinutes).toBe(60);
    });

    it('should exclude cancelled jobs from capacity', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'cancelled',
            scheduled_date: todayStr,
            estimated_duration: 120,
          },
          {
            id: 'job-2',
            technique_id: 'tech-1',
            status: 'ready',
            scheduled_date: todayStr,
            estimated_duration: 60,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      const todayCapacity = result.current.capacityByDate.find(
        c => c.technique.id === 'tech-1' && format(c.date, 'yyyy-MM-dd') === todayStr
      );

      expect(todayCapacity?.usedMinutes).toBe(60);
    });
  });

  describe('Alert generation', () => {
    it('should generate critical alert when occupancy >= 90%', () => {
      // 11 hours = 660 minutes per machine
      // To reach 90%, we need 594 minutes scheduled
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'scheduled',
            scheduled_date: todayStr,
            estimated_duration: 600, // 600 min > 90% of 660
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      const criticalAlerts = result.current.alerts.filter(a => a.severity === 'critical');
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
      expect(result.current.criticalCount).toBeGreaterThanOrEqual(1);
    });

    it('should generate warning alert when occupancy >= 75% and < 90%', () => {
      // 75% of 660 = 495 min
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'scheduled',
            scheduled_date: todayStr,
            estimated_duration: 520, // ~79% occupancy
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      const warningAlerts = result.current.alerts.filter(a => a.severity === 'warning');
      expect(warningAlerts.length).toBeGreaterThanOrEqual(1);
      expect(result.current.warningCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Multiple machines capacity', () => {
    it('should calculate total capacity across multiple machines', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            status: 'scheduled',
            scheduled_date: todayStr,
            estimated_duration: 300,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      const todayCapacity = result.current.capacityByDate.find(
        c => c.technique.id === 'tech-1' && format(c.date, 'yyyy-MM-dd') === todayStr
      );

      // 2 machines * 660 min = 1320 min total capacity
      expect(todayCapacity?.totalCapacityMinutes).toBe(1320);
      expect(todayCapacity?.machineCount).toBe(2);
    });
  });
});
