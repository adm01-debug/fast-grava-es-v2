import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useTPM } from './useTPM';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useTPM', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch TPM data', async () => {
    const { result } = renderHook(() => useTPM(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.tpmData).toBeDefined());
  });

  it('should fetch checklists', async () => {
    const { result } = renderHook(() => useTPM(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.checklists).toBeDefined());
  });

  it('should have completeChecklist function', () => {
    const { result } = renderHook(() => useTPM(), { wrapper: createWrapper() });
    expect(typeof result.current.completeChecklist).toBe('function');
  });
});
