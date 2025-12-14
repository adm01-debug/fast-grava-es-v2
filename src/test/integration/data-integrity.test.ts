import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client for integration tests
const mockData = {
  techniques: [
    { id: 'fiber-laser', name: 'Fiber Laser', short_name: 'FL', color: '#22c55e', setup_time: 5 },
    { id: 'silk-textile', name: 'Silk Têxtil', short_name: 'ST', color: '#f97316', setup_time: 20 },
  ],
  machines: [
    { id: 'machine-1', code: 'FL-01', name: 'Fiber Laser 01', technique_id: 'fiber-laser', is_active: true },
    { id: 'machine-2', code: 'ST-01', name: 'Silk Têxtil 01', technique_id: 'silk-textile', is_active: true },
  ],
  jobs: [
    { id: 'job-1', order_number: 'OS-001', technique_id: 'fiber-laser', machine_id: 'machine-1', status: 'scheduled' },
    { id: 'job-2', order_number: 'OS-002', technique_id: 'silk-textile', machine_id: 'machine-2', status: 'production' },
  ],
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        const data = mockData[table as keyof typeof mockData] || [];
        return Promise.resolve({ data, error: null });
      }),
    })),
  },
}));

describe('Data Integrity Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Referential Integrity', () => {
    it('should ensure all jobs reference valid techniques', () => {
      const techniqueIds = new Set(mockData.techniques.map(t => t.id));
      
      mockData.jobs.forEach(job => {
        expect(techniqueIds.has(job.technique_id)).toBe(true);
      });
    });

    it('should ensure all jobs reference valid machines', () => {
      const machineIds = new Set(mockData.machines.map(m => m.id));
      
      mockData.jobs.forEach(job => {
        if (job.machine_id) {
          expect(machineIds.has(job.machine_id)).toBe(true);
        }
      });
    });

    it('should ensure all machines reference valid techniques', () => {
      const techniqueIds = new Set(mockData.techniques.map(t => t.id));
      
      mockData.machines.forEach(machine => {
        expect(techniqueIds.has(machine.technique_id)).toBe(true);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should ensure technique IDs are unique', () => {
      const ids = mockData.techniques.map(t => t.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should ensure machine codes are unique', () => {
      const codes = mockData.machines.map(m => m.code);
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should ensure order numbers are unique', () => {
      const orderNumbers = mockData.jobs.map(j => j.order_number);
      const uniqueOrderNumbers = new Set(orderNumbers);
      
      expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);
    });
  });

  describe('Required Fields', () => {
    it('should ensure all techniques have required fields', () => {
      mockData.techniques.forEach(technique => {
        expect(technique.id).toBeDefined();
        expect(technique.name).toBeDefined();
        expect(technique.short_name).toBeDefined();
        expect(technique.color).toBeDefined();
        expect(typeof technique.setup_time).toBe('number');
      });
    });

    it('should ensure all machines have required fields', () => {
      mockData.machines.forEach(machine => {
        expect(machine.id).toBeDefined();
        expect(machine.code).toBeDefined();
        expect(machine.name).toBeDefined();
        expect(machine.technique_id).toBeDefined();
        expect(typeof machine.is_active).toBe('boolean');
      });
    });

    it('should ensure all jobs have required fields', () => {
      mockData.jobs.forEach(job => {
        expect(job.id).toBeDefined();
        expect(job.order_number).toBeDefined();
        expect(job.technique_id).toBeDefined();
        expect(job.status).toBeDefined();
      });
    });
  });

  describe('Valid Status Values', () => {
    const validStatuses = ['queue', 'ready', 'scheduled', 'production', 'finished', 'paused', 'cancelled', 'delayed', 'rework'];

    it('should ensure all jobs have valid status values', () => {
      mockData.jobs.forEach(job => {
        expect(validStatuses).toContain(job.status);
      });
    });
  });

  describe('Color Format Validation', () => {
    it('should ensure technique colors are valid hex colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      mockData.techniques.forEach(technique => {
        expect(technique.color).toMatch(hexColorRegex);
      });
    });
  });
});
