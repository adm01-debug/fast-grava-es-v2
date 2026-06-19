import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const getAllMock = vi.fn();
let capturedHandler: ((payload: unknown) => void) | null = null;

vi.mock('@/features/jobs', () => ({
  techniquesService: { getAll: (...args: unknown[]) => getAllMock(...args) },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: () => {
      const ch: any = {
        on: (_event: string, _filter: unknown, cb: (payload: unknown) => void) => {
          capturedHandler = cb;
          return ch;
        },
        subscribe: () => ch,
      };
      return ch;
    },
    removeChannel: vi.fn(),
  },
}));

import { useTechniques } from './useTechniques';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useTechniques — Realtime invalidation', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getAllMock.mockResolvedValue([{ id: '1', name: 'Bordado' }]);
    capturedHandler = null;
  });

  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useTechniques(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAllMock).toHaveBeenCalledTimes(1);

    getAllMock.mockResolvedValue([
      { id: '1', name: 'Bordado' },
      { id: '2', name: 'Sublimação' },
    ]);

    expect(capturedHandler).toBeTypeOf('function');
    act(() => capturedHandler!({ eventType: 'INSERT' }));

    await waitFor(() => expect(getAllMock).toHaveBeenCalledTimes(2));
  });
});
