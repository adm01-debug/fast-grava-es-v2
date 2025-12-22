import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useABCMutations } from './useABCMutations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useABCMutations', () => {
  it('should be defined', () => { expect(useABCMutations).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useABCMutations(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
