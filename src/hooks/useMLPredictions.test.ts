import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })),
    functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) },
  },
}));

import { useMLPredictions } from './useMLPredictions';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useMLPredictions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch predictions', async () => {
    const { result } = renderHook(() => useMLPredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.predictions).toBeDefined());
  });

  it('should fetch maintenance predictions', async () => {
    const { result } = renderHook(() => useMLPredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.maintenancePredictions).toBeDefined());
  });

  it('should fetch quality predictions', async () => {
    const { result } = renderHook(() => useMLPredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.qualityPredictions).toBeDefined());
  });

  it('should have generatePrediction function', () => {
    const { result } = renderHook(() => useMLPredictions(), { wrapper: createWrapper() });
    expect(typeof result.current.generatePrediction).toBe('function');
  });

  it('should track model accuracy', async () => {
    const { result } = renderHook(() => useMLPredictions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.modelAccuracy).toBeDefined());
  });
});
