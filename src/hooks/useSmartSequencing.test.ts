import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSmartSequencing } from './useSmartSequencing';

// Mock data
const mockJobs = vi.fn();
const mockMachines = vi.fn();
const mockTechniques = vi.fn();

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs() }),
  useMachines: () => ({ data: mockMachines() }),
  useTechniques: () => ({ data: mockTechniques() }),
}));

// Factory functions
const createMockJob = (overrides: any = {}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    id: overrides.id || 'job-1',
    order_number: overrides.order_number || 'ORD-001',
    client: 'Cliente Teste',
    product: 'Produto Teste',
    quantity: 100,
    status: overrides.status || 'scheduled',
    priority: overrides.priority || 'medium',
    technique_id: overrides.technique_id || 'tech-1',
    machine_id: overrides.machine_id || 'machine-1',
    scheduled_date: overrides.scheduled_date || today.toISOString().split('T')[0],
    start_time: overrides.start_time || '08:00',
    end_time: overrides.end_time || '10:00',
    estimated_duration: overrides.estimated_duration ?? 60,
    gravure_color: overrides.gravure_color || 'Preto',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

const createMockMachine = (id: string, name: string, code: string, techniqueId = 'tech-1') => ({
  id,
  name,
  code,
  technique_id: techniqueId,
  is_active: true,
});

const createMockTechnique = (id: string, name: string, setupTime = 15) => ({
  id,
  name,
  short_name: name.substring(0, 3).toUpperCase(),
  color: '#FF0000',
  setup_time: setupTime,
  is_active: true,
});

describe('useSmartSequencing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJobs.mockReturnValue([]);
    mockMachines.mockReturnValue([]);
    mockTechniques.mockReturnValue([]);
  });

  describe('No Data', () => {
    it('should return empty suggestions when no jobs', () => {
      mockJobs.mockReturnValue([]);
      mockMachines.mockReturnValue([createMockMachine('m1', 'Machine 1', 'M1')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser')]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.hasSuggestions).toBe(false);
      expect(result.current.totalSavings).toBe(0);
    });

    it('should return empty when data is null', () => {
      mockJobs.mockReturnValue(null);
      mockMachines.mockReturnValue(null);
      mockTechniques.mockReturnValue(null);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('No Optimization Needed', () => {
    it('should not suggest when only one job on machine', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          gravure_color: 'Preto',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should not suggest when all jobs have same color', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '08:00',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '09:00',
          gravure_color: 'Preto',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(false);
    });
  });

  describe('Optimization Detection', () => {
    it('should suggest optimization when colors are interleaved', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '08:00',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '09:00',
          gravure_color: 'Azul',
        }),
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '10:00',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-4',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '11:00',
          gravure_color: 'Azul',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(true);
      expect(result.current.suggestions.length).toBe(1);
      expect(result.current.suggestions[0].estimatedSavings).toBeGreaterThan(0);
    });

    it('should calculate correct savings', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '08:00',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '09:00',
          gravure_color: 'Azul',
        }),
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '10:00',
          gravure_color: 'Preto',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.suggestions[0].estimatedSavings).toBe(15);
    });

    it('should include color groups in suggestion', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '08:00',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '09:00',
          gravure_color: 'Azul',
        }),
        createMockJob({
          id: 'job-3',
          machine_id: 'machine-1',
          scheduled_date: today,
          start_time: '10:00',
          gravure_color: 'Preto',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      const colorGroups = result.current.suggestions[0].colorGroups;
      expect(colorGroups.length).toBe(2);
      expect(colorGroups.find(g => g.color === 'preto')?.jobCount).toBe(2);
      expect(colorGroups.find(g => g.color === 'azul')?.jobCount).toBe(1);
    });
  });

  describe('Job Filtering', () => {
    it('should only consider scheduled, ready, and queue jobs', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          status: 'finished',
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          status: 'scheduled',
          gravure_color: 'Azul',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should ignore jobs without machine assignment', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: null,
          scheduled_date: today,
          gravure_color: 'Preto',
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          gravure_color: 'Azul',
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(false);
    });
  });

  describe('Multiple Machines', () => {
    it('should generate suggestions for multiple machines', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
        createMockMachine('machine-2', 'Laser 02', 'LSR-02'),
      ]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', machine_id: 'machine-1', scheduled_date: today, start_time: '08:00', gravure_color: 'Preto' }),
        createMockJob({ id: 'job-2', machine_id: 'machine-1', scheduled_date: today, start_time: '09:00', gravure_color: 'Azul' }),
        createMockJob({ id: 'job-3', machine_id: 'machine-1', scheduled_date: today, start_time: '10:00', gravure_color: 'Preto' }),
        createMockJob({ id: 'job-4', machine_id: 'machine-2', scheduled_date: today, start_time: '08:00', gravure_color: 'Vermelho' }),
        createMockJob({ id: 'job-5', machine_id: 'machine-2', scheduled_date: today, start_time: '09:00', gravure_color: 'Verde' }),
        createMockJob({ id: 'job-6', machine_id: 'machine-2', scheduled_date: today, start_time: '10:00', gravure_color: 'Vermelho' }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.suggestions.length).toBe(2);
    });

    it('should calculate total savings across all machines', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([
        createMockMachine('machine-1', 'Laser 01', 'LSR-01'),
        createMockMachine('machine-2', 'Laser 02', 'LSR-02'),
      ]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({ id: 'job-1', machine_id: 'machine-1', scheduled_date: today, start_time: '08:00', gravure_color: 'Preto' }),
        createMockJob({ id: 'job-2', machine_id: 'machine-1', scheduled_date: today, start_time: '09:00', gravure_color: 'Azul' }),
        createMockJob({ id: 'job-3', machine_id: 'machine-1', scheduled_date: today, start_time: '10:00', gravure_color: 'Preto' }),
        createMockJob({ id: 'job-4', machine_id: 'machine-2', scheduled_date: today, start_time: '08:00', gravure_color: 'Verde' }),
        createMockJob({ id: 'job-5', machine_id: 'machine-2', scheduled_date: today, start_time: '09:00', gravure_color: 'Amarelo' }),
        createMockJob({ id: 'job-6', machine_id: 'machine-2', scheduled_date: today, start_time: '10:00', gravure_color: 'Verde' }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.totalSavings).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null gravure_color as sem-cor', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        createMockJob({
          id: 'job-1',
          machine_id: 'machine-1',
          scheduled_date: today,
          gravure_color: null,
        }),
        createMockJob({
          id: 'job-2',
          machine_id: 'machine-1',
          scheduled_date: today,
          gravure_color: null,
        }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.hasSuggestions).toBe(false);
    });

    it('should handle invalid job data gracefully', () => {
      const today = new Date().toISOString().split('T')[0];
      
      mockMachines.mockReturnValue([createMockMachine('machine-1', 'Laser 01', 'LSR-01')]);
      mockTechniques.mockReturnValue([createMockTechnique('tech-1', 'Laser', 15)]);
      mockJobs.mockReturnValue([
        { id: '', status: 'scheduled', estimated_duration: 60 },
        { id: 'job-2', status: 123, estimated_duration: 60 },
        createMockJob({ id: 'job-3', machine_id: 'machine-1', scheduled_date: today }),
      ]);

      const { result } = renderHook(() => useSmartSequencing());

      expect(result.current.suggestions).toBeDefined();
    });
  });
});
