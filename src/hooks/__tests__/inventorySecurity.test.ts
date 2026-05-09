import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInventory } from '../useInventory';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock Query Client
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

describe('useInventory Logic & Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block transfers if item is not at origin', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnValue({ 
        data: { id: '1', location: 'B1', current_stock: 10 }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useInventory());

    // Try to transfer from A1 to A2, but item is at B1
    await expect(result.current.transferItems({
      fromLocation: 'A1',
      toLocation: 'A2',
      itemIds: ['1']
    })).rejects.toThrow();
  });

  it('should prevent output if stock is insufficient', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user1' } } });
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'inventory_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnValue({ 
            data: { id: '1', current_stock: 5, name: 'Item Test' }, 
            error: null 
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
      };
    });

    const { result } = renderHook(() => useInventory());

    // Try to take out 10, but only 5 available
    await expect(result.current.recordMovement({
      item_id: '1',
      type: 'OUT',
      quantity: 10,
      reason: 'Test',
      from_location: null,
      to_location: null,
      job_id: null,
    })).rejects.toThrow(/insuficiente/);
  });
});
