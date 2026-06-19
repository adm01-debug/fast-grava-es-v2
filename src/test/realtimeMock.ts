import { vi } from 'vitest';

export type RealtimeMock = {
  supabase: {
    channel: () => unknown;
    removeChannel: ReturnType<typeof vi.fn>;
  };
  removeChannel: ReturnType<typeof vi.fn>;
  emit: (payload?: unknown) => void;
  readonly hasHandler: boolean;
};

/**
 * Mock of the Supabase Realtime API. Captures the `postgres_changes` callback
 * so tests can simulate incoming events via `emit()`.
 *
 * Must be created inside `vi.hoisted(() => ({ realtime: createRealtimeMock() }))`
 * because `vi.mock(...)` is hoisted above top-level code.
 */
export function createRealtimeMock(): RealtimeMock {
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
