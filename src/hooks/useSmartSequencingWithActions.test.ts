import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data with color groups
const today = new Date().toISOString().split('T')[0];

const mockJobs = [
  { 
    id: 'job-1', 
    order_number: 'OS-001', 
    client: 'Cliente A',
    product: 'Camiseta',
    technique_id: 'tech-1', 
    machine_id: 'machine-1',
    status: 'scheduled', 
    priority: 'medium',
    scheduled_date: today,
    estimated_duration: 60,
    start_time: '08:00',
    end_time: '09:00',
    created_at: '2024-01-01T10:00:00Z',
    gravure_color: 'Azul'
  },
  { 
    id: 'job-2', 
    order_number: 'OS-002', 
    client: 'Cliente B',
    product: 'Caneca',
    technique_id: 'tech-1', 
    machine_id: 'machine-1',
    status: 'scheduled', 
    priority: 'low',
    scheduled_date: today,
    estimated_duration: 45,
    start_time: '09:00',
    end_time: '09:45',
    created_at: '2024-01-01T11:00:00Z',
    gravure_color: 'Vermelho'
  },
  { 
    id: 'job-3', 
    order_number: 'OS-003', 
    client: 'Cliente C',
    product: 'Boné',
    technique_id: 'tech-1', 
    machine_id: 'machine-1',
    status: 'ready', 
    priority: 'high',
    scheduled_date: today,
    estimated_duration: 30,
    start_time: '09:45',
    end_time: '10:15',
    created_at: '2024-01-01T09:00:00Z',
    gravure_color: 'Azul'
  },
  { 
    id: 'job-4', 
    order_number: 'OS-004', 
    client: 'Cliente D',
    product: 'Chaveiro',
    technique_id: 'tech-1', 
    machine_id: 'machine-1',
    status: 'queue', 
    priority: 'medium',
    scheduled_date: today,
    estimated_duration: 50,
    start_time: '10:15',
    end_time: '11:05',
    created_at: '2024-01-01T12:00:00Z',
    gravure_color: 'Vermelho'
  },
];

const mockMachines = [
  { id: 'machine-1', name: 'Serigrafia 1', code: 'SER-01', technique_id: 'tech-1', is_active: true },
];

const mockTechniques = [
  { id: 'tech-1', name: 'Serigrafia', short_name: 'SER', color: '#ff0000', setup_time: 15 },
];

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock useJobs hook
vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs }),
  useMachines: () => ({ data: mockMachines }),
  useTechniques: () => ({ data: mockTechniques }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

import { useSmartSequencingWithActions, SequencingSuggestion } from './useSmartSequencingWithActions';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useSmartSequencingWithActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct structure', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toBeDefined();
    expect(Array.isArray(result.current.suggestions)).toBe(true);
    expect(typeof result.current.totalSavings).toBe('number');
    expect(typeof result.current.hasSuggestions).toBe('boolean');
    expect(result.current.isApplying).toBe(false);
  });

  it('should expose applySequencing function', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.applySequencing).toBe('function');
  });

  it('should expose applyAllSequencing function', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.applyAllSequencing).toBe('function');
  });

  it('should calculate total savings', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.totalSavings).toBeGreaterThanOrEqual(0);
  });

  it('should indicate if suggestions exist', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasSuggestions).toBe(result.current.suggestions.length > 0);
  });

  it('should return isApplying as false initially', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isApplying).toBe(false);
  });
});

describe('useSmartSequencingWithActions - Suggestions Structure', () => {
  it('should generate suggestions with required fields', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    if (result.current.suggestions.length > 0) {
      const suggestion = result.current.suggestions[0];
      expect(suggestion.id).toBeDefined();
      expect(suggestion.machineId).toBeDefined();
      expect(suggestion.machineName).toBeDefined();
      expect(suggestion.machineCode).toBeDefined();
      expect(suggestion.techniqueId).toBeDefined();
      expect(suggestion.techniqueName).toBeDefined();
      expect(suggestion.currentSequence).toBeDefined();
      expect(suggestion.optimizedSequence).toBeDefined();
      expect(suggestion.estimatedSavings).toBeDefined();
      expect(suggestion.colorGroups).toBeDefined();
    }
  });

  it('should group jobs by color', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    if (result.current.suggestions.length > 0) {
      const suggestion = result.current.suggestions[0];
      expect(Array.isArray(suggestion.colorGroups)).toBe(true);
      
      suggestion.colorGroups.forEach(group => {
        expect(group.color).toBeDefined();
        expect(Array.isArray(group.jobs)).toBe(true);
        expect(typeof group.jobCount).toBe('number');
      });
    }
  });

  it('should sort suggestions by estimated savings (descending)', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    const suggestions = result.current.suggestions;
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].estimatedSavings).toBeGreaterThanOrEqual(suggestions[i].estimatedSavings);
    }
  });
});

describe('useSmartSequencingWithActions - Color Normalization', () => {
  it('should normalize colors correctly', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    // Our mock data has "Azul" and "Vermelho" colors
    // After normalization, they should be lowercase with hyphens
    if (result.current.suggestions.length > 0) {
      const colorGroups = result.current.suggestions[0].colorGroups;
      colorGroups.forEach(group => {
        // Color should be normalized (lowercase, hyphens)
        expect(group.color).toBe(group.color.toLowerCase());
        expect(group.color).not.toContain(' ');
      });
    }
  });
});

describe('useSmartSequencingWithActions - Sequencing Logic', () => {
  it('should only consider jobs with valid statuses', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    // Hook should only consider scheduled, ready, queue status jobs
    if (result.current.suggestions.length > 0) {
      const suggestion = result.current.suggestions[0];
      suggestion.currentSequence.forEach(job => {
        expect(['scheduled', 'ready', 'queue']).toContain(job.status);
      });
    }
  });

  it('should require at least 2 jobs for sequencing optimization', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    // All suggestions should have at least 2 jobs
    result.current.suggestions.forEach(suggestion => {
      expect(suggestion.currentSequence.length).toBeGreaterThanOrEqual(2);
      expect(suggestion.optimizedSequence.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('should maintain priority order within color groups', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    if (result.current.suggestions.length > 0) {
      const suggestion = result.current.suggestions[0];
      
      // Within each color group in the optimized sequence, priority should be respected
      // urgent (0) > high (1) > medium (2) > low (3)
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      
      suggestion.colorGroups.forEach(group => {
        for (let i = 1; i < group.jobs.length; i++) {
          const prevPriority = priorityOrder[group.jobs[i - 1].priority] ?? 2;
          const currPriority = priorityOrder[group.jobs[i].priority] ?? 2;
          expect(prevPriority).toBeLessThanOrEqual(currPriority);
        }
      });
    }
  });
});

describe('useSmartSequencingWithActions - Savings Calculation', () => {
  it('should calculate positive savings only', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    // All suggestions should have positive savings (otherwise no point optimizing)
    result.current.suggestions.forEach(suggestion => {
      expect(suggestion.estimatedSavings).toBeGreaterThan(0);
    });
  });

  it('should calculate savings based on setup time', () => {
    const { result } = renderHook(() => useSmartSequencingWithActions(), {
      wrapper: createWrapper(),
    });

    // Setup time for Serigrafia is 15 minutes
    // Each color change avoided saves 15 minutes
    if (result.current.suggestions.length > 0) {
      const suggestion = result.current.suggestions[0];
      // Savings should be a multiple of setup time (15 minutes for Serigrafia)
      expect(suggestion.estimatedSavings % 15).toBe(0);
    }
  });
});
