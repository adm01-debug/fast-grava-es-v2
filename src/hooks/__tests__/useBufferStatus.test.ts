import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBufferStatus } from '../useJobs';
import * as useJobsModule from '../useJobs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({})),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  createAppError: vi.fn(),
  createMutationErrorHandler: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBufferStatus', () => {
  const mockTechniques = [
    { id: 'tech1', name: 'Laser', short_name: 'L', color: '#000', setup_time: 10 },
  ];

  it('returns loading state when data is missing', () => {
    // Spy on the hooks used inside useBufferStatus
    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: undefined } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: undefined } as any);

    const { result } = renderHook(() => useBufferStatus(), { wrapper: createWrapper() });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.bufferByTechnique).toEqual([]);
  });

  it('identifies critical buffer status when no ready jobs exist but queue has items', () => {
    const mockJobs = [
      { id: 'job1', technique_id: 'tech1', status: 'queue' },
    ];

    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: mockJobs } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: mockTechniques } as any);

    const { result } = renderHook(() => useBufferStatus(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.bufferByTechnique[0].isCritical).toBe(true);
    expect(result.current.bufferByTechnique[0].isHealthy).toBe(false);
    expect(result.current.bufferByTechnique[0].readyCount).toBe(0);
    expect(result.current.bufferByTechnique[0].queueCount).toBe(1);
  });

  it('identifies healthy buffer status when 3 or more ready jobs exist', () => {
    const mockJobs = [
      { id: 'job1', technique_id: 'tech1', status: 'ready' },
      { id: 'job2', technique_id: 'tech1', status: 'ready' },
      { id: 'job3', technique_id: 'tech1', status: 'ready' },
    ];

    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: mockJobs } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: mockTechniques } as any);

    const { result } = renderHook(() => useBufferStatus(), { wrapper: createWrapper() });

    expect(result.current.bufferByTechnique[0].isHealthy).toBe(true);
    expect(result.current.bufferByTechnique[0].isCritical).toBe(false);
  });

  it('identifies warning status when ready jobs are between 1 and 2', () => {
    const mockJobs = [
      { id: 'job1', technique_id: 'tech1', status: 'ready' },
      { id: 'job2', technique_id: 'tech1', status: 'queue' },
    ];

    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: mockJobs } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: mockTechniques } as any);

    const { result } = renderHook(() => useBufferStatus(), { wrapper: createWrapper() });

    expect(result.current.bufferByTechnique[0].isWarning).toBe(true);
    expect(result.current.bufferByTechnique[0].isHealthy).toBe(false);
  });
});
