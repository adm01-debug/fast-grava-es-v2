import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBitrix24Sync } from './useBitrix24Sync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useBitrix24Sync', () => {
  it('should be defined', () => { expect(useBitrix24Sync).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useBitrix24Sync(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
