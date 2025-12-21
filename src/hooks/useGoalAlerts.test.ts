import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

import { useGoalAlerts } from './useGoalAlerts';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGoalAlerts', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Alerts', () => {
    it('should fetch goal alerts', async () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });

    it('should track active alerts', async () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.activeAlerts).toBeDefined());
    });
  });

  describe('Goal Progress', () => {
    it('should track goals at risk', async () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.goalsAtRisk).toBeDefined());
    });

    it('should track goals on track', async () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.goalsOnTrack).toBeDefined());
    });

    it('should track goals achieved', async () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.goalsAchieved).toBeDefined());
    });
  });

  describe('Notifications', () => {
    it('should have configureAlert function', () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      expect(typeof result.current.configureAlert).toBe('function');
    });

    it('should have dismissAlert function', () => {
      const { result } = renderHook(() => useGoalAlerts(), { wrapper: createWrapper() });
      expect(typeof result.current.dismissAlert).toBe('function');
    });
  });
});
