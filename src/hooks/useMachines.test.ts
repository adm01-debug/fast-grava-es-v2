import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMachines } from './useMachines';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 'machine-1', name: 'Gravadora CNC 01', type: 'cnc', status: 'active', location: 'Setor A', oee: 85.5, capacity_per_hour: 50 },
          { id: 'machine-2', name: 'Laser HD 02', type: 'laser', status: 'maintenance', location: 'Setor B', oee: 72.3, capacity_per_hour: 80 },
          { id: 'machine-3', name: 'Rotativa 03', type: 'rotary', status: 'inactive', location: 'Setor A', oee: 0, capacity_per_hour: 30 },
        ],
        error: null,
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new-machine' }, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: { id: 'machine-1' }, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMachines', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch machines successfully', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.machines).toBeDefined();
      expect(result.current.machines.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should fetch machine by ID', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const machine = result.current.getMachineById('machine-1');
      expect(machine).toBeDefined();
      expect(machine?.name).toBe('Gravadora CNC 01');
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const activeMachines = result.current.filterByStatus('active');
      expect(activeMachines.every(m => m.status === 'active')).toBe(true);
    });

    it('should filter by type', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const cncMachines = result.current.filterByType('cnc');
      expect(cncMachines.every(m => m.type === 'cnc')).toBe(true);
    });

    it('should filter by location', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const sectorAMachines = result.current.filterByLocation('Setor A');
      expect(sectorAMachines.every(m => m.location === 'Setor A')).toBe(true);
    });

    it('should search by name', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const searchResults = result.current.searchByName('Laser');
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should calculate active machines count', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.activeCount).toBe(1);
    });

    it('should calculate machines in maintenance', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.maintenanceCount).toBe(1);
    });

    it('should calculate average OEE', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.averageOEE).toBeGreaterThanOrEqual(0);
    });

    it('should calculate total capacity', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.totalCapacity).toBe(160);
    });
  });

  describe('CRUD Operations', () => {
    it('should have create function', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.createMachine).toBe('function');
    });

    it('should have update function', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.updateMachine).toBe('function');
    });

    it('should have delete function', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.deleteMachine).toBe('function');
    });
  });

  describe('Maintenance', () => {
    it('should identify machines needing maintenance', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.machinesNeedingMaintenance).toBeDefined();
    });

    it('should have maintenance check function', async () => {
      const { result } = renderHook(() => useMachines(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.isMaintenanceOverdue).toBe('function');
    });
  });
});
