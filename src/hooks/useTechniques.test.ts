import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTechniques } from './useTechniques';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 't1', name: 'Gravação Laser', category: 'laser', difficulty: 'medium', time_per_unit: 5, cost_factor: 1.2 },
          { id: 't2', name: 'Corte CNC', category: 'cnc', difficulty: 'high', time_per_unit: 10, cost_factor: 1.5 },
          { id: 't3', name: 'Serigrafia', category: 'print', difficulty: 'low', time_per_unit: 2, cost_factor: 0.8 },
        ],
        error: null,
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new' }, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: {}, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useTechniques', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch techniques successfully', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.techniques).toBeDefined();
      expect(result.current.techniques.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should get technique by ID', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const technique = result.current.getTechniqueById('t1');
      expect(technique?.name).toBe('Gravação Laser');
    });
  });

  describe('Filtering', () => {
    it('should filter by category', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const laserTechniques = result.current.filterByCategory('laser');
      expect(laserTechniques.every(t => t.category === 'laser')).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const easyTechniques = result.current.filterByDifficulty('low');
      expect(easyTechniques.every(t => t.difficulty === 'low')).toBe(true);
    });

    it('should search by name', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const results = result.current.searchByName('Laser');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Calculations', () => {
    it('should calculate estimated time', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const time = result.current.calculateEstimatedTime('t1', 100);
      expect(time).toBe(500);
    });

    it('should calculate cost factor', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const cost = result.current.getCostFactor('t1');
      expect(cost).toBe(1.2);
    });
  });

  describe('Statistics', () => {
    it('should return categories list', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.categories).toContain('laser');
      expect(result.current.categories).toContain('cnc');
    });

    it('should count techniques by category', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.stats.byCategory).toBeDefined();
    });
  });

  describe('CRUD', () => {
    it('should have create function', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.createTechnique).toBe('function');
    });

    it('should have update function', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.updateTechnique).toBe('function');
    });

    it('should have delete function', async () => {
      const { result } = renderHook(() => useTechniques(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.deleteTechnique).toBe('function');
    });
  });
});
