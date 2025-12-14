import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock useSchedulingData
vi.mock('./useSchedulingData', () => ({
  useSchedulingData: vi.fn(),
}));

import { useOEE, classifyOEE, getOEEColor } from './useOEE';
import { useSchedulingData } from './useSchedulingData';

const mockUseSchedulingData = useSchedulingData as ReturnType<typeof vi.fn>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useOEE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug Fix #5: produced_quantity null-coalescing', () => {
    it('should use produced_quantity when available', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour ago
      const endTime = now.toISOString();

      mockUseSchedulingData.mockReturnValue({
        jobs: [
          {
            id: '1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            status: 'finished',
            actual_start_time: startTime,
            actual_end_time: endTime,
            estimated_duration: 60,
            quantity: 100,
            produced_quantity: 95, // Should use this value
            lost_pieces: 5,
          },
        ],
        machines: [
          { id: 'machine-1', name: 'Machine 1', code: 'M1', technique_id: 'tech-1' },
        ],
        techniques: [
          { id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' },
        ],
        isLoading: false,
      });

      const { result } = renderHook(() => useOEE(30), { wrapper: createWrapper() });

      expect(result.current.data).not.toBeNull();
      const machineData = result.current.data?.byMachine[0];
      expect(machineData?.totalPiecesProduced).toBe(95);
      expect(machineData?.lostPieces).toBe(5);
      expect(machineData?.goodPieces).toBe(90); // 95 - 5
    });

    it('should fallback to quantity when produced_quantity is null', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();

      mockUseSchedulingData.mockReturnValue({
        jobs: [
          {
            id: '1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            status: 'finished',
            actual_start_time: startTime,
            actual_end_time: endTime,
            estimated_duration: 60,
            quantity: 100,
            produced_quantity: null, // Should fallback to quantity
            lost_pieces: 3,
          },
        ],
        machines: [
          { id: 'machine-1', name: 'Machine 1', code: 'M1', technique_id: 'tech-1' },
        ],
        techniques: [
          { id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' },
        ],
        isLoading: false,
      });

      const { result } = renderHook(() => useOEE(30), { wrapper: createWrapper() });

      const machineData = result.current.data?.byMachine[0];
      expect(machineData?.totalPiecesProduced).toBe(100); // Falls back to quantity
    });

    it('should handle both produced_quantity and quantity being null/undefined', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();

      mockUseSchedulingData.mockReturnValue({
        jobs: [
          {
            id: '1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            status: 'finished',
            actual_start_time: startTime,
            actual_end_time: endTime,
            estimated_duration: 60,
            quantity: null,
            produced_quantity: null,
            lost_pieces: null,
          },
        ],
        machines: [
          { id: 'machine-1', name: 'Machine 1', code: 'M1', technique_id: 'tech-1' },
        ],
        techniques: [
          { id: 'tech-1', name: 'Technique 1', short_name: 'T1', color: '#FF0000' },
        ],
        isLoading: false,
      });

      const { result } = renderHook(() => useOEE(30), { wrapper: createWrapper() });

      const machineData = result.current.data?.byMachine[0];
      expect(machineData?.totalPiecesProduced).toBe(0);
      expect(machineData?.lostPieces).toBe(0);
    });
  });

  describe('classifyOEE helper', () => {
    it('should classify OEE correctly', () => {
      expect(classifyOEE(90)).toBe('world-class');
      expect(classifyOEE(85)).toBe('world-class');
      expect(classifyOEE(80)).toBe('excellent');
      expect(classifyOEE(75)).toBe('excellent');
      expect(classifyOEE(70)).toBe('good');
      expect(classifyOEE(65)).toBe('good');
      expect(classifyOEE(55)).toBe('acceptable');
      expect(classifyOEE(50)).toBe('acceptable');
      expect(classifyOEE(40)).toBe('poor');
      expect(classifyOEE(0)).toBe('poor');
    });
  });

  describe('getOEEColor helper', () => {
    it('should return correct colors for OEE levels', () => {
      expect(getOEEColor(90)).toBe('hsl(var(--success))');
      expect(getOEEColor(80)).toContain('hsl');
      expect(getOEEColor(70)).toContain('hsl');
      expect(getOEEColor(55)).toContain('hsl');
      expect(getOEEColor(30)).toBe('hsl(var(--destructive))');
    });
  });
});
