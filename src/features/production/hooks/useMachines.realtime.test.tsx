import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const getActiveMock = vi.fn();
let capturedHandler: ((payload: unknown) => void) | null = null;

vi.mock('../index', () => ({
  machinesService: { getActive: (...args: unknown[]) => getActiveMock(...args) },
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

import { useMachines } from './useMachines';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useMachines — Realtime invalidation', () => {
  beforeEach(() => {
    getActiveMock.mockReset();
    getActiveMock.mockResolvedValue([{ id: 'm1', name: 'Laser-01', is_active: true }]);
    capturedHandler = null;
  });

  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useMachines(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getActiveMock).toHaveBeenCalledTimes(1);

    getActiveMock.mockResolvedValue([
      { id: 'm1', name: 'Laser-01', is_active: true },
      { id: 'm2', name: 'Laser-02', is_active: true },
    ]);

    expect(capturedHandler).toBeTypeOf('function');
    act(() => capturedHandler!({ eventType: 'UPDATE' }));

    await waitFor(() => expect(getActiveMock).toHaveBeenCalledTimes(2));
  });
});
