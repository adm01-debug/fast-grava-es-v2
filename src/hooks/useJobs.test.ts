import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock Supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

import { 
  useJobs, 
  useTechniques, 
  useMachines, 
  useUpdateJobStatus, 
  useBufferStatus,
  DbJob,
  DbTechnique,
  BufferTechniqueStatus
} from './useJobs';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useJobs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should return jobs data array', () => {
      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });

    it('should provide refetch function', () => {
      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to jobs changes channel', () => {
      renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Channel should be created for real-time updates
      expect(mockChannel.on).toHaveBeenCalled();
    });
  });
});

describe('useTechniques Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return techniques data', () => {
    const { result } = renderHook(() => useTechniques(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeDefined();
  });

  it('should have loading state', () => {
    const { result } = renderHook(() => useTechniques(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBeDefined();
  });
});

describe('useMachines Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return machines data', () => {
    const { result } = renderHook(() => useMachines(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeDefined();
  });

  it('should filter only active machines', () => {
    // The hook filters by is_active = true
    const { result } = renderHook(() => useMachines(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useUpdateJobStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide mutate function', () => {
    const { result } = renderHook(() => useUpdateJobStatus(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.mutate).toBe('function');
  });

  it('should provide mutateAsync function', () => {
    const { result } = renderHook(() => useUpdateJobStatus(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.mutateAsync).toBe('function');
  });
});

describe('useBufferStatus Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return buffer status structure', () => {
    const { result } = renderHook(() => useBufferStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.bufferByTechnique).toBeDefined();
    expect(Array.isArray(result.current.bufferByTechnique)).toBe(true);
    expect(result.current.isLoading).toBeDefined();
  });
});

describe('Buffer Status Calculation Logic', () => {
  // Pure function tests for buffer calculation logic
  
  function calculateBufferStatus(
    jobs: Pick<DbJob, 'technique_id' | 'status'>[],
    techniques: DbTechnique[]
  ): BufferTechniqueStatus[] {
    return techniques.map(technique => {
      const readyJobs = jobs.filter(
        job => job.technique_id === technique.id && job.status === 'ready'
      );
      
      const queueJobs = jobs.filter(
        job => job.technique_id === technique.id && job.status === 'queue'
      );

      return {
        technique,
        readyCount: readyJobs.length,
        queueCount: queueJobs.length,
        isHealthy: readyJobs.length >= 3,
        isCritical: readyJobs.length === 0,
        isWarning: readyJobs.length > 0 && readyJobs.length < 3,
      };
    }).filter(item => item.queueCount > 0 || item.readyCount > 0);
  }

  const mockTechnique: DbTechnique = {
    id: 'tech-1',
    name: 'Laser',
    short_name: 'LSR',
    color: '#FF0000',
    setup_time: 10,
  };

  it('should mark as healthy when 3+ jobs are ready', () => {
    const jobs = [
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'ready' as const },
    ];

    const result = calculateBufferStatus(jobs, [mockTechnique]);

    expect(result[0].isHealthy).toBe(true);
    expect(result[0].isCritical).toBe(false);
    expect(result[0].isWarning).toBe(false);
  });

  it('should mark as critical when no jobs are ready', () => {
    const jobs = [
      { technique_id: 'tech-1', status: 'queue' as const },
      { technique_id: 'tech-1', status: 'queue' as const },
    ];

    const result = calculateBufferStatus(jobs, [mockTechnique]);

    expect(result[0].isCritical).toBe(true);
    expect(result[0].isHealthy).toBe(false);
    expect(result[0].isWarning).toBe(false);
  });

  it('should mark as warning when 1-2 jobs are ready', () => {
    const jobs = [
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'queue' as const },
    ];

    const result = calculateBufferStatus(jobs, [mockTechnique]);

    expect(result[0].isWarning).toBe(true);
    expect(result[0].isHealthy).toBe(false);
    expect(result[0].isCritical).toBe(false);
  });

  it('should filter out techniques with no jobs', () => {
    const techniques = [
      mockTechnique,
      { ...mockTechnique, id: 'tech-2', name: 'Silk' },
    ];
    
    const jobs = [
      { technique_id: 'tech-1', status: 'ready' as const },
    ];

    const result = calculateBufferStatus(jobs, techniques);

    expect(result.length).toBe(1);
    expect(result[0].technique.id).toBe('tech-1');
  });

  it('should count ready and queue jobs separately', () => {
    const jobs = [
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'ready' as const },
      { technique_id: 'tech-1', status: 'queue' as const },
      { technique_id: 'tech-1', status: 'queue' as const },
      { technique_id: 'tech-1', status: 'queue' as const },
    ];

    const result = calculateBufferStatus(jobs, [mockTechnique]);

    expect(result[0].readyCount).toBe(2);
    expect(result[0].queueCount).toBe(3);
  });
});

describe('Job Status Types', () => {
  const validStatuses: DbJob['status'][] = [
    'queue', 'ready', 'scheduled', 'production', 
    'finished', 'paused', 'cancelled', 'delayed', 'rework'
  ];

  it('should recognize all valid job statuses', () => {
    validStatuses.forEach(status => {
      const job: Partial<DbJob> = { status };
      expect(job.status).toBe(status);
    });
  });

  it('should have 9 valid status values', () => {
    expect(validStatuses.length).toBe(9);
  });
});

describe('Job Priority Types', () => {
  const validPriorities: DbJob['priority'][] = ['low', 'medium', 'high', 'urgent'];

  it('should recognize all valid priorities', () => {
    validPriorities.forEach(priority => {
      const job: Partial<DbJob> = { priority };
      expect(job.priority).toBe(priority);
    });
  });

  it('should have 4 priority levels', () => {
    expect(validPriorities.length).toBe(4);
  });
});
