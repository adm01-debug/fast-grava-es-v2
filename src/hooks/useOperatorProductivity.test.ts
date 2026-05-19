import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOperatorProductivity } from './useOperatorProductivity';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useOperatorProductivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and calculate productivity data', async () => {
    const mockJobs = [
      { 
        id: 'j1',
        machine_id: 'm1',
        status: 'finished', 
        produced_quantity: 100, 
        lost_pieces: 5, 
        actual_start_time: '2026-05-18T08:00:00Z',
        actual_end_time: '2026-05-18T09:00:00Z',
        estimated_duration: 60,
        quantity: 105,
        created_at: '2026-05-18T08:00:00Z'
      }
    ];

    const mockMachines = [
      { id: 'm1', name: 'Machine 1', technique_id: 't1' }
    ];

    const mockAssignments = [
      { operator_id: '1', machine_id: 'm1', machines: { name: 'Machine 1' } }
    ];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [{ user_id: '1', role: 'operator' }], error: null }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [{ id: '1', full_name: 'John Doe', avatar_url: null }], error: null }),
        };
      }
      if (table === 'jobs') {
        return {
          select: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
        };
      }
      if (table === 'machines') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockMachines, error: null }),
        };
      }
      if (table === 'techniques') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'qr_scan_history') {
        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      if (table === 'operator_machines') {
        return {
          select: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    const { result } = renderHook(() => useOperatorProductivity(7), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });

    expect(result.current.operators).toHaveLength(1);
    expect(result.current.operators[0].operatorName).toBe('John Doe');
    expect(result.current.operators[0].totalJobsCompleted).toBe(1);
    expect(result.current.operators[0].lossRate).toBeCloseTo(4.76, 1);
  });

  it('should handle errors gracefully', async () => {
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' } }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' } }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const { result } = renderHook(() => useOperatorProductivity(7), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.operators).toHaveLength(0);
  });
});


