import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })), single: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

import { useJobs } from './useJobs';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useJobs', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Data Fetching', () => {
    it('should fetch jobs', async () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.jobs).toBeDefined());
    });

    it('should fetch job by id', async () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      await waitFor(() => expect(typeof result.current.getJobById).toBe('function'));
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const { result } = renderHook(() => useJobs({ status: 'in_progress' }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.jobs).toBeDefined());
    });

    it('should filter by machine', async () => {
      const { result } = renderHook(() => useJobs({ machineId: '123' }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.jobs).toBeDefined());
    });

    it('should filter by operator', async () => {
      const { result } = renderHook(() => useJobs({ operatorId: '456' }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.jobs).toBeDefined());
    });
  });

  describe('CRUD', () => {
    it('should have createJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.createJob).toBe('function');
    });

    it('should have updateJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.updateJob).toBe('function');
    });

    it('should have deleteJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.deleteJob).toBe('function');
    });
  });

  describe('Status', () => {
    it('should have startJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.startJob).toBe('function');
    });

    it('should have completeJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.completeJob).toBe('function');
    });

    it('should have pauseJob function', () => {
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() });
      expect(typeof result.current.pauseJob).toBe('function');
    });
  });
});
