import { describe, it, expect, vi } from 'vitest';
import { api } from './api';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() })
  }
}));

describe('api', () => {
  it('should have get method', () => { expect(api.get).toBeDefined(); });
  it('should have create method', () => { expect(api.create).toBeDefined(); });
  it('should have update method', () => { expect(api.update).toBeDefined(); });
  it('should have delete method', () => { expect(api.delete).toBeDefined(); });
});
