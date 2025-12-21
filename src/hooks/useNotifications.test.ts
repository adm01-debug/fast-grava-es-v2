import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

import { useNotifications } from './useNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch notifications', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.notifications).toBeDefined());
  });

  it('should count unread', async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.unreadCount).toBeDefined());
  });

  it('should have markAsRead function', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('should have markAllAsRead function', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should have deleteNotification function', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(typeof result.current.deleteNotification).toBe('function');
  });
});
