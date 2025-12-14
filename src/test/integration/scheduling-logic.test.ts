import { describe, it, expect } from 'vitest';

// Scheduling logic validation tests
describe('Scheduling Logic Tests', () => {
  describe('Time Slot Validation', () => {
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const isValidTimeSlot = (start: string, end: string): boolean => {
      const startMinutes = parseTime(start);
      const endMinutes = parseTime(end);
      return endMinutes > startMinutes;
    };

    it('should validate that end time is after start time', () => {
      expect(isValidTimeSlot('08:00', '10:00')).toBe(true);
      expect(isValidTimeSlot('10:00', '08:00')).toBe(false);
      expect(isValidTimeSlot('08:00', '08:00')).toBe(false);
    });

    it('should detect time slot overlaps', () => {
      const checkOverlap = (
        slot1Start: string, slot1End: string,
        slot2Start: string, slot2End: string
      ): boolean => {
        const s1Start = parseTime(slot1Start);
        const s1End = parseTime(slot1End);
        const s2Start = parseTime(slot2Start);
        const s2End = parseTime(slot2End);

        return s1Start < s2End && s1End > s2Start;
      };

      expect(checkOverlap('08:00', '10:00', '09:00', '11:00')).toBe(true); // Overlapping
      expect(checkOverlap('08:00', '10:00', '10:00', '12:00')).toBe(false); // Adjacent
      expect(checkOverlap('08:00', '10:00', '12:00', '14:00')).toBe(false); // No overlap
      expect(checkOverlap('09:00', '11:00', '08:00', '10:00')).toBe(true); // Overlapping reverse
    });
  });

  describe('Operating Hours Validation', () => {
    const OPERATING_START = '07:00';
    const OPERATING_END = '18:00';
    const EXTENDED_END = '20:00';

    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const isWithinOperatingHours = (start: string, end: string, extended = false): boolean => {
      const startMinutes = parseTime(start);
      const endMinutes = parseTime(end);
      const opStart = parseTime(OPERATING_START);
      const opEnd = parseTime(extended ? EXTENDED_END : OPERATING_END);

      return startMinutes >= opStart && endMinutes <= opEnd;
    };

    it('should validate jobs within normal operating hours', () => {
      expect(isWithinOperatingHours('08:00', '17:00')).toBe(true);
      expect(isWithinOperatingHours('07:00', '18:00')).toBe(true);
      expect(isWithinOperatingHours('06:00', '10:00')).toBe(false); // Starts too early
      expect(isWithinOperatingHours('16:00', '19:00')).toBe(false); // Ends too late
    });

    it('should validate jobs within extended hours', () => {
      expect(isWithinOperatingHours('08:00', '19:00', true)).toBe(true);
      expect(isWithinOperatingHours('07:00', '20:00', true)).toBe(true);
      expect(isWithinOperatingHours('18:00', '21:00', true)).toBe(false); // Past extended hours
    });
  });

  describe('Priority Calculation', () => {
    type Priority = 'low' | 'medium' | 'high' | 'urgent';
    
    const priorityOrder: Record<Priority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const sortByPriority = (jobs: { priority: Priority }[]): { priority: Priority }[] => {
      return [...jobs].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    };

    it('should sort jobs by priority correctly', () => {
      const jobs = [
        { priority: 'low' as Priority },
        { priority: 'urgent' as Priority },
        { priority: 'medium' as Priority },
        { priority: 'high' as Priority },
      ];

      const sorted = sortByPriority(jobs);
      
      expect(sorted[0].priority).toBe('urgent');
      expect(sorted[1].priority).toBe('high');
      expect(sorted[2].priority).toBe('medium');
      expect(sorted[3].priority).toBe('low');
    });
  });

  describe('Buffer Status Validation', () => {
    const REQUIRED_BUFFER = 3;

    const checkBufferStatus = (readyJobsCount: number): 'healthy' | 'warning' | 'critical' => {
      if (readyJobsCount >= REQUIRED_BUFFER) return 'healthy';
      if (readyJobsCount >= 1) return 'warning';
      return 'critical';
    };

    it('should return healthy status when buffer is full', () => {
      expect(checkBufferStatus(3)).toBe('healthy');
      expect(checkBufferStatus(5)).toBe('healthy');
    });

    it('should return warning status when buffer is low', () => {
      expect(checkBufferStatus(1)).toBe('warning');
      expect(checkBufferStatus(2)).toBe('warning');
    });

    it('should return critical status when buffer is empty', () => {
      expect(checkBufferStatus(0)).toBe('critical');
    });
  });

  describe('Duration Calculation', () => {
    const calculateDuration = (
      quantity: number,
      piecesPerMinute: number,
      setupTime: number
    ): number => {
      const productionTime = Math.ceil(quantity / piecesPerMinute);
      return productionTime + setupTime;
    };

    it('should calculate job duration correctly', () => {
      // 100 pieces at 10 pieces/min + 15 min setup = 25 min
      expect(calculateDuration(100, 10, 15)).toBe(25);
      
      // 500 pieces at 50 pieces/min + 20 min setup = 30 min
      expect(calculateDuration(500, 50, 20)).toBe(30);
    });

    it('should round up production time', () => {
      // 105 pieces at 10 pieces/min = 11 min (rounded up) + 5 min setup = 16 min
      expect(calculateDuration(105, 10, 5)).toBe(16);
    });
  });

  describe('Status Transition Validation', () => {
    type JobStatus = 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled';
    
    const validTransitions: Record<JobStatus, JobStatus[]> = {
      queue: ['ready', 'cancelled'],
      ready: ['scheduled', 'cancelled'],
      scheduled: ['production', 'paused', 'cancelled'],
      production: ['finished', 'paused'],
      paused: ['production', 'cancelled'],
      finished: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const isValidTransition = (from: JobStatus, to: JobStatus): boolean => {
      return validTransitions[from]?.includes(to) ?? false;
    };

    it('should validate allowed status transitions', () => {
      expect(isValidTransition('queue', 'ready')).toBe(true);
      expect(isValidTransition('ready', 'scheduled')).toBe(true);
      expect(isValidTransition('scheduled', 'production')).toBe(true);
      expect(isValidTransition('production', 'finished')).toBe(true);
    });

    it('should reject invalid status transitions', () => {
      expect(isValidTransition('queue', 'production')).toBe(false); // Skip steps
      expect(isValidTransition('finished', 'queue')).toBe(false); // From terminal
      expect(isValidTransition('cancelled', 'production')).toBe(false); // From terminal
    });

    it('should allow cancellation from most states', () => {
      expect(isValidTransition('queue', 'cancelled')).toBe(true);
      expect(isValidTransition('ready', 'cancelled')).toBe(true);
      expect(isValidTransition('scheduled', 'cancelled')).toBe(true);
      expect(isValidTransition('paused', 'cancelled')).toBe(true);
    });
  });
});
