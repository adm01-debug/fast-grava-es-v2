import { vi } from 'vitest';

type Handler = (payload: unknown) => void;
type Filter = { event?: string; schema?: string; table?: string };

export type RealtimeMock = {
  supabase: {
    channel: () => unknown;
    removeChannel: ReturnType<typeof vi.fn>;
  };
  removeChannel: ReturnType<typeof vi.fn>;
  /** Emits a payload to every registered handler (back-compat). */
  emit: (payload?: unknown) => void;
  /** Emits a payload only to handlers whose filter targets the given table. */
  emitFor: (table: string, payload?: unknown) => void;
  readonly hasHandler: boolean;
  readonly handlerCount: number;
};

/**
 * Mock of the Supabase Realtime API. Captures every `postgres_changes`
 * handler registered via `.on(...)` along with its filter, so tests can
 * simulate events globally with `emit()` or per-table with `emitFor(table)`.
 *
 * Must be created inside `vi.hoisted(() => ({ realtime: createRealtimeMock() }))`
 * because `vi.mock(...)` is hoisted above top-level code.
 */
export function createRealtimeMock(): RealtimeMock {
  const handlers: Array<{ filter: Filter; cb: Handler }> = [];
  const removeChannel = vi.fn();

  const supabase = {
    channel: () => {
      const ch: {
        on: (event: string, filter: Filter, cb: Handler) => typeof ch;
        subscribe: () => typeof ch;
      } = {
        on: (_event, filter, cb) => {
          handlers.push({ filter: filter || {}, cb });
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
      if (handlers.length === 0) throw new Error('Realtime handler not registered yet');
      handlers.forEach(h => h.cb(payload));
    },
    emitFor: (table: string, payload: unknown = { eventType: 'INSERT' }) => {
      const targeted = handlers.filter(h => h.filter.table === table);
      if (targeted.length === 0) {
        throw new Error(`No Realtime handler registered for table "${table}"`);
      }
      targeted.forEach(h => h.cb(payload));
    },
    get hasHandler() {
      return handlers.length > 0;
    },
    get handlerCount() {
      return handlers.length;
    },
  };
}
