import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
    functions: { invoke: vi.fn(() => Promise.resolve({ data: null, error: null })) },
  },
}));

import { usePushNotifications } from './usePushNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('usePushNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should track permission status', async () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.permissionStatus).toBeDefined());
  });

  it('should track subscription status', async () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSubscribed).toBeDefined());
  });

  it('should have subscribe function', () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.subscribe).toBe('function');
  });

  it('should have unsubscribe function', () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.unsubscribe).toBe('function');
  });

  it('should have requestPermission function', () => {
    const { result } = renderHook(() => usePushNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.requestPermission).toBe('function');
  });
});
