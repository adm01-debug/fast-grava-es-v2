import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useMTBFMTTR, MachineReliabilityMetrics } from './useMTBFMTTR';

// Mock Supabase
const mockSupabaseQuery = vi.fn();
const mockSupabaseChannel = vi.fn();
const mockSupabaseRemoveChannel = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        gte: () => ({
          eq: () => ({
            order: () => mockSupabaseQuery(table, 'records'),
          }),
        }),
        eq: () => mockSupabaseQuery(table, 'machines'),
      }),
    }),
    channel: (name: string) => ({
      on: () => ({
        subscribe: () => mockSupabaseChannel(name),
      }),
    }),
    removeChannel: mockSupabaseRemoveChannel,
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  createAppError: vi.fn((error) => error),
}));

// Mock query config
vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: {},
  STALE_TIMES: {
    STATIC: 300000,
  },
}));

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factories
const createMockMachine = (overrides = {}) => ({
  id: 'machine-1',
  name: 'Laser 01',
  code: 'LSR-01',
  technique_id: 'technique-1',
  is_active: true,
  ...overrides,
});

const createMockMaintenanceRecord = (overrides = {}) => ({
  id: 'record-1',
  machine_id: 'machine-1',
  maintenance_type_id: 'corrective', // corrective = failure
  started_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  downtime_minutes: 60,
  status: 'completed',
  ...overrides,
});

describe('useMTBFMTTR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseChannel.mockReturnValue({ unsubscribe: vi.fn() });
  });

  describe('Initial State and Data Fetching', () => {
    it('should initialize with empty metrics and loading state', () => {
      mockSupabaseQuery.mockImplementation((table) => {
        return new Promise(() => {}); // Never resolves - simulates loading
      });

      const { result } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      expect(result.current.metrics).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });

    it('should fetch maintenance records and machines', async () => {
      const mockMachines = [
        createMockMachine({ id: 'machine-1' }),
        createMockMachine({ id: 'machine-2', name: 'Laser 02', code: 'LSR-02' }),
      ];

      const mockRecords = [
        createMockMaintenanceRecord({ machine_id: 'machine-1', downtime_minutes: 60 }),
        createMockMaintenanceRecord({ id: 'record-2', machine_id: 'machine-1', downtime_minutes: 30 }),
      ];

      mockSupabaseQuery.mockImplementation((table, queryType) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should only have machine-1 in metrics (the one with failures)
      expect(result.current.metrics.length).toBe(1);
      expect(result.current.metrics[0].machineId).toBe('machine-1');
    });

    it('should handle empty data', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary.totalFailures).toBe(0);
      expect(result.current.summary.machinesWithData).toBe(0);
    });

    it('should handle fetch errors gracefully', async () => {
      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics).toEqual([]);
      });
    });
  });

  describe('MTBF Calculation', () => {
    it('should calculate MTBF correctly (Mean Time Between Failures)', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // 2 failures in 90 days, each with 60 min downtime
      // Operating time = (90 * 24) - (120/60) = 2160 - 2 = 2158 hours
      // MTBF = 2158 / 2 = 1079 hours
      const mockRecords = [
        createMockMaintenanceRecord({ id: 'r1', machine_id: 'machine-1', downtime_minutes: 60 }),
        createMockMaintenanceRecord({ id: 'r2', machine_id: 'machine-1', downtime_minutes: 60 }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.totalFailures).toBe(2);
      expect(metric.mtbf).toBeCloseTo(1079, 0);
    });

    it('should return null MTBF when no failures', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // Preventive maintenance only (not corrective)
      const mockRecords = [
        createMockMaintenanceRecord({ 
          id: 'r1', 
          machine_id: 'machine-1', 
          maintenance_type_id: 'preventive',
          downtime_minutes: 60 
        }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // No corrective (failure) records, so metrics should filter out this machine
      expect(result.current.metrics.length).toBe(0);
    });
  });

  describe('MTTR Calculation', () => {
    it('should calculate MTTR correctly (Mean Time To Repair)', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // 3 failures with 60, 90, and 30 minutes downtime
      // MTTR = (60 + 90 + 30) / 3 = 60 minutes
      const mockRecords = [
        createMockMaintenanceRecord({ id: 'r1', machine_id: 'machine-1', downtime_minutes: 60 }),
        createMockMaintenanceRecord({ id: 'r2', machine_id: 'machine-1', downtime_minutes: 90 }),
        createMockMaintenanceRecord({ id: 'r3', machine_id: 'machine-1', downtime_minutes: 30 }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.totalRepairTime).toBe(180); // 60 + 90 + 30
      expect(metric.mttr).toBe(60); // 180 / 3
    });
  });

  describe('Availability Calculation', () => {
    it('should calculate availability percentage correctly', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // 90 days = 2160 hours
      // 1 failure with 216 hours (12960 min) downtime = 10% downtime
      // Availability = 90%
      const mockRecords = [
        createMockMaintenanceRecord({ 
          id: 'r1', 
          machine_id: 'machine-1', 
          downtime_minutes: 12960 // 216 hours = 10% of 90 days
        }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.availability).toBeCloseTo(90, 0);
    });

    it('should clamp availability between 0 and 100', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // Extremely high downtime (more than period) - should clamp to 0
      const mockRecords = [
        createMockMaintenanceRecord({ 
          id: 'r1', 
          machine_id: 'machine-1', 
          downtime_minutes: 200000 // Way more than 90 days
        }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.availability).toBe(0); // Clamped to 0
    });
  });

  describe('Reliability Score', () => {
    it('should calculate excellent reliability score', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // High MTBF (>500h), low MTTR (<60min) = excellent
      // 1 failure in 90 days (2160h), 30 min downtime
      // MTBF = (2160 - 0.5) / 1 = 2159.5 hours
      // MTTR = 30 minutes
      const mockRecords = [
        createMockMaintenanceRecord({ id: 'r1', machine_id: 'machine-1', downtime_minutes: 30 }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.reliabilityScore).toBe('excellent');
    });

    it('should calculate critical reliability score', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      // Low MTBF (<50h), high MTTR (>180min) = critical
      // 50 failures in 90 days, each 200 min downtime
      const mockRecords = Array.from({ length: 50 }, (_, i) => 
        createMockMaintenanceRecord({ 
          id: `r${i}`, 
          machine_id: 'machine-1', 
          downtime_minutes: 200 
        })
      );

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.reliabilityScore).toBe('critical');
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate summary statistics correctly', async () => {
      const mockMachines = [
        createMockMachine({ id: 'machine-1', name: 'Laser 01' }),
        createMockMachine({ id: 'machine-2', name: 'Laser 02', code: 'LSR-02' }),
      ];

      const mockRecords = [
        createMockMaintenanceRecord({ id: 'r1', machine_id: 'machine-1', downtime_minutes: 60 }),
        createMockMaintenanceRecord({ id: 'r2', machine_id: 'machine-1', downtime_minutes: 60 }),
        createMockMaintenanceRecord({ id: 'r3', machine_id: 'machine-2', downtime_minutes: 120 }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.summary.totalFailures).toBe(3);
      expect(result.current.summary.machinesWithData).toBe(2);
      expect(result.current.summary.averageMTBF).not.toBeNull();
      expect(result.current.summary.averageMTTR).not.toBeNull();
      expect(result.current.summary.averageAvailability).toBeGreaterThan(0);
    });

    it('should identify critical machines in summary', async () => {
      const mockMachines = [
        createMockMachine({ id: 'machine-1', name: 'Good Machine' }),
        createMockMachine({ id: 'machine-2', name: 'Bad Machine', code: 'BAD-01' }),
      ];

      // machine-2 has many failures = critical
      const mockRecords = [
        createMockMaintenanceRecord({ id: 'r1', machine_id: 'machine-1', downtime_minutes: 30 }),
        ...Array.from({ length: 50 }, (_, i) => 
          createMockMaintenanceRecord({ 
            id: `r-bad-${i}`, 
            machine_id: 'machine-2', 
            downtime_minutes: 200 
          })
        ),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.summary.criticalMachines.length).toBeGreaterThan(0);
      expect(result.current.summary.criticalMachines.some(m => m.machineName === 'Bad Machine')).toBe(true);
    });

    it('should handle no data in summary', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.summary.averageMTBF).toBeNull();
      expect(result.current.summary.averageMTTR).toBeNull();
      expect(result.current.summary.averageAvailability).toBe(100); // Default when no data
      expect(result.current.summary.totalFailures).toBe(0);
      expect(result.current.summary.machinesWithData).toBe(0);
      expect(result.current.summary.criticalMachines).toEqual([]);
    });
  });

  describe('Period Days Parameter', () => {
    it('should use default period of 90 days', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Default period is 90 days
      expect(mockSupabaseQuery).toHaveBeenCalled();
    });

    it('should accept custom period', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMTBFMTTR(30), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabaseQuery).toHaveBeenCalled();
    });
  });

  describe('Last Failure Tracking', () => {
    it('should track most recent failure', async () => {
      const mockMachines = [createMockMachine({ id: 'machine-1' })];
      
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const mockRecords = [
        createMockMaintenanceRecord({ 
          id: 'r1', 
          machine_id: 'machine-1', 
          started_at: lastWeek.toISOString(),
          downtime_minutes: 60 
        }),
        createMockMaintenanceRecord({ 
          id: 'r2', 
          machine_id: 'machine-1', 
          started_at: yesterday.toISOString(),
          downtime_minutes: 60 
        }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'maintenance_records') {
          return Promise.resolve({ data: mockRecords, error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMTBFMTTR(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metrics.length).toBe(1);
      });

      const metric = result.current.metrics[0];
      expect(metric.lastFailure).toBe(yesterday.toISOString());
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to maintenance records changes', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockSupabaseChannel).toHaveBeenCalledWith('mtbf-maintenance-records-changes');
      });
    });

    it('should cleanup subscription on unmount', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { unmount } = renderHook(() => useMTBFMTTR(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockSupabaseRemoveChannel).toHaveBeenCalled();
    });
  });
});
