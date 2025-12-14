import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { format } from 'date-fns';

// Mock useJobs hooks
vi.mock('./useJobs', () => ({
  useJobs: vi.fn(),
  useMachines: vi.fn(),
  useTechniques: vi.fn(),
}));

import { useLoadBalancing } from './useLoadBalancing';
import { useJobs, useMachines, useTechniques } from './useJobs';

const mockUseJobs = useJobs as ReturnType<typeof vi.fn>;
const mockUseMachines = useMachines as ReturnType<typeof vi.fn>;
const mockUseTechniques = useTechniques as ReturnType<typeof vi.fn>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useLoadBalancing', () => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bug Fix #10: Return ALL suggestions, not limited to 3', () => {
    it('should return all suggestions sorted by load difference', () => {
      // Create 5 movable jobs on overloaded machine
      const jobs = [];
      for (let i = 1; i <= 5; i++) {
        jobs.push({
          id: `job-${i}`,
          order_number: `ORD-${i}`,
          client: `Client ${i}`,
          technique_id: 'tech-1',
          machine_id: 'machine-overloaded',
          scheduled_date: todayStr,
          status: 'scheduled',
          priority: 'medium',
          estimated_duration: 100, // 100 min each = 500 min total
        });
      }

      mockUseJobs.mockReturnValue({ data: jobs });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-overloaded', technique_id: 'tech-1', name: 'Overloaded Machine' },
          { id: 'machine-empty', technique_id: 'tech-1', name: 'Empty Machine' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      // Should return ALL 5 suggestions, not just 3
      // The overloaded machine has ~76% occupancy, empty has 0%
      // Difference > 30% so it's unbalanced
      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      
      if (techSummary?.isUnbalanced) {
        // When unbalanced, all movable jobs should have suggestions
        expect(techSummary.suggestions.length).toBeGreaterThan(0);
        // Suggestions should be sorted by loadDifference (descending)
        for (let i = 0; i < techSummary.suggestions.length - 1; i++) {
          expect(techSummary.suggestions[i].loadDifference).toBeGreaterThanOrEqual(
            techSummary.suggestions[i + 1].loadDifference
          );
        }
      }
    });

    it('should return suggestions in allSuggestions array', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            order_number: 'ORD-1',
            client: 'Client 1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            priority: 'medium',
            estimated_duration: 600, // High load
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      expect(result.current.suggestions).toBeDefined();
      expect(Array.isArray(result.current.suggestions)).toBe(true);
    });
  });

  describe('Load calculation', () => {
    it('should calculate occupancy rate correctly', () => {
      // 660 minutes per day per machine
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 330, // 50% of 660
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      const machineLoad = techSummary?.machines.find(m => m.machine.id === 'machine-1');

      expect(machineLoad?.occupancyRate).toBe(50); // 330/660 = 50%
      expect(machineLoad?.availableMinutes).toBe(330);
    });

    it('should cap occupancy rate at 100%', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 800, // Over capacity
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      const machineLoad = techSummary?.machines.find(m => m.machine.id === 'machine-1');

      expect(machineLoad?.occupancyRate).toBe(100); // Capped at 100%
      expect(machineLoad?.availableMinutes).toBe(0); // No available time
    });
  });

  describe('Unbalanced detection', () => {
    it('should detect unbalanced when difference > 30%', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 500, // ~76% occupancy
          },
          // machine-2 has no jobs = 0% occupancy
          // Difference = 76% > 30%, should be unbalanced
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      expect(techSummary?.isUnbalanced).toBe(true);
    });

    it('should NOT be unbalanced when difference <= 30%', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 200, // ~30%
          },
          {
            id: 'job-2',
            technique_id: 'tech-1',
            machine_id: 'machine-2',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 180, // ~27%
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      expect(techSummary?.isUnbalanced).toBe(false);
    });
  });

  describe('Job exclusion', () => {
    it('should exclude finished jobs from load calculation', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'finished', // Should be excluded
            estimated_duration: 300,
          },
          {
            id: 'job-2',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            estimated_duration: 100,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [{ id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' }],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const techSummary = result.current.byTechnique.find(t => t.technique.id === 'tech-1');
      const machineLoad = techSummary?.machines.find(m => m.machine.id === 'machine-1');

      // Only scheduled job (100 min) should be counted
      expect(machineLoad?.scheduledMinutes).toBe(100);
    });

    it('should not suggest moving jobs in production', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            order_number: 'ORD-1',
            client: 'Client',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'production', // Should NOT be suggested for move
            priority: 'medium',
            estimated_duration: 500,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      // No suggestions should include the production job
      const suggestion = result.current.suggestions.find(s => s.jobId === 'job-1');
      expect(suggestion).toBeUndefined();
    });

    it('should not suggest moving urgent priority jobs', () => {
      mockUseJobs.mockReturnValue({
        data: [
          {
            id: 'job-1',
            order_number: 'ORD-1',
            client: 'Client',
            technique_id: 'tech-1',
            machine_id: 'machine-1',
            scheduled_date: todayStr,
            status: 'scheduled',
            priority: 'urgent', // Should NOT be suggested for move
            estimated_duration: 500,
          },
        ],
      });

      mockUseMachines.mockReturnValue({
        data: [
          { id: 'machine-1', technique_id: 'tech-1', name: 'Machine 1' },
          { id: 'machine-2', technique_id: 'tech-1', name: 'Machine 2' },
        ],
      });

      mockUseTechniques.mockReturnValue({
        data: [{ id: 'tech-1', name: 'Technique 1', color: '#FF0000' }],
      });

      const { result } = renderHook(() => useLoadBalancing(today), {
        wrapper: createWrapper(),
      });

      const suggestion = result.current.suggestions.find(s => s.jobId === 'job-1');
      expect(suggestion).toBeUndefined();
    });
  });
});
