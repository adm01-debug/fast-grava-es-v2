import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStuckJobsDetection } from './useStuckJobsDetection';

// Mock useJobs
const mockJobs = vi.fn();

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs() }),
}));

// Factory function
const createMockJob = (overrides: any = {}) => ({
  id: overrides.id || 'job-1',
  order_number: overrides.order_number || 'ORD-001',
  client: 'Cliente Teste',
  product: 'Produto Teste',
  quantity: 100,
  status: overrides.status || 'scheduled',
  priority: 'medium',
  technique_id: 'tech-1',
  machine_id: 'machine-1',
  scheduled_date: new Date().toISOString().split('T')[0],
  start_time: '08:00',
  end_time: '10:00',
  estimated_duration: 60,
  actual_start_time: overrides.actual_start_time || null,
  actual_end_time: null,
  gravure_color: 'Preto',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe('useStuckJobsDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-20T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('No Data', () => {
    it('should return empty when no jobs', () => {
      mockJobs.mockReturnValue([]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs).toEqual([]);
      expect(result.current.hasStuckJobs).toBe(false);
      expect(result.current.criticalCount).toBe(0);
      expect(result.current.warningCount).toBe(0);
    });

    it('should return empty when jobs is null', () => {
      mockJobs.mockReturnValue(null);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs).toEqual([]);
    });
  });

  describe('No Stuck Jobs', () => {
    it('should not detect non-production jobs', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'scheduled',
          actual_start_time: new Date('2024-12-19T12:00:00Z').toISOString(), // 24 hours ago
        }),
        createMockJob({
          id: 'job-2',
          status: 'finished',
          actual_start_time: new Date('2024-12-18T12:00:00Z').toISOString(), // 48 hours ago
        }),
        createMockJob({
          id: 'job-3',
          status: 'queue',
          actual_start_time: null,
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(false);
    });

    it('should not detect production jobs without start time', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: null,
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(false);
    });

    it('should not detect recently started production jobs', () => {
      // Job started 2 hours ago (less than 8 hour threshold)
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: new Date('2024-12-20T10:00:00Z').toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(false);
    });

    it('should not detect jobs at exactly 8 hours (boundary)', () => {
      // Job started exactly 7.9 hours ago
      const startTime = new Date('2024-12-20T04:06:00Z'); // 7.9 hours before 12:00
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(false);
    });
  });

  describe('Warning Detection (8-24 hours)', () => {
    it('should detect warning for job in production 8+ hours', () => {
      // Job started 10 hours ago
      const startTime = new Date('2024-12-20T02:00:00Z');
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-001',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(true);
      expect(result.current.warningCount).toBe(1);
      expect(result.current.criticalCount).toBe(0);
      expect(result.current.stuckJobs[0].severity).toBe('warning');
      expect(result.current.stuckJobs[0].hoursInProduction).toBe(10);
    });

    it('should include order number in warning message', () => {
      const startTime = new Date('2024-12-20T02:00:00Z');
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'PED-2024-999',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs[0].message).toContain('PED-2024-999');
      expect(result.current.stuckJobs[0].message).toContain('10 horas');
    });
  });

  describe('Critical Detection (24+ hours)', () => {
    it('should detect critical for job in production 24+ hours', () => {
      // Job started 30 hours ago
      const startTime = new Date('2024-12-19T06:00:00Z');
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-001',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(true);
      expect(result.current.criticalCount).toBe(1);
      expect(result.current.warningCount).toBe(0);
      expect(result.current.stuckJobs[0].severity).toBe('critical');
      expect(result.current.stuckJobs[0].hoursInProduction).toBe(30);
    });

    it('should include verification message for critical', () => {
      const startTime = new Date('2024-12-19T06:00:00Z');
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-CRITICAL',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs[0].message).toContain('Verificar se não está travado');
    });
  });

  describe('Multiple Stuck Jobs', () => {
    it('should detect multiple stuck jobs with different severities', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-WARNING',
          status: 'production',
          actual_start_time: new Date('2024-12-20T02:00:00Z').toISOString(), // 10 hours
        }),
        createMockJob({
          id: 'job-2',
          order_number: 'ORD-CRITICAL',
          status: 'production',
          actual_start_time: new Date('2024-12-19T06:00:00Z').toISOString(), // 30 hours
        }),
        createMockJob({
          id: 'job-3',
          order_number: 'ORD-OK',
          status: 'production',
          actual_start_time: new Date('2024-12-20T10:00:00Z').toISOString(), // 2 hours (OK)
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs.length).toBe(2);
      expect(result.current.warningCount).toBe(1);
      expect(result.current.criticalCount).toBe(1);
    });

    it('should sort by hours in production (longest first)', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          order_number: 'ORD-10H',
          status: 'production',
          actual_start_time: new Date('2024-12-20T02:00:00Z').toISOString(), // 10 hours
        }),
        createMockJob({
          id: 'job-2',
          order_number: 'ORD-30H',
          status: 'production',
          actual_start_time: new Date('2024-12-19T06:00:00Z').toISOString(), // 30 hours
        }),
        createMockJob({
          id: 'job-3',
          order_number: 'ORD-15H',
          status: 'production',
          actual_start_time: new Date('2024-12-19T21:00:00Z').toISOString(), // 15 hours
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs[0].hoursInProduction).toBe(30);
      expect(result.current.stuckJobs[1].hoursInProduction).toBe(15);
      expect(result.current.stuckJobs[2].hoursInProduction).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date strings', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: 'invalid-date',
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs).toEqual([]);
    });

    it('should ignore future start times', () => {
      // Job with future start time (shouldn't happen but handle it)
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: new Date('2024-12-21T12:00:00Z').toISOString(), // Tomorrow
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs).toEqual([]);
    });

    it('should handle exactly 24 hours (critical threshold)', () => {
      // Job started exactly 24 hours ago
      const startTime = new Date('2024-12-19T12:00:00Z');
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: startTime.toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs[0].severity).toBe('critical');
    });

    it('should include original job object in result', () => {
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-special',
          order_number: 'SPECIAL-001',
          client: 'Cliente Especial',
          status: 'production',
          actual_start_time: new Date('2024-12-20T02:00:00Z').toISOString(),
        }),
      ]);

      const { result } = renderHook(() => useStuckJobsDetection());

      expect(result.current.stuckJobs[0].job.id).toBe('job-special');
      expect(result.current.stuckJobs[0].job.client).toBe('Cliente Especial');
    });
  });

  describe('Reactivity', () => {
    it('should update when jobs change', () => {
      // Initially no stuck jobs
      mockJobs.mockReturnValue([]);

      const { result, rerender } = renderHook(() => useStuckJobsDetection());

      expect(result.current.hasStuckJobs).toBe(false);

      // Add stuck job
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          status: 'production',
          actual_start_time: new Date('2024-12-20T02:00:00Z').toISOString(),
        }),
      ]);

      rerender();

      expect(result.current.hasStuckJobs).toBe(true);
    });
  });
});
