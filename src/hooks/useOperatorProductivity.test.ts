import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOperatorProductivity } from './useOperatorProductivity';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn(),
  },
}));

describe('useOperatorProductivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and calculate productivity data', async () => {
    const mockOperators = [
      { id: '1', full_name: 'John Doe', is_active: true }
    ];
    
    const mockJobs = [
      { 
        operator_id: '1', 
        status: 'finished', 
        produced_quantity: 100, 
        lost_pieces: 5, 
        actual_duration: 60 
      }
    ];

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockResolvedValue({ data: mockOperators, error: null }),
        };
      }
      if (table === 'jobs') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
        };
      }
      return { select: vi.fn().mockReturnThis() };
    });

    const { result } = renderHook(() => useOperatorProductivity('24h'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.operators).toHaveLength(1);
    expect(result.current.operators[0].operatorName).toBe('John Doe');
    expect(result.current.operators[0].totalJobsCompleted).toBe(1);
    expect(result.current.operators[0].lossRate).toBeCloseTo(4.76, 1); // 5 / (100+5)
  });

  it('should handle errors gracefully', async () => {
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' } }),
    }));

    const { result } = renderHook(() => useOperatorProductivity('24h'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.operators).toHaveLength(0);
  });
});
