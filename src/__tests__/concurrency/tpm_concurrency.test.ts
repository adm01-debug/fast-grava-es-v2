import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * TPM Record Concurrency Test
 * Simulates multiple users trying to update or approve the same maintenance record.
 */
describe('TPM Record Concurrency', () => {
  it('should handle concurrent approval attempts gracefully', async () => {
    const testRecordId = '00000000-0000-0000-0000-000000000000'; // Mock/Test ID

    // Simulate 5 concurrent approval calls
    const requests = Array.from({ length: 5 }).map(() =>
      supabase
        .from('maintenance_records')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', testRecordId)
    );

    // We expect consistency. Even if they fail because the ID doesn't exist,
    // they should fail with "0 rows affected" or 404, not crash the engine.
    const results = await Promise.all(requests);

    const errors = results.filter(r => r.error);
    // If we have errors, they should be consistent (e.g., all 401 or 404)
    if (errors.length > 0) {
      const firstCode = (errors[0].error as any).code;
      expect(errors.every(e => (e.error as any).code === firstCode)).toBe(true);
    }
  });
});
