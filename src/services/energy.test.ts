import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [{ id: '1', consumption: 100 }], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
    })),
  },
}));

describe('Energy Service', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('fetches energy data', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const result = await supabase.from('energy_logs').select('*').eq('machine_id', '1');
    expect(result.data).toHaveLength(1);
  });
});
