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

  describe('Scheduling Conflict Detection', () => {
    interface ScheduledJob {
      id: string;
      machine_id: string;
      scheduled_date: string;
      start_time: string;
      end_time: string;
      priority: string;
    }

    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const detectTimeOverlap = (job1: ScheduledJob, job2: ScheduledJob): boolean => {
      if (job1.machine_id !== job2.machine_id) return false;
      if (job1.scheduled_date !== job2.scheduled_date) return false;
      
      const start1 = parseTime(job1.start_time);
      const end1 = parseTime(job1.end_time);
      const start2 = parseTime(job2.start_time);
      const end2 = parseTime(job2.end_time);

      return start1 < end2 && end1 > start2;
    };

    it('should detect overlapping jobs on same machine', () => {
      const job1: ScheduledJob = { id: '1', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      const job2: ScheduledJob = { id: '2', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '09:00', end_time: '11:00', priority: 'high' };
      
      expect(detectTimeOverlap(job1, job2)).toBe(true);
    });

    it('should not detect conflict for different machines', () => {
      const job1: ScheduledJob = { id: '1', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      const job2: ScheduledJob = { id: '2', machine_id: 'm2', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      
      expect(detectTimeOverlap(job1, job2)).toBe(false);
    });

    it('should not detect conflict for different dates', () => {
      const job1: ScheduledJob = { id: '1', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      const job2: ScheduledJob = { id: '2', machine_id: 'm1', scheduled_date: '2024-12-15', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      
      expect(detectTimeOverlap(job1, job2)).toBe(false);
    });

    it('should not detect conflict for adjacent slots', () => {
      const job1: ScheduledJob = { id: '1', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' };
      const job2: ScheduledJob = { id: '2', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '10:00', end_time: '12:00', priority: 'medium' };
      
      expect(detectTimeOverlap(job1, job2)).toBe(false);
    });

    it('should find all conflicts in a list of jobs', () => {
      const findAllConflicts = (jobs: ScheduledJob[]): Array<{ job1: ScheduledJob; job2: ScheduledJob }> => {
        const conflicts: Array<{ job1: ScheduledJob; job2: ScheduledJob }> = [];
        
        for (let i = 0; i < jobs.length; i++) {
          for (let j = i + 1; j < jobs.length; j++) {
            if (detectTimeOverlap(jobs[i], jobs[j])) {
              conflicts.push({ job1: jobs[i], job2: jobs[j] });
            }
          }
        }
        
        return conflicts;
      };

      const jobs: ScheduledJob[] = [
        { id: '1', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' },
        { id: '2', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '09:00', end_time: '11:00', priority: 'high' },
        { id: '3', machine_id: 'm1', scheduled_date: '2024-12-14', start_time: '14:00', end_time: '16:00', priority: 'low' },
        { id: '4', machine_id: 'm2', scheduled_date: '2024-12-14', start_time: '08:00', end_time: '10:00', priority: 'medium' },
      ];

      const conflicts = findAllConflicts(jobs);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].job1.id).toBe('1');
      expect(conflicts[0].job2.id).toBe('2');
    });

    it('should categorize conflict severity by priority', () => {
      const getConflictSeverity = (priority1: string, priority2: string): 'error' | 'warning' => {
        const highPriorities = ['high', 'urgent'];
        return highPriorities.includes(priority1) || highPriorities.includes(priority2) ? 'error' : 'warning';
      };

      expect(getConflictSeverity('high', 'low')).toBe('error');
      expect(getConflictSeverity('urgent', 'medium')).toBe('error');
      expect(getConflictSeverity('medium', 'low')).toBe('warning');
    });
  });

  describe('Conflict Resolution Priority', () => {
    interface ConflictJob {
      id: string;
      deadline: string;
      priority: string;
      isVip: boolean;
      value: number;
    }

    const sortByResolutionPriority = (jobs: ConflictJob[]): ConflictJob[] => {
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      
      return [...jobs].sort((a, b) => {
        // 1. Deadline first
        const deadlineCompare = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (deadlineCompare !== 0) return deadlineCompare;

        // 2. VIP status
        if (a.isVip !== b.isVip) return a.isVip ? -1 : 1;

        // 3. Priority level
        const priorityCompare = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        if (priorityCompare !== 0) return priorityCompare;

        // 4. Order value
        return b.value - a.value;
      });
    };

    it('should prioritize by deadline first', () => {
      const jobs: ConflictJob[] = [
        { id: '1', deadline: '2024-12-16', priority: 'high', isVip: true, value: 500 },
        { id: '2', deadline: '2024-12-14', priority: 'low', isVip: false, value: 100 },
      ];

      const sorted = sortByResolutionPriority(jobs);
      expect(sorted[0].id).toBe('2'); // Earlier deadline wins
    });

    it('should use VIP status when deadlines match', () => {
      const jobs: ConflictJob[] = [
        { id: '1', deadline: '2024-12-15', priority: 'low', isVip: false, value: 500 },
        { id: '2', deadline: '2024-12-15', priority: 'low', isVip: true, value: 100 },
      ];

      const sorted = sortByResolutionPriority(jobs);
      expect(sorted[0].id).toBe('2'); // VIP wins
    });

    it('should use priority when deadline and VIP match', () => {
      const jobs: ConflictJob[] = [
        { id: '1', deadline: '2024-12-15', priority: 'low', isVip: false, value: 500 },
        { id: '2', deadline: '2024-12-15', priority: 'high', isVip: false, value: 100 },
      ];

      const sorted = sortByResolutionPriority(jobs);
      expect(sorted[0].id).toBe('2'); // Higher priority wins
    });

    it('should use value as final tiebreaker', () => {
      const jobs: ConflictJob[] = [
        { id: '1', deadline: '2024-12-15', priority: 'medium', isVip: false, value: 100 },
        { id: '2', deadline: '2024-12-15', priority: 'medium', isVip: false, value: 500 },
      ];

      const sorted = sortByResolutionPriority(jobs);
      expect(sorted[0].id).toBe('2'); // Higher value wins
    });
  });

  describe('Load Balancing', () => {
    interface MachineLoad {
      machineId: string;
      technique_id: string;
      occupancy: number;
      jobCount: number;
    }

    const DAILY_AVAILABLE_MINUTES = 660; // 07:00-18:00 = 11 hours

    it('should calculate machine occupancy correctly', () => {
      const calculateOccupancy = (scheduledMinutes: number): number => {
        return Math.round((scheduledMinutes / DAILY_AVAILABLE_MINUTES) * 100);
      };

      expect(calculateOccupancy(660)).toBe(100); // Full day
      expect(calculateOccupancy(330)).toBe(50);  // Half day
      expect(calculateOccupancy(0)).toBe(0);     // Empty
      expect(calculateOccupancy(480)).toBe(73);  // 8 hours
    });

    it('should detect unbalanced load between machines', () => {
      const analyzeLoadBalance = (loads: MachineLoad[]): { isBalanced: boolean; variance: number } => {
        if (loads.length === 0) return { isBalanced: true, variance: 0 };

        const occupancies = loads.map(l => l.occupancy);
        const avg = occupancies.reduce((a, b) => a + b, 0) / occupancies.length;
        const variance = occupancies.reduce((sum, o) => sum + Math.pow(o - avg, 2), 0) / occupancies.length;
        const stdDev = Math.sqrt(variance);

        return { isBalanced: stdDev <= 25, variance: Math.round(variance) };
      };

      // Unbalanced
      const unbalanced: MachineLoad[] = [
        { machineId: 'm1', technique_id: 'silk', occupancy: 90, jobCount: 5 },
        { machineId: 'm2', technique_id: 'silk', occupancy: 20, jobCount: 1 },
      ];
      expect(analyzeLoadBalance(unbalanced).isBalanced).toBe(false);

      // Balanced
      const balanced: MachineLoad[] = [
        { machineId: 'm1', technique_id: 'silk', occupancy: 50, jobCount: 3 },
        { machineId: 'm2', technique_id: 'silk', occupancy: 55, jobCount: 3 },
      ];
      expect(analyzeLoadBalance(balanced).isBalanced).toBe(true);
    });

    it('should generate redistribution suggestions', () => {
      const generateSuggestions = (loads: MachineLoad[]): Array<{ from: string; to: string }> => {
        const suggestions: Array<{ from: string; to: string }> = [];

        // Group by technique
        const byTechnique = loads.reduce((acc, m) => {
          if (!acc[m.technique_id]) acc[m.technique_id] = [];
          acc[m.technique_id].push(m);
          return acc;
        }, {} as Record<string, MachineLoad[]>);

        Object.values(byTechnique).forEach(machines => {
          if (machines.length < 2) return;

          const sorted = [...machines].sort((a, b) => b.occupancy - a.occupancy);
          const highest = sorted[0];
          const lowest = sorted[sorted.length - 1];

          if (highest.occupancy - lowest.occupancy > 30) {
            suggestions.push({ from: highest.machineId, to: lowest.machineId });
          }
        });

        return suggestions;
      };

      const loads: MachineLoad[] = [
        { machineId: 'silk-1', technique_id: 'silk', occupancy: 85, jobCount: 5 },
        { machineId: 'silk-2', technique_id: 'silk', occupancy: 30, jobCount: 2 },
        { machineId: 'laser-1', technique_id: 'laser', occupancy: 60, jobCount: 3 },
        { machineId: 'laser-2', technique_id: 'laser', occupancy: 55, jobCount: 3 },
      ];

      const suggestions = generateSuggestions(loads);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].from).toBe('silk-1');
      expect(suggestions[0].to).toBe('silk-2');
    });

    it('should only suggest moves within same technique', () => {
      const canMoveBetweenMachines = (from: MachineLoad, to: MachineLoad): boolean => {
        return from.technique_id === to.technique_id;
      };

      const silk: MachineLoad = { machineId: 'm1', technique_id: 'silk', occupancy: 80, jobCount: 4 };
      const laser: MachineLoad = { machineId: 'm2', technique_id: 'laser', occupancy: 20, jobCount: 1 };
      const silk2: MachineLoad = { machineId: 'm3', technique_id: 'silk', occupancy: 30, jobCount: 2 };

      expect(canMoveBetweenMachines(silk, silk2)).toBe(true);
      expect(canMoveBetweenMachines(silk, laser)).toBe(false);
    });
  });

  describe('Bottleneck Prediction', () => {
    it('should predict bottleneck when approaching capacity', () => {
      const predictBottleneck = (
        currentOccupancy: number,
        pendingJobsMinutes: number,
        availableMinutes: number
      ): { isBottleneck: boolean; projectedOccupancy: number; severity: string } => {
        const pendingLoad = (pendingJobsMinutes / availableMinutes) * 100;
        const projectedOccupancy = Math.round(currentOccupancy + pendingLoad);

        return {
          projectedOccupancy,
          isBottleneck: projectedOccupancy >= 90,
          severity: projectedOccupancy >= 100 ? 'critical' : 
                   projectedOccupancy >= 90 ? 'warning' : 'normal',
        };
      };

      // At 80%, 180 min pending = 27% more
      const result1 = predictBottleneck(80, 180, 660);
      expect(result1.isBottleneck).toBe(true);
      expect(result1.severity).toBe('critical');

      // At 50%, 120 min pending = 18% more
      const result2 = predictBottleneck(50, 120, 660);
      expect(result2.isBottleneck).toBe(false);
      expect(result2.severity).toBe('normal');

      // At 85%, 60 min pending = 9% more
      const result3 = predictBottleneck(85, 60, 660);
      expect(result3.isBottleneck).toBe(true);
      expect(result3.severity).toBe('warning');
    });

    it('should generate appropriate alert severity', () => {
      const getAlertSeverity = (projectedLoad: number): 'error' | 'warning' | 'info' | null => {
        if (projectedLoad >= 100) return 'error';
        if (projectedLoad >= 90) return 'warning';
        if (projectedLoad >= 80) return 'info';
        return null;
      };

      expect(getAlertSeverity(105)).toBe('error');
      expect(getAlertSeverity(92)).toBe('warning');
      expect(getAlertSeverity(85)).toBe('info');
      expect(getAlertSeverity(70)).toBeNull();
    });
  });

  describe('Smart Sequencing', () => {
    interface SequencingJob {
      id: string;
      gravure_color: string | null;
      technique_id: string;
    }

    it('should group jobs by color to minimize setup', () => {
      const groupByColor = (jobs: SequencingJob[]): Record<string, SequencingJob[]> => {
        return jobs.reduce((groups, job) => {
          const color = job.gravure_color || 'sem_cor';
          if (!groups[color]) groups[color] = [];
          groups[color].push(job);
          return groups;
        }, {} as Record<string, SequencingJob[]>);
      };

      const jobs: SequencingJob[] = [
        { id: '1', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '2', gravure_color: 'azul', technique_id: 'silk' },
        { id: '3', gravure_color: 'vermelho', technique_id: 'silk' },
      ];

      const groups = groupByColor(jobs);
      expect(groups['vermelho']).toHaveLength(2);
      expect(groups['azul']).toHaveLength(1);
    });

    it('should calculate setup time savings', () => {
      const SETUP_TIME = 20;
      const REDUCED_SETUP = 10;

      const calculateTotalSetup = (jobs: SequencingJob[]): number => {
        let total = SETUP_TIME;
        for (let i = 1; i < jobs.length; i++) {
          const sameColor = jobs[i].gravure_color === jobs[i - 1].gravure_color && jobs[i].gravure_color;
          total += sameColor ? REDUCED_SETUP : SETUP_TIME;
        }
        return total;
      };

      // Different colors: 20 + 20 + 20 + 20 = 80
      const unoptimized: SequencingJob[] = [
        { id: '1', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '2', gravure_color: 'azul', technique_id: 'silk' },
        { id: '3', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '4', gravure_color: 'azul', technique_id: 'silk' },
      ];
      expect(calculateTotalSetup(unoptimized)).toBe(80);

      // Grouped colors: 20 + 10 + 20 + 10 = 60
      const optimized: SequencingJob[] = [
        { id: '1', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '3', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '2', gravure_color: 'azul', technique_id: 'silk' },
        { id: '4', gravure_color: 'azul', technique_id: 'silk' },
      ];
      expect(calculateTotalSetup(optimized)).toBe(60);
    });

    it('should count color transitions in sequence', () => {
      const countTransitions = (jobs: SequencingJob[]): number => {
        let transitions = 0;
        for (let i = 1; i < jobs.length; i++) {
          if (jobs[i].gravure_color !== jobs[i - 1].gravure_color) {
            transitions++;
          }
        }
        return transitions;
      };

      const unoptimized: SequencingJob[] = [
        { id: '1', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '2', gravure_color: 'azul', technique_id: 'silk' },
        { id: '3', gravure_color: 'vermelho', technique_id: 'silk' },
      ];
      expect(countTransitions(unoptimized)).toBe(2);

      const optimized: SequencingJob[] = [
        { id: '1', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '3', gravure_color: 'vermelho', technique_id: 'silk' },
        { id: '2', gravure_color: 'azul', technique_id: 'silk' },
      ];
      expect(countTransitions(optimized)).toBe(1);
    });
  });

  describe('Available Time Slots', () => {
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number): string => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    it('should find available time slots around scheduled jobs', () => {
      const findAvailableSlots = (
        scheduled: Array<{ start: string; end: string }>
      ): Array<{ start: string; end: string; minutes: number }> => {
        const OP_START = 7 * 60;
        const OP_END = 18 * 60;
        const slots: Array<{ start: string; end: string; minutes: number }> = [];

        const sorted = [...scheduled].sort((a, b) => parseTime(a.start) - parseTime(b.start));
        let current = OP_START;

        for (const slot of sorted) {
          const slotStart = parseTime(slot.start);
          if (slotStart > current) {
            slots.push({
              start: formatTime(current),
              end: slot.start,
              minutes: slotStart - current,
            });
          }
          current = Math.max(current, parseTime(slot.end));
        }

        if (current < OP_END) {
          slots.push({
            start: formatTime(current),
            end: formatTime(OP_END),
            minutes: OP_END - current,
          });
        }

        return slots;
      };

      const scheduled = [
        { start: '08:00', end: '10:00' },
        { start: '14:00', end: '16:00' },
      ];

      const available = findAvailableSlots(scheduled);
      
      expect(available).toHaveLength(3);
      expect(available[0]).toEqual({ start: '07:00', end: '08:00', minutes: 60 });
      expect(available[1]).toEqual({ start: '10:00', end: '14:00', minutes: 240 });
      expect(available[2]).toEqual({ start: '16:00', end: '18:00', minutes: 120 });
    });

    it('should return full day when no jobs scheduled', () => {
      const findAvailableSlots = (scheduled: Array<{ start: string; end: string }>) => {
        if (scheduled.length === 0) {
          return [{ start: '07:00', end: '18:00', minutes: 660 }];
        }
        return [];
      };

      const available = findAvailableSlots([]);
      expect(available[0].minutes).toBe(660);
    });
  });
});
