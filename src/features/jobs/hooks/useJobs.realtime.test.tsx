import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { RealtimeMock } from '@/test/realtimeMock';

const holder = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  realtime: null as RealtimeMock | null,
}));

vi.mock('../services/jobsService', () => ({
  jobsService: {
    getAll: (...args: unknown[]) => holder.getAllMock(...args),
    updateStatus: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../index', () => ({
  techniquesService: { getAll: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/integrations/supabase/client', async () => {
  const { createRealtimeMock } = await import('@/test/realtimeMock');
  holder.realtime = createRealtimeMock();
  return { supabase: holder.realtime.supabase };
});

import { useJobs } from './useJobs';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useJobs — Realtime invalidation', () => {
  beforeEach(() => {
    holder.getAllMock.mockReset();
    holder.getAllMock.mockResolvedValue([{ id: 'j1', status: 'queue' }]);
    holder.realtime!.removeChannel.mockClear();
  });



  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useJobs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(holder.getAllMock).toHaveBeenCalledTimes(1);

    expect(holder.realtime!.hasHandler).toBe(true);
    act(() => holder.realtime!.emit({ eventType: 'INSERT' }));

    await waitFor(() => expect(holder.getAllMock).toHaveBeenCalledTimes(2));
  });
});
