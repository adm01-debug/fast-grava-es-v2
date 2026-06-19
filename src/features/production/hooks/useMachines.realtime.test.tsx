import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRealtimeMock } from '@/test/realtimeMock';

const { getActiveMock, realtime } = vi.hoisted(async () => {
  const { createRealtimeMock: make } = await import('@/test/realtimeMock');
  return { getActiveMock: vi.fn(), realtime: make() };
}) as unknown as { getActiveMock: ReturnType<typeof vi.fn>; realtime: ReturnType<typeof createRealtimeMock> };

vi.mock('../index', () => ({
  machinesService: { getActive: (...args: unknown[]) => getActiveMock(...args) },
}));

vi.mock('@/integrations/supabase/client', () => ({ supabase: realtime.supabase }));

import { useMachines } from './useMachines';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useMachines — Realtime invalidation', () => {
  beforeEach(() => {
    getActiveMock.mockReset();
    getActiveMock.mockResolvedValue([{ id: 'm1', name: 'Laser-01', is_active: true }]);
  });

  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useMachines(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getActiveMock).toHaveBeenCalledTimes(1);

    expect(realtime.hasHandler).toBe(true);
    act(() => realtime.emit({ eventType: 'UPDATE' }));

    await waitFor(() => expect(getActiveMock).toHaveBeenCalledTimes(2));
  });
});
