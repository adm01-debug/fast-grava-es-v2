import { vi } from 'vitest';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        maybeSingle: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(),
      })),
      limit: vi.fn(),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  removeChannel: vi.fn(),
};

export const createMockQueryResult = <T>(data: T, error: Error | null = null) => ({
  data,
  error,
  count: null,
  status: error ? 500 : 200,
  statusText: error ? 'Error' : 'OK',
});
