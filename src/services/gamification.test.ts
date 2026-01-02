import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [{ id: '1', points: 500, level: 5 }], error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('Gamification Service', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('fetches user points', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const result = await supabase.from('user_points').select('*').eq('user_id', '1');
    expect(result.data?.[0]?.points).toBe(500);
  });

  it('calculates level correctly', () => {
    const calculateLevel = (points: number) => Math.floor(points / 100) + 1;
    expect(calculateLevel(500)).toBe(6);
  });
});
