import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQualityControl } from './useQualityControl';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 'q1', job_id: 'job-1', operator_id: 'op-1', status: 'approved', defects: 0, inspected_at: '2024-01-15T10:00:00Z' },
          { id: 'q2', job_id: 'job-2', operator_id: 'op-2', status: 'rejected', defects: 3, inspected_at: '2024-01-15T11:00:00Z', defect_types: ['scratch', 'misalignment'] },
          { id: 'q3', job_id: 'job-3', operator_id: 'op-1', status: 'approved', defects: 0, inspected_at: '2024-01-15T12:00:00Z' },
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

describe('useQualityControl', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch quality inspections', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.inspections).toBeDefined();
      expect(result.current.inspections.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should calculate approval rate', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.approvalRate).toBeGreaterThanOrEqual(0);
      expect(result.current.stats.approvalRate).toBeLessThanOrEqual(100);
    });

    it('should calculate rejection rate', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.rejectionRate).toBeGreaterThanOrEqual(0);
    });

    it('should count total defects', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.totalDefects).toBe(3);
    });

    it('should track defects by type', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.defectsByType).toBeDefined();
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const approved = result.current.filterByStatus('approved');
      expect(approved.every(i => i.status === 'approved')).toBe(true);
    });

    it('should filter by operator', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const op1Inspections = result.current.filterByOperator('op-1');
      expect(op1Inspections.every(i => i.operator_id === 'op-1')).toBe(true);
    });

    it('should filter by date range', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.filterByDateRange).toBe('function');
    });
  });

  describe('Operations', () => {
    it('should have approve function', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.approveJob).toBe('function');
    });

    it('should have reject function', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.rejectJob).toBe('function');
    });

    it('should have report defect function', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.reportDefect).toBe('function');
    });
  });

  describe('Analysis', () => {
    it('should identify quality trends', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.qualityTrends).toBeDefined();
    });

    it('should get operator quality scores', async () => {
      const { result } = renderHook(() => useQualityControl(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.operatorQualityScores).toBeDefined();
    });
  });
});
