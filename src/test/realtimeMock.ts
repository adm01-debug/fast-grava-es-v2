import { vi } from 'vitest';

/**
 * Creates a mock of the Supabase client's Realtime API that captures the
 * `postgres_changes` handler so tests can simulate incoming events.
 *
 * Usage:
 *   const realtime = createRealtimeMock();
 *   vi.mock('@/integrations/supabase/client', () => ({ supabase: realtime.supabase }));
 *   // ...later
 *   realtime.emit({ eventType: 'INSERT' });
 */
export function createRealtimeMock() {
  const state: { handler: ((payload: unknown) => void) | null } = { handler: null };
  const removeChannel = vi.fn();

  const supabase = {
    channel: () => {
      const ch: {
        on: (event: string, filter: unknown, cb: (payload: unknown) => void) => typeof ch;
        subscribe: () => typeof ch;
      } = {
        on: (_event, _filter, cb) => {
          state.handler = cb;
          return ch;
        },
        subscribe: () => ch,
      };
      return ch;
    },
    removeChannel,
  };

  return {
    supabase,
    removeChannel,
    emit: (payload: unknown = { eventType: 'INSERT' }) => {
      if (!state.handler) throw new Error('Realtime handler not registered yet');
      state.handler(payload);
    },
    get hasHandler() {
      return state.handler !== null;
    },
  };
}
