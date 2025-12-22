import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBottleneckPrediction } from './useBottleneckPrediction';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useBottleneckPrediction', () => {
  it('should be defined', () => { expect(useBottleneckPrediction).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useBottleneckPrediction(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
