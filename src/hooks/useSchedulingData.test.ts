import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

const mockJobs = [
  {
    id: 'job-1',
    order_number: 'ORD-001',
    client: 'Client A',
    product: 'Product A',
    quantity: 100,
    technique_id: 'tech-1',
    machine_id: 'machine-1',
    scheduled_date: new Date().toISOString().split('T')[0],
    status: 'finished',
    priority: 'high',
    estimated_duration: 60,
    lost_pieces: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'job-2',
    order_number: 'ORD-002',
    client: 'Client B',
    product: 'Product B',
    quantity: 200,
    technique_id: 'tech-1',
    machine_id: 'machine-1',
    scheduled_date: new Date().toISOString().split('T')[0],
    status: 'production',
    priority: 'medium',
    estimated_duration: 90,
    lost_pieces: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'job-3',
    order_number: 'ORD-003',
    client: 'Client C',
    product: 'Product C',
    quantity: 150,
    technique_id: 'tech-2',
    machine_id: 'machine-2',
    scheduled_date: '2024-01-15',
    status: 'queue',
    priority: 'low',
    estimated_duration: 45,
    lost_pieces: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'job-4',
    order_number: 'ORD-004',
    client: 'Client D',
    product: 'Product D',
    quantity: 50,
    technique_id: 'tech-1',
    machine_id: null,
    scheduled_date: null,
    status: 'ready',
    priority: 'urgent',
    estimated_duration: 30,
    lost_pieces: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTechniques = [
  { id: 'tech-1', name: 'Fiber Laser', short_name: 'FL', color: '#FF5733', setup_time: 10 },
  { id: 'tech-2', name: 'Silk Screen', short_name: 'SK', color: '#33FF57', setup_time: 20 },
];

const mockMachines = [
  { id: 'machine-1', code: 'FL-01', name: 'Fiber Laser 1', technique_id: 'tech-1', is_active: true },
  { id: 'machine-2', code: 'SK-01', name: 'Silk Screen 1', technique_id: 'tech-2', is_active: true },
  { id: 'machine-3', code: 'FL-02', name: 'Fiber Laser 2', technique_id: 'tech-1', is_active: true },
];

// Mock channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const baseQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn(() => {
          if (table === 'jobs') return Promise.resolve({ data: mockJobs, error: null });
          if (table === 'techniques') return Promise.resolve({ data: mockTechniques, error: null });
          return Promise.resolve({ data: [], error: null });
        }),
        eq: vi.fn(() => ({
          order: vi.fn(() => {
            if (table === 'machines') return Promise.resolve({ data: mockMachines, error: null });
            return Promise.resolve({ data: [], error: null });
          }),
        })),
      };
      return baseQuery;
    }),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
  },
}));

import { 
  useSchedulingData, 
  useJobsData, 
  useTechniquesData, 
  useMachinesData 
} from './useSchedulingData';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useSchedulingData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should return jobs, techniques, and machines', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.jobs).toBeDefined();
      expect(result.current.techniques).toBeDefined();
      expect(result.current.machines).toBeDefined();
    });

    it('should provide loading states', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isLoadingJobs).toBeDefined();
      expect(result.current.isLoadingTechniques).toBeDefined();
      expect(result.current.isLoadingMachines).toBeDefined();
    });

    it('should provide error state', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Helper Functions', () => {
    it('should provide getTechniqueById function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getTechniqueById).toBe('function');
    });

    it('should provide getMachineById function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getMachineById).toBe('function');
    });

    it('should provide getMachinesByTechnique function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getMachinesByTechnique).toBe('function');
    });

    it('should provide getJobsByStatus function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getJobsByStatus).toBe('function');
    });

    it('should provide getJobsByMachine function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getJobsByMachine).toBe('function');
    });

    it('should provide getJobsByTechnique function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getJobsByTechnique).toBe('function');
    });
  });

  describe('Derived Stats', () => {
    it('should calculate stats object', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.stats).toBeDefined();

      const stats = result.current.stats;
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('inProgress');
      expect(stats).toHaveProperty('delayed');
      expect(stats).toHaveProperty('queue');
      expect(stats).toHaveProperty('ready');
      expect(stats).toHaveProperty('scheduled');
      expect(stats).toHaveProperty('paused');
      expect(stats).toHaveProperty('rework');
    });

    it('should include today stats', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.stats.todayScheduled).toBeDefined();
      expect(result.current.stats.todayCompleted).toBeDefined();
      expect(result.current.stats.todayInProgress).toBeDefined();
      expect(result.current.stats.todayDelayed).toBeDefined();
    });

    it('should include piece counts', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.stats.totalPieces).toBeDefined();
      expect(result.current.stats.completedPieces).toBeDefined();
      expect(result.current.stats.lostPieces).toBeDefined();
    });
  });

  describe('Refetch Functions', () => {
    it('should provide refetchJobs function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetchJobs).toBe('function');
    });

    it('should provide refetchAll function', () => {
      const { result } = renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refetchAll).toBe('function');
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should subscribe to scheduling data changes', () => {
      renderHook(() => useSchedulingData(), {
        wrapper: createWrapper(),
      });

      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });
});

describe('Backward Compatibility Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useJobsData', () => {
    it('should return jobs data', () => {
      const { result } = renderHook(() => useJobsData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('useTechniquesData', () => {
    it('should return techniques data', () => {
      const { result } = renderHook(() => useTechniquesData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('useMachinesData', () => {
    it('should return machines data', () => {
      const { result } = renderHook(() => useMachinesData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });
  });
});

describe('Stats Calculation Logic', () => {
  interface Job {
    id: string;
    status: string;
    quantity: number;
    lost_pieces: number | null;
    scheduled_date: string | null;
  }

  function calculateStats(jobs: Job[], today: string) {
    const todayJobs = jobs.filter(j => j.scheduled_date === today);

    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'finished').length,
      inProgress: jobs.filter(j => j.status === 'production').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      queue: jobs.filter(j => j.status === 'queue').length,
      ready: jobs.filter(j => j.status === 'ready').length,
      scheduled: jobs.filter(j => j.status === 'scheduled').length,
      paused: jobs.filter(j => j.status === 'paused').length,
      rework: jobs.filter(j => j.status === 'rework').length,
      todayScheduled: todayJobs.length,
      todayCompleted: todayJobs.filter(j => j.status === 'finished').length,
      todayInProgress: todayJobs.filter(j => j.status === 'production').length,
      todayDelayed: todayJobs.filter(j => j.status === 'delayed').length,
      totalPieces: jobs.reduce((sum, j) => sum + j.quantity, 0),
      completedPieces: jobs.filter(j => j.status === 'finished').reduce((sum, j) => sum + j.quantity, 0),
      lostPieces: jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0),
    };
  }

  const today = '2024-01-15';

  it('should count jobs by status correctly', () => {
    const jobs: Job[] = [
      { id: '1', status: 'finished', quantity: 100, lost_pieces: 0, scheduled_date: today },
      { id: '2', status: 'production', quantity: 200, lost_pieces: 0, scheduled_date: today },
      { id: '3', status: 'queue', quantity: 150, lost_pieces: 0, scheduled_date: null },
      { id: '4', status: 'ready', quantity: 50, lost_pieces: 0, scheduled_date: null },
    ];

    const stats = calculateStats(jobs, today);

    expect(stats.total).toBe(4);
    expect(stats.completed).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.queue).toBe(1);
    expect(stats.ready).toBe(1);
  });

  it('should calculate today stats correctly', () => {
    const jobs: Job[] = [
      { id: '1', status: 'finished', quantity: 100, lost_pieces: 0, scheduled_date: today },
      { id: '2', status: 'production', quantity: 200, lost_pieces: 0, scheduled_date: today },
      { id: '3', status: 'queue', quantity: 150, lost_pieces: 0, scheduled_date: '2024-01-16' },
    ];

    const stats = calculateStats(jobs, today);

    expect(stats.todayScheduled).toBe(2);
    expect(stats.todayCompleted).toBe(1);
    expect(stats.todayInProgress).toBe(1);
  });

  it('should calculate piece totals correctly', () => {
    const jobs: Job[] = [
      { id: '1', status: 'finished', quantity: 100, lost_pieces: 5, scheduled_date: today },
      { id: '2', status: 'production', quantity: 200, lost_pieces: 10, scheduled_date: today },
      { id: '3', status: 'queue', quantity: 150, lost_pieces: 0, scheduled_date: null },
    ];

    const stats = calculateStats(jobs, today);

    expect(stats.totalPieces).toBe(450);
    expect(stats.completedPieces).toBe(100);
    expect(stats.lostPieces).toBe(15);
  });

  it('should handle empty jobs array', () => {
    const stats = calculateStats([], today);

    expect(stats.total).toBe(0);
    expect(stats.totalPieces).toBe(0);
    expect(stats.lostPieces).toBe(0);
  });

  it('should handle null lost_pieces', () => {
    const jobs: Job[] = [
      { id: '1', status: 'finished', quantity: 100, lost_pieces: null, scheduled_date: today },
    ];

    const stats = calculateStats(jobs, today);

    expect(stats.lostPieces).toBe(0);
  });
});

describe('Helper Function Logic', () => {
  interface Technique {
    id: string;
    name: string;
  }

  interface Machine {
    id: string;
    technique_id: string;
  }

  interface Job {
    id: string;
    status: string;
    machine_id: string | null;
    technique_id: string;
  }

  it('should find technique by id', () => {
    const techniques: Technique[] = [
      { id: 'tech-1', name: 'Laser' },
      { id: 'tech-2', name: 'Silk' },
    ];

    const getTechniqueById = (id: string) => techniques.find(t => t.id === id);

    expect(getTechniqueById('tech-1')?.name).toBe('Laser');
    expect(getTechniqueById('tech-999')).toBeUndefined();
  });

  it('should find machine by id', () => {
    const machines: Machine[] = [
      { id: 'machine-1', technique_id: 'tech-1' },
      { id: 'machine-2', technique_id: 'tech-2' },
    ];

    const getMachineById = (id: string | null) => {
      if (!id) return undefined;
      return machines.find(m => m.id === id);
    };

    expect(getMachineById('machine-1')?.technique_id).toBe('tech-1');
    expect(getMachineById(null)).toBeUndefined();
  });

  it('should get machines by technique', () => {
    const machines: Machine[] = [
      { id: 'machine-1', technique_id: 'tech-1' },
      { id: 'machine-2', technique_id: 'tech-1' },
      { id: 'machine-3', technique_id: 'tech-2' },
    ];

    const getMachinesByTechnique = (techniqueId: string) => 
      machines.filter(m => m.technique_id === techniqueId);

    expect(getMachinesByTechnique('tech-1').length).toBe(2);
    expect(getMachinesByTechnique('tech-2').length).toBe(1);
    expect(getMachinesByTechnique('tech-999').length).toBe(0);
  });

  it('should get jobs by status', () => {
    const jobs: Job[] = [
      { id: 'job-1', status: 'finished', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-2', status: 'production', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-3', status: 'finished', machine_id: 'machine-2', technique_id: 'tech-2' },
    ];

    const getJobsByStatus = (status: string) => jobs.filter(j => j.status === status);

    expect(getJobsByStatus('finished').length).toBe(2);
    expect(getJobsByStatus('production').length).toBe(1);
    expect(getJobsByStatus('queue').length).toBe(0);
  });

  it('should get jobs by machine', () => {
    const jobs: Job[] = [
      { id: 'job-1', status: 'finished', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-2', status: 'production', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-3', status: 'finished', machine_id: 'machine-2', technique_id: 'tech-2' },
    ];

    const getJobsByMachine = (machineId: string) => 
      jobs.filter(j => j.machine_id === machineId);

    expect(getJobsByMachine('machine-1').length).toBe(2);
    expect(getJobsByMachine('machine-2').length).toBe(1);
  });

  it('should get jobs by technique', () => {
    const jobs: Job[] = [
      { id: 'job-1', status: 'finished', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-2', status: 'production', machine_id: 'machine-1', technique_id: 'tech-1' },
      { id: 'job-3', status: 'finished', machine_id: 'machine-2', technique_id: 'tech-2' },
    ];

    const getJobsByTechnique = (techniqueId: string) => 
      jobs.filter(j => j.technique_id === techniqueId);

    expect(getJobsByTechnique('tech-1').length).toBe(2);
    expect(getJobsByTechnique('tech-2').length).toBe(1);
  });
});
