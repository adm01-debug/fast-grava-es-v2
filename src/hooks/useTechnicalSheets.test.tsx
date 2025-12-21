import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), ilike: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })), delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) },
}));

import { useTechnicalSheets } from './useTechnicalSheets';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useTechnicalSheets', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch technical sheets', async () => {
    const { result } = renderHook(() => useTechnicalSheets(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.sheets).toBeDefined());
  });

  it('should search sheets', async () => {
    const { result } = renderHook(() => useTechnicalSheets({ search: 'test' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.sheets).toBeDefined());
  });

  it('should have createSheet function', () => {
    const { result } = renderHook(() => useTechnicalSheets(), { wrapper: createWrapper() });
    expect(typeof result.current.createSheet).toBe('function');
  });

  it('should have updateSheet function', () => {
    const { result } = renderHook(() => useTechnicalSheets(), { wrapper: createWrapper() });
    expect(typeof result.current.updateSheet).toBe('function');
  });

  it('should have deleteSheet function', () => {
    const { result } = renderHook(() => useTechnicalSheets(), { wrapper: createWrapper() });
    expect(typeof result.current.deleteSheet).toBe('function');
  });
});
