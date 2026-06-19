import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { RealtimeMock } from '@/test/realtimeMock';

const holder = vi.hoisted(() => ({
  jobsGetAll: vi.fn(),
  machinesGetAll: vi.fn(),
  profilesData: [] as unknown[],
  techniquesData: [] as unknown[],
  realtime: null as RealtimeMock | null,
}));

vi.mock('../services/jobsService', () => ({
  jobsService: { getAll: (...args: unknown[]) => holder.jobsGetAll(...args) },
}));

vi.mock('../../production/services/machinesService', () => ({
  machinesService: { getAll: (...args: unknown[]) => holder.machinesGetAll(...args) },
}));

vi.mock('@/integrations/supabase/client', async () => {
  const { createRealtimeMock } = await import('@/test/realtimeMock');
  holder.realtime = createRealtimeMock();

  // Minimal `from(table).select().order()` chain returning data per holder map.
  const from = (table: string) => {
    const result =
      table === 'profiles'
        ? { data: holder.profilesData, error: null }
        : table === 'techniques'
        ? { data: holder.techniquesData, error: null }
        : { data: [], error: null };

    const builder: {
      select: () => typeof builder;
      order: () => Promise<typeof result>;
      then: (resolve: (v: typeof result) => unknown) => unknown;
    } = {
      select: () => builder,
      order: () => Promise.resolve(result),
      then: (resolve) => Promise.resolve(result).then(resolve),
    };
    return builder;
  };

  return {
    supabase: { ...holder.realtime.supabase, from },
  };
});

import { useSchedulingData } from './useSchedulingData';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useSchedulingData — Realtime invalidation (múltiplas tabelas)', () => {
  beforeEach(() => {
    holder.jobsGetAll.mockReset();
    holder.machinesGetAll.mockReset();
    holder.jobsGetAll.mockResolvedValue([{ id: 'j1', status: 'queue', technique_id: 't1' }]);
    holder.machinesGetAll.mockResolvedValue([{ id: 'm1', name: 'Laser-01', technique_id: 't1' }]);
    holder.profilesData = [{ id: 'p1', full_name: 'Op', avatar_url: null }];
    holder.techniquesData = [{ id: 't1', name: 'Bordado' }];
  });

  it('registra um handler por tabela (jobs/techniques/machines)', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useSchedulingData(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(holder.realtime!.handlerCount).toBe(3);
  });

  it('invalida e refaz fetch de jobs ao receber evento da tabela jobs', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    renderHook(() => useSchedulingData(), { wrapper });
    await waitFor(() => expect(holder.jobsGetAll).toHaveBeenCalledTimes(1));

    act(() => holder.realtime!.emitFor('jobs', { eventType: 'INSERT' }));

    await waitFor(() => expect(holder.jobsGetAll).toHaveBeenCalledTimes(2));
    expect(holder.machinesGetAll).toHaveBeenCalledTimes(1);
  });

  it('invalida e refaz fetch de machines ao receber evento da tabela machines', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    renderHook(() => useSchedulingData(), { wrapper });
    await waitFor(() => expect(holder.machinesGetAll).toHaveBeenCalledTimes(1));

    act(() => holder.realtime!.emitFor('machines', { eventType: 'UPDATE' }));

    await waitFor(() => expect(holder.machinesGetAll).toHaveBeenCalledTimes(2));
    expect(holder.jobsGetAll).toHaveBeenCalledTimes(1);
  });
});
