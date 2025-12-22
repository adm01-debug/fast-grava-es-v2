import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useClickOutside } from './useClickOutside';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useClickOutside', () => {
  it('should be defined', () => { expect(useClickOutside).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useClickOutside(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
