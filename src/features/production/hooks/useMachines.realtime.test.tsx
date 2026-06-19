import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { RealtimeMock } from '@/test/realtimeMock';

const holder = vi.hoisted(() => ({
  getActiveMock: vi.fn(),
  realtime: null as RealtimeMock | null,
}));

vi.mock('../index', () => ({
  machinesService: { getActive: (...args: unknown[]) => holder.getActiveMock(...args) },
}));

vi.mock('@/integrations/supabase/client', async () => {
  const { createRealtimeMock } = await import('@/test/realtimeMock');
  holder.realtime = createRealtimeMock();
  return { supabase: holder.realtime.supabase };
});

import { useMachines } from './useMachines';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useMachines — Realtime invalidation', () => {
  beforeEach(() => {
    holder.getActiveMock.mockReset();
    holder.getActiveMock.mockResolvedValue([{ id: 'm1', name: 'Laser-01', is_active: true }]);
    holder.realtime!.removeChannel.mockClear();
  });

  it('chama removeChannel no unmount e ignora eventos posteriores', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { unmount } = renderHook(() => useMachines(), { wrapper });
    await waitFor(() => expect(holder.getActiveMock).toHaveBeenCalledTimes(1));
    expect(holder.realtime!.removeChannel).not.toHaveBeenCalled();

    unmount();

    expect(holder.realtime!.removeChannel).toHaveBeenCalledTimes(1);

    const callsBefore = holder.getActiveMock.mock.calls.length;
    act(() => holder.realtime!.emit({ eventType: 'UPDATE' }));
    await new Promise(r => setTimeout(r, 50));
    expect(holder.getActiveMock.mock.calls.length).toBe(callsBefore);
  });

  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useMachines(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(holder.getActiveMock).toHaveBeenCalledTimes(1);

    expect(holder.realtime!.hasHandler).toBe(true);
    act(() => holder.realtime!.emit({ eventType: 'UPDATE' }));

    await waitFor(() => expect(holder.getActiveMock).toHaveBeenCalledTimes(2));
  });
});
