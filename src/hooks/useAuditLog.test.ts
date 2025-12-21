import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuditLog } from './useAuditLog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useAuditLog', () => {
  it('should be defined', () => { expect(useAuditLog).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useAuditLog(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
