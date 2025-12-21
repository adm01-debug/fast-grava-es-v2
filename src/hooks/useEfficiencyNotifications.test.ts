import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
  },
}));

import { useEfficiencyNotifications } from './useEfficiencyNotifications';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEfficiencyNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Notifications', () => {
    it('should fetch notifications', async () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.notifications).toBeDefined());
    });

    it('should track unread count', async () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.unreadCount).toBeDefined());
    });
  });

  describe('Thresholds', () => {
    it('should have efficiency threshold', async () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.efficiencyThreshold).toBeDefined());
    });

    it('should have setThreshold function', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.setThreshold).toBe('function');
    });
  });

  describe('Actions', () => {
    it('should have markAsRead function', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.markAsRead).toBe('function');
    });

    it('should have markAllAsRead function', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.markAllAsRead).toBe('function');
    });

    it('should have dismissNotification function', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.dismissNotification).toBe('function');
    });
  });

  describe('Settings', () => {
    it('should have notification settings', async () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.settings).toBeDefined());
    });

    it('should have updateSettings function', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.updateSettings).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), { wrapper: createWrapper() });
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
