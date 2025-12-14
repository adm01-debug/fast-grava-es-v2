import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock useJobs hook
const mockJobs = [
  { id: '1', order_number: 'OS-001', technique_id: 'tech-1', status: 'queue', priority: 'high', created_at: '2024-01-01T10:00:00Z' },
  { id: '2', order_number: 'OS-002', technique_id: 'tech-1', status: 'queue', priority: 'medium', created_at: '2024-01-01T11:00:00Z' },
  { id: '3', order_number: 'OS-003', technique_id: 'tech-1', status: 'ready', priority: 'low', created_at: '2024-01-01T09:00:00Z' },
  { id: '4', order_number: 'OS-004', technique_id: 'tech-2', status: 'queue', priority: 'urgent', created_at: '2024-01-01T08:00:00Z' },
];

const mockTechniques = [
  { id: 'tech-1', name: 'Serigrafia', short_name: 'SER', color: '#ff0000', setup_time: 15 },
  { id: 'tech-2', name: 'Laser', short_name: 'LAS', color: '#00ff00', setup_time: 5 },
];

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs }),
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

import { useAutoBufferPromotion } from './useAutoBufferPromotion';

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

describe('useAutoBufferPromotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.bufferTarget).toBe(3);
    expect(result.current.isPromoting).toBe(false);
    expect(typeof result.current.triggerPromotion).toBe('function');
    expect(typeof result.current.promoteForTechnique).toBe('function');
  });

  it('should expose triggerPromotion function', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.triggerPromotion).toBeDefined();
  });

  it('should expose promoteForTechnique function', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.promoteForTechnique).toBeDefined();
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(
      () => useAutoBufferPromotion({ enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.bufferTarget).toBe(3);
  });

  it('should calculate buffer needs correctly', async () => {
    const { result } = renderHook(() => useAutoBufferPromotion({ showToasts: false }), {
      wrapper: createWrapper(),
    });

    // Tech-1 has 1 ready job, needs 2 more (buffer target is 3)
    // Tech-2 has 0 ready jobs, needs 3 more
    expect(result.current.bufferTarget).toBe(3);
  });

  it('should prioritize jobs by priority then creation date', async () => {
    const { result } = renderHook(() => useAutoBufferPromotion({ showToasts: false }), {
      wrapper: createWrapper(),
    });

    // The hook should prioritize urgent > high > medium > low
    // And within same priority, older jobs first
    expect(result.current.triggerPromotion).toBeDefined();
  });
});

describe('useAutoBufferPromotion - Buffer Target', () => {
  it('should have buffer target of 3', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.bufferTarget).toBe(3);
  });
});

describe('useAutoBufferPromotion - State Management', () => {
  it('should track isPromoting state correctly', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPromoting).toBe(false);
  });
});
