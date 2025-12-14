import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================
// PRODUCTIVITY & KPI CALCULATIONS TEST SUITE
// ============================================

// Types
interface Job {
  id: string;
  status: string;
  quantity: number;
  produced_quantity: number;
  lost_pieces: number;
  scheduled_date: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  estimated_duration: number;
  machine_id: string | null;
  technique_id: string;
}

interface Machine {
  id: string;
  name: string;
  code: string;
  technique_id: string;
  is_active: boolean;
}

interface Technique {
  id: string;
  name: string;
  short_name: string;
  color: string;
  setup_time: number;
}

interface KPIData {
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  delayedJobs: number;
  totalPieces: number;
  completedPieces: number;
  lostPieces: number;
  lossRate: number;
  averageOccupancy: number;
  productivityByMachine: MachineProductivity[];
  productivityByTechnique: TechniqueProductivity[];
  todayStats: TodayStats;
}

interface MachineProductivity {
  machineId: string;
  machineName: string;
  machineCode: string;
  totalJobs: number;
  completedJobs: number;
  totalPieces: number;
  lostPieces: number;
  lossRate: number;
  averageTime: number;
  occupancyRate: number;
}

interface TechniqueProductivity {
  techniqueId: string;
  techniqueName: string;
  totalJobs: number;
  completedJobs: number;
  totalPieces: number;
  lostPieces: number;
  lossRate: number;
  averageTime: number;
}

interface TodayStats {
  scheduled: number;
  inProgress: number;
  completed: number;
  delayed: number;
}

interface OperatorMetrics {
  operatorId: string;
  operatorName: string;
  totalJobsCompleted: number;
  averageProductionTime: number;
  efficiencyScore: number;
  lossRate: number;
  totalPiecesProduced: number;
  totalLostPieces: number;
  totalScans: number;
  assignedMachines: string[];
  productionVelocity: number;
  isActive: boolean;
}

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

function calculateLossRate(lostPieces: number, totalPieces: number): number {
  if (totalPieces === 0) return 0;
  return (lostPieces / totalPieces) * 100;
}

function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

function calculateOccupancyRate(
  usedMinutes: number,
  availableMinutes: number
): number {
  if (availableMinutes === 0) return 0;
  return Math.min((usedMinutes / availableMinutes) * 100, 100);
}

function calculateEfficiencyScore(
  qualityScore: number,
  timeEfficiency: number,
  completionRate: number
): number {
  // Weighted average: quality 40%, time 30%, completion 30%
  return qualityScore * 0.4 + timeEfficiency * 0.3 + completionRate * 0.3;
}

function calculateProductionVelocity(
  piecesProduced: number,
  timeMinutes: number
): number {
  if (timeMinutes === 0) return 0;
  return (piecesProduced / timeMinutes) * 60; // pieces per hour
}

function calculateTimeEfficiency(
  actualMinutes: number,
  estimatedMinutes: number
): number {
  if (actualMinutes === 0) return 100;
  if (estimatedMinutes === 0) return 0;
  const efficiency = (estimatedMinutes / actualMinutes) * 100;
  return Math.min(efficiency, 150); // Cap at 150% for exceptional performance
}

function calculateQualityScore(lossRate: number): number {
  return Math.max(0, 100 - lossRate);
}

function getActualMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60);
}

function isJobDelayed(job: Job): boolean {
  if (job.status === 'finished') return false;
  if (!job.scheduled_date) return false;
  
  const scheduledDate = new Date(job.scheduled_date);
  const now = new Date();
  
  // Job is delayed if scheduled date has passed and it's not finished
  return scheduledDate < now && job.status !== 'finished';
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// ============================================
// KPI AGGREGATION FUNCTIONS
// ============================================

function calculateKPIs(
  jobs: Job[],
  machines: Machine[],
  techniques: Technique[]
): KPIData {
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === 'finished').length;
  const inProgressJobs = jobs.filter(j => j.status === 'production').length;
  const delayedJobs = jobs.filter(isJobDelayed).length;
  
  const totalPieces = jobs.reduce((sum, j) => sum + j.quantity, 0);
  const completedPieces = jobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
  const lostPieces = jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
  const lossRate = calculateLossRate(lostPieces, completedPieces + lostPieces);
  
  // Calculate productivity by machine
  const productivityByMachine = machines.map(machine => {
    const machineJobs = jobs.filter(j => j.machine_id === machine.id);
    const machineCompleted = machineJobs.filter(j => j.status === 'finished');
    const machinePieces = machineJobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
    const machineLost = machineJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
    const totalTime = machineCompleted.reduce((sum, j) => {
      if (j.actual_start_time && j.actual_end_time) {
        return sum + getActualMinutes(j.actual_start_time, j.actual_end_time);
      }
      return sum;
    }, 0);
    
    return {
      machineId: machine.id,
      machineName: machine.name,
      machineCode: machine.code,
      totalJobs: machineJobs.length,
      completedJobs: machineCompleted.length,
      totalPieces: machinePieces,
      lostPieces: machineLost,
      lossRate: calculateLossRate(machineLost, machinePieces + machineLost),
      averageTime: machineCompleted.length > 0 ? totalTime / machineCompleted.length : 0,
      occupancyRate: 0 // Calculated separately based on schedule
    };
  });
  
  // Calculate productivity by technique
  const productivityByTechnique = techniques.map(technique => {
    const techJobs = jobs.filter(j => j.technique_id === technique.id);
    const techCompleted = techJobs.filter(j => j.status === 'finished');
    const techPieces = techJobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
    const techLost = techJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
    const totalTime = techCompleted.reduce((sum, j) => {
      if (j.actual_start_time && j.actual_end_time) {
        return sum + getActualMinutes(j.actual_start_time, j.actual_end_time);
      }
      return sum;
    }, 0);
    
    return {
      techniqueId: technique.id,
      techniqueName: technique.name,
      totalJobs: techJobs.length,
      completedJobs: techCompleted.length,
      totalPieces: techPieces,
      lostPieces: techLost,
      lossRate: calculateLossRate(techLost, techPieces + techLost),
      averageTime: techCompleted.length > 0 ? totalTime / techCompleted.length : 0
    };
  });
  
  // Today's stats
  const todayJobs = jobs.filter(j => isToday(j.scheduled_date));
  const todayStats: TodayStats = {
    scheduled: todayJobs.length,
    inProgress: todayJobs.filter(j => j.status === 'production').length,
    completed: todayJobs.filter(j => j.status === 'finished').length,
    delayed: todayJobs.filter(isJobDelayed).length
  };
  
  // Average occupancy across machines
  const totalOccupancy = productivityByMachine.reduce((sum, m) => sum + m.occupancyRate, 0);
  const averageOccupancy = machines.length > 0 ? totalOccupancy / machines.length : 0;
  
  return {
    totalJobs,
    completedJobs,
    inProgressJobs,
    delayedJobs,
    totalPieces,
    completedPieces,
    lostPieces,
    lossRate,
    averageOccupancy,
    productivityByMachine,
    productivityByTechnique,
    todayStats
  };
}

function calculateOperatorMetrics(
  operatorId: string,
  operatorName: string,
  jobs: Job[],
  scanCount: number,
  assignedMachines: string[]
): OperatorMetrics {
  const completedJobs = jobs.filter(j => j.status === 'finished');
  const totalPiecesProduced = completedJobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
  const totalLostPieces = completedJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
  
  let totalProductionTime = 0;
  completedJobs.forEach(job => {
    if (job.actual_start_time && job.actual_end_time) {
      totalProductionTime += getActualMinutes(job.actual_start_time, job.actual_end_time);
    }
  });
  
  const averageProductionTime = completedJobs.length > 0 
    ? totalProductionTime / completedJobs.length 
    : 0;
  
  const lossRate = calculateLossRate(totalLostPieces, totalPiecesProduced + totalLostPieces);
  const qualityScore = calculateQualityScore(lossRate);
  
  // Calculate time efficiency from completed jobs
  let totalTimeEfficiency = 0;
  completedJobs.forEach(job => {
    if (job.actual_start_time && job.actual_end_time) {
      const actualMinutes = getActualMinutes(job.actual_start_time, job.actual_end_time);
      totalTimeEfficiency += calculateTimeEfficiency(actualMinutes, job.estimated_duration);
    }
  });
  const avgTimeEfficiency = completedJobs.length > 0 
    ? totalTimeEfficiency / completedJobs.length 
    : 100;
  
  const completionRate = 100; // Only counting completed jobs
  const efficiencyScore = calculateEfficiencyScore(qualityScore, avgTimeEfficiency, completionRate);
  
  const productionVelocity = calculateProductionVelocity(totalPiecesProduced, totalProductionTime);
  
  return {
    operatorId,
    operatorName,
    totalJobsCompleted: completedJobs.length,
    averageProductionTime,
    efficiencyScore,
    lossRate,
    totalPiecesProduced,
    totalLostPieces,
    totalScans: scanCount,
    assignedMachines,
    productionVelocity,
    isActive: true
  };
}

function calculateOverallStats(operators: OperatorMetrics[]) {
  if (operators.length === 0) {
    return {
      averageEfficiency: 0,
      totalJobsCompleted: 0,
      totalPiecesProduced: 0,
      averageLossRate: 0,
      topPerformer: null
    };
  }
  
  const totalEfficiency = operators.reduce((sum, o) => sum + o.efficiencyScore, 0);
  const totalJobs = operators.reduce((sum, o) => sum + o.totalJobsCompleted, 0);
  const totalPieces = operators.reduce((sum, o) => sum + o.totalPiecesProduced, 0);
  const totalLossRate = operators.reduce((sum, o) => sum + o.lossRate, 0);
  
  const topPerformer = operators.reduce((top, curr) => 
    curr.efficiencyScore > (top?.efficiencyScore || 0) ? curr : top
  , operators[0]);
  
  return {
    averageEfficiency: totalEfficiency / operators.length,
    totalJobsCompleted: totalJobs,
    totalPiecesProduced: totalPieces,
    averageLossRate: totalLossRate / operators.length,
    topPerformer
  };
}

// ============================================
// ESTIMATED TIME CALCULATION
// ============================================

interface EstimatedTimeParams {
  quantity: number;
  setupTime: number;
  colorsCount?: number;
  complexity?: 'low' | 'medium' | 'high';
  sizeMultiplier?: number;
}

function calculateEstimatedTime(params: EstimatedTimeParams): number {
  const {
    quantity,
    setupTime,
    colorsCount = 1,
    complexity = 'medium',
    sizeMultiplier = 1
  } = params;
  
  // Base time per piece (in minutes)
  const baseTimePerPiece = 0.5;
  
  // Complexity multipliers
  const complexityMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.5
  };
  
  // Calculate production time
  const productionTime = quantity * baseTimePerPiece * 
    complexityMultipliers[complexity] * 
    sizeMultiplier * 
    (1 + (colorsCount - 1) * 0.2); // 20% increase per additional color
  
  return Math.ceil(setupTime + productionTime);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

// ============================================
// TEST SUITES
// ============================================

describe('Core KPI Calculations', () => {
  describe('Loss Rate Calculation', () => {
    it('should calculate loss rate correctly', () => {
      expect(calculateLossRate(10, 100)).toBe(10);
      expect(calculateLossRate(5, 200)).toBe(2.5);
      expect(calculateLossRate(0, 100)).toBe(0);
    });

    it('should handle zero total pieces', () => {
      expect(calculateLossRate(0, 0)).toBe(0);
      expect(calculateLossRate(10, 0)).toBe(0);
    });

    it('should calculate high loss rates', () => {
      expect(calculateLossRate(50, 100)).toBe(50);
      expect(calculateLossRate(90, 100)).toBe(90);
    });
  });

  describe('Completion Rate Calculation', () => {
    it('should calculate completion rate correctly', () => {
      expect(calculateCompletionRate(50, 100)).toBe(50);
      expect(calculateCompletionRate(100, 100)).toBe(100);
      expect(calculateCompletionRate(0, 100)).toBe(0);
    });

    it('should handle zero total jobs', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });
  });

  describe('Occupancy Rate Calculation', () => {
    it('should calculate occupancy rate correctly', () => {
      expect(calculateOccupancyRate(300, 600)).toBe(50);
      expect(calculateOccupancyRate(600, 600)).toBe(100);
      expect(calculateOccupancyRate(0, 600)).toBe(0);
    });

    it('should cap at 100%', () => {
      expect(calculateOccupancyRate(700, 600)).toBe(100);
    });

    it('should handle zero available time', () => {
      expect(calculateOccupancyRate(300, 0)).toBe(0);
    });
  });

  describe('Efficiency Score Calculation', () => {
    it('should calculate weighted efficiency score', () => {
      // 100 quality, 100 time, 100 completion = 100
      expect(calculateEfficiencyScore(100, 100, 100)).toBe(100);
      
      // 50 quality, 50 time, 50 completion = 50
      expect(calculateEfficiencyScore(50, 50, 50)).toBe(50);
    });

    it('should apply correct weights', () => {
      // Quality 40%, Time 30%, Completion 30%
      const score = calculateEfficiencyScore(100, 0, 0);
      expect(score).toBe(40);
      
      const score2 = calculateEfficiencyScore(0, 100, 0);
      expect(score2).toBe(30);
      
      const score3 = calculateEfficiencyScore(0, 0, 100);
      expect(score3).toBe(30);
    });
  });

  describe('Production Velocity Calculation', () => {
    it('should calculate pieces per hour', () => {
      expect(calculateProductionVelocity(60, 60)).toBe(60);
      expect(calculateProductionVelocity(120, 60)).toBe(120);
      expect(calculateProductionVelocity(30, 60)).toBe(30);
    });

    it('should handle zero time', () => {
      expect(calculateProductionVelocity(100, 0)).toBe(0);
    });

    it('should handle fractional rates', () => {
      const velocity = calculateProductionVelocity(100, 45);
      expect(velocity).toBeCloseTo(133.33, 1);
    });
  });

  describe('Time Efficiency Calculation', () => {
    it('should calculate time efficiency correctly', () => {
      // Finished exactly on estimate = 100%
      expect(calculateTimeEfficiency(60, 60)).toBe(100);
      
      // Finished in half the time = 200%, capped at 150%
      expect(calculateTimeEfficiency(30, 60)).toBe(150);
      
      // Took twice as long = 50%
      expect(calculateTimeEfficiency(120, 60)).toBe(50);
    });

    it('should handle edge cases', () => {
      expect(calculateTimeEfficiency(0, 60)).toBe(100);
      expect(calculateTimeEfficiency(60, 0)).toBe(0);
    });
  });

  describe('Quality Score Calculation', () => {
    it('should derive quality from loss rate', () => {
      expect(calculateQualityScore(0)).toBe(100);
      expect(calculateQualityScore(10)).toBe(90);
      expect(calculateQualityScore(50)).toBe(50);
    });

    it('should not go below zero', () => {
      expect(calculateQualityScore(100)).toBe(0);
      expect(calculateQualityScore(150)).toBe(0);
    });
  });
});

describe('Job Status Calculations', () => {
  describe('Delayed Job Detection', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    it('should detect delayed jobs', () => {
      const delayedJob: Job = {
        id: '1',
        status: 'queue',
        quantity: 100,
        produced_quantity: 0,
        lost_pieces: 0,
        scheduled_date: yesterday.toISOString().split('T')[0],
        actual_start_time: null,
        actual_end_time: null,
        estimated_duration: 60,
        machine_id: 'machine-1',
        technique_id: 'tech-1'
      };

      expect(isJobDelayed(delayedJob)).toBe(true);
    });

    it('should not mark future jobs as delayed', () => {
      const futureJob: Job = {
        id: '2',
        status: 'queue',
        quantity: 100,
        produced_quantity: 0,
        lost_pieces: 0,
        scheduled_date: tomorrow.toISOString().split('T')[0],
        actual_start_time: null,
        actual_end_time: null,
        estimated_duration: 60,
        machine_id: 'machine-1',
        technique_id: 'tech-1'
      };

      expect(isJobDelayed(futureJob)).toBe(false);
    });

    it('should not mark finished jobs as delayed', () => {
      const finishedJob: Job = {
        id: '3',
        status: 'finished',
        quantity: 100,
        produced_quantity: 100,
        lost_pieces: 0,
        scheduled_date: yesterday.toISOString().split('T')[0],
        actual_start_time: yesterday.toISOString(),
        actual_end_time: yesterday.toISOString(),
        estimated_duration: 60,
        machine_id: 'machine-1',
        technique_id: 'tech-1'
      };

      expect(isJobDelayed(finishedJob)).toBe(false);
    });

    it('should handle jobs without scheduled date', () => {
      const unscheduledJob: Job = {
        id: '4',
        status: 'queue',
        quantity: 100,
        produced_quantity: 0,
        lost_pieces: 0,
        scheduled_date: null,
        actual_start_time: null,
        actual_end_time: null,
        estimated_duration: 60,
        machine_id: 'machine-1',
        technique_id: 'tech-1'
      };

      expect(isJobDelayed(unscheduledJob)).toBe(false);
    });
  });

  describe('Today Detection', () => {
    it('should correctly identify today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isToday(today)).toBe(true);
    });

    it('should reject other dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday.toISOString().split('T')[0])).toBe(false);
    });

    it('should handle null dates', () => {
      expect(isToday(null)).toBe(false);
    });
  });
});

describe('KPI Aggregation', () => {
  const mockMachines: Machine[] = [
    { id: 'machine-1', name: 'Fiber Laser 1', code: 'FL-01', technique_id: 'fiber-laser', is_active: true },
    { id: 'machine-2', name: 'Fiber Laser 2', code: 'FL-02', technique_id: 'fiber-laser', is_active: true },
    { id: 'machine-3', name: 'Silk 1', code: 'SK-01', technique_id: 'silk', is_active: true }
  ];

  const mockTechniques: Technique[] = [
    { id: 'fiber-laser', name: 'Fiber Laser', short_name: 'FL', color: '#FF5722', setup_time: 5 },
    { id: 'silk', name: 'Serigrafia', short_name: 'SK', color: '#4CAF50', setup_time: 20 }
  ];

  const baseTime = new Date();
  const startTime = new Date(baseTime.getTime() - 60 * 60 * 1000); // 1 hour ago
  const today = new Date().toISOString().split('T')[0];

  const mockJobs: Job[] = [
    {
      id: 'job-1',
      status: 'finished',
      quantity: 100,
      produced_quantity: 95,
      lost_pieces: 5,
      scheduled_date: today,
      actual_start_time: startTime.toISOString(),
      actual_end_time: baseTime.toISOString(),
      estimated_duration: 60,
      machine_id: 'machine-1',
      technique_id: 'fiber-laser'
    },
    {
      id: 'job-2',
      status: 'production',
      quantity: 200,
      produced_quantity: 0,
      lost_pieces: 0,
      scheduled_date: today,
      actual_start_time: baseTime.toISOString(),
      actual_end_time: null,
      estimated_duration: 120,
      machine_id: 'machine-2',
      technique_id: 'fiber-laser'
    },
    {
      id: 'job-3',
      status: 'finished',
      quantity: 150,
      produced_quantity: 140,
      lost_pieces: 10,
      scheduled_date: today,
      actual_start_time: startTime.toISOString(),
      actual_end_time: baseTime.toISOString(),
      estimated_duration: 90,
      machine_id: 'machine-3',
      technique_id: 'silk'
    }
  ];

  it('should calculate overall KPIs', () => {
    const kpis = calculateKPIs(mockJobs, mockMachines, mockTechniques);

    expect(kpis.totalJobs).toBe(3);
    expect(kpis.completedJobs).toBe(2);
    expect(kpis.inProgressJobs).toBe(1);
    expect(kpis.totalPieces).toBe(450); // 100 + 200 + 150
    expect(kpis.completedPieces).toBe(235); // 95 + 140
    expect(kpis.lostPieces).toBe(15); // 5 + 10
  });

  it('should calculate loss rate from completed jobs', () => {
    const kpis = calculateKPIs(mockJobs, mockMachines, mockTechniques);
    
    // Loss rate = 15 / (235 + 15) * 100 = 6%
    expect(kpis.lossRate).toBeCloseTo(6, 0);
  });

  it('should calculate productivity by machine', () => {
    const kpis = calculateKPIs(mockJobs, mockMachines, mockTechniques);

    const machine1 = kpis.productivityByMachine.find(m => m.machineId === 'machine-1');
    expect(machine1).toBeDefined();
    expect(machine1!.totalJobs).toBe(1);
    expect(machine1!.completedJobs).toBe(1);
    expect(machine1!.totalPieces).toBe(95);
    expect(machine1!.lostPieces).toBe(5);
  });

  it('should calculate productivity by technique', () => {
    const kpis = calculateKPIs(mockJobs, mockMachines, mockTechniques);

    const fiberLaser = kpis.productivityByTechnique.find(t => t.techniqueId === 'fiber-laser');
    expect(fiberLaser).toBeDefined();
    expect(fiberLaser!.totalJobs).toBe(2);
    expect(fiberLaser!.completedJobs).toBe(1);
  });

  it('should calculate today stats', () => {
    const kpis = calculateKPIs(mockJobs, mockMachines, mockTechniques);

    expect(kpis.todayStats.scheduled).toBe(3);
    expect(kpis.todayStats.inProgress).toBe(1);
    expect(kpis.todayStats.completed).toBe(2);
  });

  it('should handle empty data', () => {
    const kpis = calculateKPIs([], [], []);

    expect(kpis.totalJobs).toBe(0);
    expect(kpis.completedJobs).toBe(0);
    expect(kpis.lossRate).toBe(0);
    expect(kpis.averageOccupancy).toBe(0);
  });
});

describe('Operator Metrics Calculation', () => {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - 2);
  const endTime = new Date();
  endTime.setHours(endTime.getHours() - 1);

  const mockOperatorJobs: Job[] = [
    {
      id: 'job-1',
      status: 'finished',
      quantity: 100,
      produced_quantity: 95,
      lost_pieces: 5,
      scheduled_date: new Date().toISOString().split('T')[0],
      actual_start_time: startTime.toISOString(),
      actual_end_time: endTime.toISOString(),
      estimated_duration: 60,
      machine_id: 'machine-1',
      technique_id: 'fiber-laser'
    },
    {
      id: 'job-2',
      status: 'finished',
      quantity: 200,
      produced_quantity: 190,
      lost_pieces: 10,
      scheduled_date: new Date().toISOString().split('T')[0],
      actual_start_time: startTime.toISOString(),
      actual_end_time: endTime.toISOString(),
      estimated_duration: 120,
      machine_id: 'machine-1',
      technique_id: 'fiber-laser'
    }
  ];

  it('should calculate operator metrics correctly', () => {
    const metrics = calculateOperatorMetrics(
      'op-1',
      'João Silva',
      mockOperatorJobs,
      50,
      ['machine-1', 'machine-2']
    );

    expect(metrics.operatorId).toBe('op-1');
    expect(metrics.operatorName).toBe('João Silva');
    expect(metrics.totalJobsCompleted).toBe(2);
    expect(metrics.totalPiecesProduced).toBe(285); // 95 + 190
    expect(metrics.totalLostPieces).toBe(15); // 5 + 10
    expect(metrics.totalScans).toBe(50);
    expect(metrics.assignedMachines).toEqual(['machine-1', 'machine-2']);
  });

  it('should calculate loss rate for operator', () => {
    const metrics = calculateOperatorMetrics(
      'op-1',
      'João Silva',
      mockOperatorJobs,
      50,
      ['machine-1']
    );

    // Loss rate = 15 / (285 + 15) * 100 = 5%
    expect(metrics.lossRate).toBeCloseTo(5, 0);
  });

  it('should calculate efficiency score', () => {
    const metrics = calculateOperatorMetrics(
      'op-1',
      'João Silva',
      mockOperatorJobs,
      50,
      ['machine-1']
    );

    expect(metrics.efficiencyScore).toBeGreaterThan(0);
    expect(metrics.efficiencyScore).toBeLessThanOrEqual(100);
  });

  it('should calculate production velocity', () => {
    const metrics = calculateOperatorMetrics(
      'op-1',
      'João Silva',
      mockOperatorJobs,
      50,
      ['machine-1']
    );

    expect(metrics.productionVelocity).toBeGreaterThan(0);
  });

  it('should handle operator with no jobs', () => {
    const metrics = calculateOperatorMetrics(
      'op-2',
      'Maria Santos',
      [],
      0,
      ['machine-1']
    );

    expect(metrics.totalJobsCompleted).toBe(0);
    expect(metrics.totalPiecesProduced).toBe(0);
    expect(metrics.lossRate).toBe(0);
    expect(metrics.productionVelocity).toBe(0);
  });
});

describe('Overall Stats Calculation', () => {
  const mockOperators: OperatorMetrics[] = [
    {
      operatorId: 'op-1',
      operatorName: 'João Silva',
      totalJobsCompleted: 45,
      averageProductionTime: 55,
      efficiencyScore: 92,
      lossRate: 2,
      totalPiecesProduced: 4500,
      totalLostPieces: 92,
      totalScans: 180,
      assignedMachines: ['machine-1'],
      productionVelocity: 82,
      isActive: true
    },
    {
      operatorId: 'op-2',
      operatorName: 'Maria Santos',
      totalJobsCompleted: 38,
      averageProductionTime: 62,
      efficiencyScore: 85,
      lossRate: 3.5,
      totalPiecesProduced: 3800,
      totalLostPieces: 137,
      totalScans: 152,
      assignedMachines: ['machine-2'],
      productionVelocity: 61,
      isActive: true
    }
  ];

  it('should calculate overall stats', () => {
    const stats = calculateOverallStats(mockOperators);

    expect(stats.averageEfficiency).toBe(88.5); // (92 + 85) / 2
    expect(stats.totalJobsCompleted).toBe(83); // 45 + 38
    expect(stats.totalPiecesProduced).toBe(8300); // 4500 + 3800
    expect(stats.averageLossRate).toBe(2.75); // (2 + 3.5) / 2
  });

  it('should identify top performer', () => {
    const stats = calculateOverallStats(mockOperators);

    expect(stats.topPerformer).toBeDefined();
    expect(stats.topPerformer!.operatorId).toBe('op-1');
    expect(stats.topPerformer!.efficiencyScore).toBe(92);
  });

  it('should handle empty operators array', () => {
    const stats = calculateOverallStats([]);

    expect(stats.averageEfficiency).toBe(0);
    expect(stats.totalJobsCompleted).toBe(0);
    expect(stats.totalPiecesProduced).toBe(0);
    expect(stats.averageLossRate).toBe(0);
    expect(stats.topPerformer).toBeNull();
  });

  it('should handle single operator', () => {
    const stats = calculateOverallStats([mockOperators[0]]);

    expect(stats.averageEfficiency).toBe(92);
    expect(stats.topPerformer!.operatorId).toBe('op-1');
  });
});

describe('Estimated Time Calculation', () => {
  it('should calculate basic estimated time', () => {
    const time = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10
    });

    // 10 + (100 * 0.5 * 1.0 * 1 * 1) = 60
    expect(time).toBe(60);
  });

  it('should apply complexity multiplier', () => {
    const lowComplexity = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      complexity: 'low'
    });

    const highComplexity = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      complexity: 'high'
    });

    expect(lowComplexity).toBeLessThan(highComplexity);
  });

  it('should apply color multiplier', () => {
    const oneColor = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      colorsCount: 1
    });

    const fourColors = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      colorsCount: 4
    });

    expect(oneColor).toBeLessThan(fourColors);
  });

  it('should apply size multiplier', () => {
    const normalSize = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      sizeMultiplier: 1
    });

    const largeSize = calculateEstimatedTime({
      quantity: 100,
      setupTime: 10,
      sizeMultiplier: 2
    });

    expect(largeSize).toBe(normalSize * 2 - 10 + 10); // Double production time, same setup
  });
});

describe('Duration Formatting', () => {
  it('should format minutes only', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(59)).toBe('59min');
  });

  it('should format hours only', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(180)).toBe('3h');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(150)).toBe('2h 30min');
    expect(formatDuration(75)).toBe('1h 15min');
  });
});

describe('Period-Based Filtering', () => {
  const baseDate = new Date();
  
  function createJobWithDate(daysAgo: number): Job {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `job-${daysAgo}`,
      status: 'finished',
      quantity: 100,
      produced_quantity: 100,
      lost_pieces: 0,
      scheduled_date: date.toISOString().split('T')[0],
      actual_start_time: date.toISOString(),
      actual_end_time: date.toISOString(),
      estimated_duration: 60,
      machine_id: 'machine-1',
      technique_id: 'tech-1'
    };
  }

  function filterJobsByPeriod(jobs: Job[], days: number | 'all'): Job[] {
    if (days === 'all') return jobs;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return jobs.filter(job => {
      if (!job.scheduled_date) return false;
      return new Date(job.scheduled_date) >= cutoffDate;
    });
  }

  it('should filter jobs by 7-day period', () => {
    const jobs = [
      createJobWithDate(1),
      createJobWithDate(5),
      createJobWithDate(10),
      createJobWithDate(30)
    ];

    const filtered = filterJobsByPeriod(jobs, 7);
    expect(filtered.length).toBe(2);
  });

  it('should filter jobs by 30-day period', () => {
    const jobs = [
      createJobWithDate(1),
      createJobWithDate(15),
      createJobWithDate(25),
      createJobWithDate(45)
    ];

    const filtered = filterJobsByPeriod(jobs, 30);
    expect(filtered.length).toBe(3);
  });

  it('should return all jobs when period is "all"', () => {
    const jobs = [
      createJobWithDate(1),
      createJobWithDate(100),
      createJobWithDate(365)
    ];

    const filtered = filterJobsByPeriod(jobs, 'all');
    expect(filtered.length).toBe(3);
  });
});

describe('Trend Calculation', () => {
  interface DailyData {
    date: string;
    value: number;
  }

  function calculateTrend(data: DailyData[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const recentValues = data.slice(-7);
    const olderValues = data.slice(-14, -7);
    
    if (olderValues.length === 0) return 'stable';
    
    const recentAvg = recentValues.reduce((sum, d) => sum + d.value, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((sum, d) => sum + d.value, 0) / olderValues.length;
    
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (percentChange > 5) return 'up';
    if (percentChange < -5) return 'down';
    return 'stable';
  }

  it('should detect upward trend', () => {
    const data: DailyData[] = [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 52 },
      { date: '2024-01-03', value: 53 },
      { date: '2024-01-04', value: 55 },
      { date: '2024-01-05', value: 58 },
      { date: '2024-01-06', value: 60 },
      { date: '2024-01-07', value: 62 },
      { date: '2024-01-08', value: 70 },
      { date: '2024-01-09', value: 72 },
      { date: '2024-01-10', value: 75 },
      { date: '2024-01-11', value: 78 },
      { date: '2024-01-12', value: 80 },
      { date: '2024-01-13', value: 82 },
      { date: '2024-01-14', value: 85 }
    ];

    expect(calculateTrend(data)).toBe('up');
  });

  it('should detect downward trend', () => {
    const data: DailyData[] = [
      { date: '2024-01-01', value: 85 },
      { date: '2024-01-02', value: 82 },
      { date: '2024-01-03', value: 80 },
      { date: '2024-01-04', value: 78 },
      { date: '2024-01-05', value: 75 },
      { date: '2024-01-06', value: 72 },
      { date: '2024-01-07', value: 70 },
      { date: '2024-01-08', value: 55 },
      { date: '2024-01-09', value: 52 },
      { date: '2024-01-10', value: 50 },
      { date: '2024-01-11', value: 48 },
      { date: '2024-01-12', value: 45 },
      { date: '2024-01-13', value: 43 },
      { date: '2024-01-14', value: 40 }
    ];

    expect(calculateTrend(data)).toBe('down');
  });

  it('should detect stable trend', () => {
    const data: DailyData[] = [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 51 },
      { date: '2024-01-03', value: 49 },
      { date: '2024-01-04', value: 50 },
      { date: '2024-01-05', value: 51 },
      { date: '2024-01-06', value: 50 },
      { date: '2024-01-07', value: 49 },
      { date: '2024-01-08', value: 50 },
      { date: '2024-01-09', value: 51 },
      { date: '2024-01-10', value: 50 },
      { date: '2024-01-11', value: 49 },
      { date: '2024-01-12', value: 50 },
      { date: '2024-01-13', value: 51 },
      { date: '2024-01-14', value: 50 }
    ];

    expect(calculateTrend(data)).toBe('stable');
  });

  it('should return stable for insufficient data', () => {
    expect(calculateTrend([])).toBe('stable');
    expect(calculateTrend([{ date: '2024-01-01', value: 50 }])).toBe('stable');
  });
});

describe('Comparative Analytics', () => {
  function compareOperators(
    operators: OperatorMetrics[]
  ): { best: OperatorMetrics | null; worst: OperatorMetrics | null; gap: number } {
    if (operators.length === 0) {
      return { best: null, worst: null, gap: 0 };
    }

    const sorted = [...operators].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    return {
      best,
      worst,
      gap: best.efficiencyScore - worst.efficiencyScore
    };
  }

  const mockOperators: OperatorMetrics[] = [
    {
      operatorId: 'op-1',
      operatorName: 'Top Performer',
      totalJobsCompleted: 50,
      averageProductionTime: 45,
      efficiencyScore: 95,
      lossRate: 1,
      totalPiecesProduced: 5000,
      totalLostPieces: 51,
      totalScans: 200,
      assignedMachines: ['machine-1'],
      productionVelocity: 111,
      isActive: true
    },
    {
      operatorId: 'op-2',
      operatorName: 'Average Performer',
      totalJobsCompleted: 35,
      averageProductionTime: 60,
      efficiencyScore: 75,
      lossRate: 4,
      totalPiecesProduced: 3500,
      totalLostPieces: 146,
      totalScans: 140,
      assignedMachines: ['machine-2'],
      productionVelocity: 58,
      isActive: true
    },
    {
      operatorId: 'op-3',
      operatorName: 'Low Performer',
      totalJobsCompleted: 20,
      averageProductionTime: 80,
      efficiencyScore: 55,
      lossRate: 8,
      totalPiecesProduced: 2000,
      totalLostPieces: 174,
      totalScans: 80,
      assignedMachines: ['machine-3'],
      productionVelocity: 25,
      isActive: true
    }
  ];

  it('should identify best and worst performers', () => {
    const comparison = compareOperators(mockOperators);

    expect(comparison.best!.operatorId).toBe('op-1');
    expect(comparison.worst!.operatorId).toBe('op-3');
    expect(comparison.gap).toBe(40); // 95 - 55
  });

  it('should handle empty array', () => {
    const comparison = compareOperators([]);

    expect(comparison.best).toBeNull();
    expect(comparison.worst).toBeNull();
    expect(comparison.gap).toBe(0);
  });

  it('should handle single operator', () => {
    const comparison = compareOperators([mockOperators[0]]);

    expect(comparison.best!.operatorId).toBe('op-1');
    expect(comparison.worst!.operatorId).toBe('op-1');
    expect(comparison.gap).toBe(0);
  });
});
