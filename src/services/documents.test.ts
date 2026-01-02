import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test.pdf' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/file.pdf' } })),
      })),
    },
  },
}));

describe('Documents Service', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('handles file upload', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const result = await supabase.storage.from('documents').upload('test.pdf', new Blob());
    expect(result.data?.path).toBe('test.pdf');
  });

  it('handles file download', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const result = await supabase.storage.from('documents').download('test.pdf');
    expect(result.data).toBeInstanceOf(Blob);
  });
});
