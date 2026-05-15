import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define localStorage globally BEFORE any module imports
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock the supabase client BEFORE importing useJobs
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn(),
    }
  },
}));

import { useBufferStatus } from '../useJobs';
import * as useJobsModule from '../useJobs';


// Mock the dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

describe('useBufferStatus', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state when data is not available', () => {
    // Spy on useJobs and useTechniques
    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: undefined } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: undefined } as any);

    const { bufferByTechnique, isLoading } = useBufferStatus();
    expect(isLoading).toBe(true);
    expect(bufferByTechnique).toEqual([]);
  });

  it('should calculate buffer status correctly', () => {
    const mockTechniques = [
      { id: 't1', name: 'Technique 1' },
      { id: 't2', name: 'Technique 2' }
    ];
    
    const mockJobs = [
      { id: 'j1', technique_id: 't1', status: 'ready' },
      { id: 'j2', technique_id: 't1', status: 'ready' },
      { id: 'j3', technique_id: 't1', status: 'queue' },
      { id: 'j4', technique_id: 't2', status: 'production' }, // Active work but no ready jobs
    ];

    vi.spyOn(useJobsModule, 'useJobs').mockReturnValue({ data: mockJobs } as any);
    vi.spyOn(useJobsModule, 'useTechniques').mockReturnValue({ data: mockTechniques } as any);

    const { bufferByTechnique, isLoading } = useBufferStatus();
    
    expect(isLoading).toBe(false);
    
    // Technique 1: 2 ready, 1 queue
    const t1Status = bufferByTechnique.find(b => b.technique.id === 't1');
    expect(t1Status?.readyCount).toBe(2);
    expect(t1Status?.queueCount).toBe(1);
    expect(t1Status?.isWarning).toBe(true); // < 3 ready
    expect(t1Status?.isHealthy).toBe(false);

    // Technique 2: 0 ready, 0 queue, but has production job
    const t2Status = bufferByTechnique.find(b => b.technique.id === 't2');
    expect(t2Status?.readyCount).toBe(0);
    expect(t2Status?.isCritical).toBe(true); // 0 ready while having active work
  });
});
