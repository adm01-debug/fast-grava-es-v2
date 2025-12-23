import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAlertCount } from './useAlertCount';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useAlertCount', () => {
  it('should be defined', () => { expect(useAlertCount).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useAlertCount(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
