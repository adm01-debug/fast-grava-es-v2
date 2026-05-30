import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Supabase client so we can observe (and control) error_logs inserts.
const insertMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  },
}));

import { logger } from './logger';

describe('logger persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('batches multiple events into a single insert after the debounce window', async () => {
    logger.error('boom 1');
    logger.warn('slow 1');
    logger.error('boom 2');

    // Nothing flushed synchronously (writes are deferred off the hot path).
    expect(insertMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2100);

    expect(insertMock).toHaveBeenCalledTimes(1);
    const rows = insertMock.mock.calls[0][0];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(3);
  });

  it('does not recurse when the error_logs insert itself fails', async () => {
    // Simulate the telemetry write failing — this must NOT generate more logs.
    insertMock.mockResolvedValueOnce({ error: { message: 'insert failed' } });
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('trigger');
    await vi.advanceTimersByTimeAsync(2100);

    // One flush attempt; the failure is reported via console only (no re-insert).
    expect(insertMock).toHaveBeenCalledTimes(1);
    consoleErr.mockRestore();
  });
});
