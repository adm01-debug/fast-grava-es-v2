import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  categorizeError: vi.fn(() => 'database_error'),
}));

import { supabase } from '@/integrations/supabase/client';
import { useTPMData } from './useTPMData';

describe('useTPMData', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  const mockMaintenanceTypes = [
    { id: 'mt1', name: 'Preventive', color: '#00ff00', default_interval_days: 7 },
    { id: 'mt2', name: 'Corrective', color: '#ff0000', default_interval_days: 1 },
  ];

  const mockSchedules = [
    {
      id: 's1',
      machine_id: 'm1',
      maintenance_type_id: 'mt1',
      name: 'Weekly Check',
      next_due_at: '2024-01-20T10:00:00Z',
      machines: { id: 'm1', name: 'Machine 1', code: 'M1' },
      maintenance_types: mockMaintenanceTypes[0],
    },
  ];

  const mockChecklists = [
    {
      id: 'c1',
      name: 'Standard Checklist',
      maintenance_type_id: 'mt1',
      is_active: true,
      maintenance_checklist_items: [
        { id: 'ci1', description: 'Check oil', is_critical: true },
      ],
    },
  ];

  const mockRecords = [
    {
      id: 'r1',
      schedule_id: 's1',
      machine_id: 'm1',
      machines: { id: 'm1', name: 'Machine 1', code: 'M1' },
      status: 'completed',
    },
  ];

  const mockAlerts = [
    {
      id: 'a1',
      schedule_id: 's1',
      machine_id: 'm1',
      machines: { id: 'm1', name: 'Machine 1', code: 'M1' },
      alert_type: 'due',
      is_resolved: false,
    },
  ];

  const mockMachines = [
    { id: 'm1', name: 'Machine 1', code: 'M1', is_active: true },
    { id: 'm2', name: 'Machine 2', code: 'M2', is_active: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Setup mock chain for each table
    const mockFrom = vi.mocked(supabase.from);
    
    mockFrom.mockImplementation((table: string) => {
      // Configure chain based on table
      switch (table) {
        case 'maintenance_types':
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockMaintenanceTypes, error: null }),
            }),
          } as any;
        case 'maintenance_schedules':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockSchedules, error: null }),
              }),
            }),
          } as any;
        case 'maintenance_checklists':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockChecklists, error: null }),
              }),
            }),
          } as any;
        case 'maintenance_records':
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockRecords, error: null }),
              }),
            }),
          } as any;
        case 'maintenance_alerts':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockAlerts, error: null }),
              }),
            }),
          } as any;
        case 'machines':
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockMachines, error: null }),
              }),
            }),
          } as any;
        default:
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          } as any;
      }
    });
  });

  describe('data fetching', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useTPMData(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return default empty arrays initially', () => {
      const { result } = renderHook(() => useTPMData(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.maintenanceTypes)).toBe(true);
      expect(Array.isArray(result.current.schedules)).toBe(true);
      expect(Array.isArray(result.current.checklists)).toBe(true);
      expect(Array.isArray(result.current.records)).toBe(true);
      expect(Array.isArray(result.current.alerts)).toBe(true);
      expect(Array.isArray(result.current.machines)).toBe(true);
    });
  });

  describe('realtime subscriptions', () => {
    it('should setup realtime channels on mount', () => {
      renderHook(() => useTPMData(), {
        wrapper: createWrapper(),
      });

      expect(supabase.channel).toHaveBeenCalledWith('tpm-schedules-changes');
      expect(supabase.channel).toHaveBeenCalledWith('tpm-records-changes');
      expect(supabase.channel).toHaveBeenCalledWith('tpm-alerts-changes');
    });

    it('should cleanup channels on unmount', () => {
      const { unmount } = renderHook(() => useTPMData(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(supabase.removeChannel).toHaveBeenCalledTimes(3);
    });
  });

  describe('query configuration', () => {
    it('should call supabase.from with correct table names', () => {
      renderHook(() => useTPMData(), {
        wrapper: createWrapper(),
      });

      expect(supabase.from).toHaveBeenCalledWith('maintenance_types');
      expect(supabase.from).toHaveBeenCalledWith('maintenance_schedules');
      expect(supabase.from).toHaveBeenCalledWith('maintenance_checklists');
      expect(supabase.from).toHaveBeenCalledWith('maintenance_records');
      expect(supabase.from).toHaveBeenCalledWith('maintenance_alerts');
      expect(supabase.from).toHaveBeenCalledWith('machines');
    });
  });
});
