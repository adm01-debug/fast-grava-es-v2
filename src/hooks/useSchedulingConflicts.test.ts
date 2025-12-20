import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSchedulingConflicts } from './useSchedulingConflicts';

// Mock jobs and machines
const mockJobs = vi.fn();
const mockMachines = vi.fn();

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs() }),
  useMachines: () => ({ data: mockMachines() }),
}));

// Factory functions
const createMockMachine = (id: string, name: string, code: string) => ({
  id,
  name,
  code,
  technique_id: 'tech-1',
  is_active: true,
});

const createMockJob = (overrides: any = {}) => ({
  id: overrides.id || 'job-1',
  order_number: overrides.order_number || 'ORD-001',
  client: overrides.client || 'Cliente Teste',
  product: overrides.product || 'Produto Teste',
  quantity: 100,
  status: overrides.status || 'scheduled',
  technique_id: 'tech-1',
  machine_id: overrides.machine_id || 'machine-1',
  scheduled_date: overrides.scheduled_date || '2024-12-20',
  start_time: overrides.start_time || '08:00',
  end_time: overrides.end_time || '10:00',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('useSchedulingConflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobs.mockReturnValue([]);
    mockMachines.mockReturnValue([]);
  });

  describe('No Data', () => {
    it('should return empty conflicts when no jobs', () => {
      mockJobs.mockReturnValue([]);
      mockMachines.mockReturnValue([createMockMachine('m1', 'Machine 1', 'M1')]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
      expect(result.current.hasConflicts).toBe(false);
      expect(result.current.errorCount).toBe(0);
      expect(result.current.warningCount).toBe(0);
    });

    it('should return empty conflicts when no machines', () => {
      mockJobs.mockReturnValue([createMockJob()]);
      mockMachines.mockReturnValue([]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
    });

    it('should return empty when jobs and machines are null', () => {
      mockJobs.mockReturnValue(null);
      mockMachines.mockReturnValue(null);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
    });
  });

  describe('No Conflicts', () => {
    it('should not detect conflicts for non-overlapping jobs', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '10:00',
          end_time: '12:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
      expect(result.current.hasConflicts).toBe(false);
    });

    it('should not detect conflicts for jobs on different machines', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
        createMockMachine('machine-2', 'Laser 02', 'LSR-02'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-2',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
    });

    it('should not detect conflicts for jobs on different dates', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-21',
          start_time: '08:00',
          end_time: '10:00',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
    });

    it('should ignore finished jobs', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'finished',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(false);
    });

    it('should ignore cancelled jobs', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'cancelled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(false);
    });

    it('should ignore jobs without machine assignment', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: null,
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(false);
    });
  });

  describe('Detecting Conflicts', () => {
    it('should detect overlapping jobs on same machine and date', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-001',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          order_number: 'ORD-002',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(true);
      expect(result.current.conflicts.length).toBe(1);
      expect(result.current.conflicts[0].jobs.length).toBe(2);
      expect(result.current.conflicts[0].machineId).toBe('machine-1');
      expect(result.current.conflicts[0].machineName).toBe('Laser 01');
    });

    it('should detect job completely inside another', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '12:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(true);
      expect(result.current.conflicts[0].jobs.length).toBe(2);
    });

    it('should detect multiple conflicts on different machines', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
        createMockMachine('machine-2', 'Laser 02', 'LSR-02'),
      ]);

      mockJobs.mockReturnValue([
        // Conflict on machine 1
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
        // Conflict on machine 2
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-2',
          scheduled_date: '2024-12-20',
          start_time: '14:00',
          end_time: '16:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-4',
          machine_id: 'machine-2',
          scheduled_date: '2024-12-20',
          start_time: '15:00',
          end_time: '17:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts.length).toBe(2);
    });

    it('should include 3+ jobs in conflict when all overlap', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '12:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '10:00',
          end_time: '13:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts[0].jobs.length).toBe(3);
    });
  });

  describe('Conflict Severity', () => {
    it('should mark as warning when no production jobs involved', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'ready',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts[0].severity).toBe('warning');
      expect(result.current.warningCount).toBe(1);
      expect(result.current.errorCount).toBe(0);
    });

    it('should mark as error when production job involved', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'production',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts[0].severity).toBe('error');
      expect(result.current.errorCount).toBe(1);
      expect(result.current.warningCount).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('should sort errors before warnings', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
        createMockMachine('machine-2', 'Laser 02', 'LSR-02'),
      ]);

      mockJobs.mockReturnValue([
        // Warning conflict
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
        // Error conflict
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-2',
          scheduled_date: '2024-12-21',
          start_time: '08:00',
          end_time: '10:00',
          status: 'production',
        }),
        createMockJob({
          id: 'job-4',
          machine_id: 'machine-2',
          scheduled_date: '2024-12-21',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts[0].severity).toBe('error');
      expect(result.current.conflicts[1].severity).toBe('warning');
    });

    it('should sort jobs within conflict by start time', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '10:00',
          end_time: '12:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts[0].jobs[0].startTime).toBe('08:00');
      expect(result.current.conflicts[0].jobs[1].startTime).toBe('10:00');
    });
  });

  describe('Edge Cases', () => {
    it('should handle jobs with missing time fields', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: null,
          end_time: '10:00',
          status: 'scheduled',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '09:00',
          end_time: '11:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(false);
    });

    it('should handle invalid date strings gracefully', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: 'invalid-date',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.conflicts).toEqual([]);
    });

    it('should handle single job (no possible conflict)', () => {
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
      ]);

      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: '2024-12-20',
          start_time: '08:00',
          end_time: '10:00',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useSchedulingConflicts());

      expect(result.current.hasConflicts).toBe(false);
    });
  });
});
