import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRealtimeMock } from '@/test/realtimeMock';

const { getAllMock, realtime } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  realtime: (() => {
    // Lazy require inside hoisted to keep evaluation order safe.
    const mod = require('@/test/realtimeMock') as typeof import('@/test/realtimeMock');
    return mod.createRealtimeMock();
  })(),
}));

// Re-export type to keep tree-shake happy for the static import above.
void createRealtimeMock;

vi.mock('@/features/jobs', () => ({
  techniquesService: { getAll: (...args: unknown[]) => getAllMock(...args) },
}));

vi.mock('@/integrations/supabase/client', () => ({ supabase: realtime.supabase }));

import { useTechniques } from './useTechniques';

function makeWrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useTechniques — Realtime invalidation', () => {
  beforeEach(() => {
    getAllMock.mockReset();
    getAllMock.mockResolvedValue([{ id: '1', name: 'Bordado' }]);
  });

  it('refetches when a Realtime postgres_changes event arrives', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = makeWrapper(client);

    const { result } = renderHook(() => useTechniques(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getAllMock).toHaveBeenCalledTimes(1);

    expect(realtime.hasHandler).toBe(true);
    act(() => realtime.emit({ eventType: 'INSERT' }));

    await waitFor(() => expect(getAllMock).toHaveBeenCalledTimes(2));
  });
});
