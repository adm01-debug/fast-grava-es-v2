import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrphanedDataDetection } from './useOrphanedDataDetection';

// Mocks
const mockJobs = vi.fn();
const mockTechniques = vi.fn();
const mockMachines = vi.fn();

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs() }),
  useTechniques: () => ({ data: mockTechniques() }),
  useMachines: () => ({ data: mockMachines() }),
}));

// Factory functions
const createMockJob = (overrides: any = {}) => ({
  id: overrides.id || 'job-1',
  order_number: overrides.order_number || 'ORD-001',
  client: 'Cliente Teste',
  product: 'Produto Teste',
  quantity: 100,
  status: overrides.status || 'scheduled',
  priority: 'medium',
  technique_id: overrides.technique_id || 'tech-1',
  machine_id: overrides.machine_id ?? 'machine-1',
  scheduled_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const createMockTechnique = (id: string, name: string) => ({
  id,
  name,
  short_name: name.substring(0, 3).toUpperCase(),
  color: '#FF0000',
  setup_time: 15,
  is_active: true,
});

const createMockMachine = (id: string, name: string, code: string, techniqueId: string) => ({
  id,
  name,
  code,
  technique_id: techniqueId,
  is_active: true,
});

describe('useOrphanedDataDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobs.mockReturnValue([]);
    mockTechniques.mockReturnValue([]);
    mockMachines.mockReturnValue([]);
  });

  describe('Loading State', () => {
    it('should return loading state when jobs is null', () => {
      mockJobs.mockReturnValue(null);
      mockTechniques.mockReturnValue([]);
      mockMachines.mockReturnValue([]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.orphanedTechniques).toEqual([]);
      expect(result.current.issues).toEqual([]);
    });

    it('should return loading state when techniques is null', () => {
      mockJobs.mockReturnValue([]);
      mockTechniques.mockReturnValue(null);
      mockMachines.mockReturnValue([]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return loading state when machines is null', () => {
      mockJobs.mockReturnValue([]);
      mockTechniques.mockReturnValue([]);
      mockMachines.mockReturnValue(null);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('No Issues', () => {
    it('should return no issues when data is valid', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Laser'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1'),
      ]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-1',
          machine_id: 'machine-1',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.orphanedTechniques).toEqual([]);
      expect(result.current.issues).toEqual([]);
      expect(result.current.errorCount).toBe(0);
      expect(result.current.warningCount).toBe(0);
    });

    it('should return no issues when no data exists', () => {
      mockJobs.mockReturnValue([]);
      mockTechniques.mockReturnValue([]);
      mockMachines.mockReturnValue([]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.issues).toEqual([]);
    });

    it('should not flag finished jobs without machine', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Laser'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1'),
      ]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-1',
          machine_id: null,
          status: 'finished',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      // No production_without_machine warning for finished jobs
      const productionIssues = result.current.issues.filter(
        i => i.type === 'production_without_machine'
      );
      expect(productionIssues.length).toBe(0);
    });
  });

  describe('Orphaned Techniques', () => {
    it('should detect technique with jobs but no machines', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-orphan', 'Técnica Órfã'),
      ]);
      mockMachines.mockReturnValue([]); // No machines for this technique
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-orphan',
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques.length).toBe(1);
      expect(result.current.orphanedTechniques[0].technique.name).toBe('Técnica Órfã');
      expect(result.current.orphanedTechniques[0].jobCount).toBe(1);
    });

    it('should count active and total jobs correctly', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-orphan', 'Técnica Órfã'),
      ]);
      mockMachines.mockReturnValue([]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', technique_id: 'tech-orphan', status: 'scheduled' }),
        createMockJob({ id: 'job-2', technique_id: 'tech-orphan', status: 'production' }),
        createMockJob({ id: 'job-3', technique_id: 'tech-orphan', status: 'finished' }),
        createMockJob({ id: 'job-4', technique_id: 'tech-orphan', status: 'cancelled' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques[0].jobCount).toBe(4);
      expect(result.current.orphanedTechniques[0].activeJobCount).toBe(2); // scheduled + production
    });

    it('should create error issue for orphaned technique with active jobs', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-orphan', 'Laser Órfão'),
      ]);
      mockMachines.mockReturnValue([]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-orphan',
          status: 'production',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.issues.length).toBe(1);
      expect(result.current.issues[0].type).toBe('orphaned_technique');
      expect(result.current.issues[0].severity).toBe('error');
      expect(result.current.issues[0].message).toContain('Laser Órfão');
      expect(result.current.issues[0].affectedIds).toContain('job-1');
      expect(result.current.errorCount).toBe(1);
    });

    it('should not create error issue if only finished/cancelled jobs', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-orphan', 'Técnica Órfã'),
      ]);
      mockMachines.mockReturnValue([]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', technique_id: 'tech-orphan', status: 'finished' }),
        createMockJob({ id: 'job-2', technique_id: 'tech-orphan', status: 'cancelled' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      // Should detect as orphaned but no error issue (no active jobs)
      expect(result.current.orphanedTechniques.length).toBe(1);
      const errorIssues = result.current.issues.filter(i => i.severity === 'error');
      expect(errorIssues.length).toBe(0);
    });

    it('should include technique name in issue message', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Serigrafia Especial'),
      ]);
      mockMachines.mockReturnValue([]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', technique_id: 'tech-1', status: 'scheduled' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques[0].issue).toContain('Serigrafia Especial');
    });
  });

  describe('Production Without Machine', () => {
    it('should detect jobs in production without machine', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Laser'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1'),
      ]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-1',
          machine_id: null,
          status: 'production',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      const productionIssues = result.current.issues.filter(
        i => i.type === 'production_without_machine'
      );
      expect(productionIssues.length).toBe(1);
      expect(productionIssues[0].severity).toBe('warning');
      expect(productionIssues[0].affectedIds).toContain('job-1');
      expect(result.current.warningCount).toBe(1);
    });

    it('should count multiple jobs in production without machine', () => {
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser')]);
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1')]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', technique_id: 'tech-1', machine_id: null, status: 'production' }),
        createMockJob({ id: 'job-2', technique_id: 'tech-1', machine_id: null, status: 'production' }),
        createMockJob({ id: 'job-3', technique_id: 'tech-1', machine_id: 'machine-1', status: 'production' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      const productionIssues = result.current.issues.filter(
        i => i.type === 'production_without_machine'
      );
      expect(productionIssues[0].affectedIds.length).toBe(2);
      expect(productionIssues[0].message).toContain('2 job(s)');
    });

    it('should not flag scheduled jobs without machine', () => {
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser')]);
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1')]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-1',
          machine_id: null,
          status: 'scheduled',
        }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      const productionIssues = result.current.issues.filter(
        i => i.type === 'production_without_machine'
      );
      expect(productionIssues.length).toBe(0);
    });
  });

  describe('Multiple Issues', () => {
    it('should detect multiple issue types simultaneously', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-orphan', 'Órfã'),
        createMockTechnique('tech-ok', 'OK'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Machine OK', 'M-OK', 'tech-ok'),
      ]);
      mockJobs.mockReturnValue([
        // Orphaned technique with active job
        createMockJob({ id: 'job-1', technique_id: 'tech-orphan', status: 'scheduled' }),
        // Production without machine
        createMockJob({ id: 'job-2', technique_id: 'tech-ok', machine_id: null, status: 'production' }),
        // Normal job
        createMockJob({ id: 'job-3', technique_id: 'tech-ok', machine_id: 'machine-1', status: 'scheduled' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques.length).toBe(1);
      expect(result.current.issues.length).toBe(2);
      expect(result.current.errorCount).toBe(1);
      expect(result.current.warningCount).toBe(1);
    });

    it('should correctly sum error and warning counts', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Órfã 1'),
        createMockTechnique('tech-2', 'Órfã 2'),
        createMockTechnique('tech-3', 'OK'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'M1', 'M1', 'tech-3'),
      ]);
      mockJobs.mockReturnValue([
        // Two orphaned techniques with active jobs = 2 errors
        createMockJob({ id: 'job-1', technique_id: 'tech-1', status: 'production' }),
        createMockJob({ id: 'job-2', technique_id: 'tech-2', status: 'scheduled' }),
        // Production without machine = 1 warning
        createMockJob({ id: 'job-3', technique_id: 'tech-3', machine_id: null, status: 'production' }),
      ]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.errorCount).toBe(2);
      expect(result.current.warningCount).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle technique with machines but no jobs', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Laser'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1'),
      ]);
      mockJobs.mockReturnValue([]);

      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques).toEqual([]);
      expect(result.current.issues).toEqual([]);
    });

    it('should handle job with non-existent technique', () => {
      mockTechniques.mockReturnValue([
        createMockTechnique('tech-1', 'Laser'),
      ]);
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01', 'tech-1'),
      ]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          technique_id: 'tech-nonexistent',
          status: 'production',
        }),
      ]);

      // Should not crash
      const { result } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.orphanedTechniques).toBeDefined();
    });
  });

  describe('Reactivity', () => {
    it('should update when data changes', () => {
      mockTechniques.mockReturnValue([]);
      mockMachines.mockReturnValue([]);
      mockJobs.mockReturnValue([]);

      const { result, rerender } = renderHook(() => useOrphanedDataDetection());

      expect(result.current.issues.length).toBe(0);

      // Add orphaned technique
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'New')]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', technique_id: 'tech-1', status: 'production' }),
      ]);

      rerender();

      expect(result.current.orphanedTechniques.length).toBe(1);
    });
  });
});
