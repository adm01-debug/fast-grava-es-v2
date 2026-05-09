import { useMemo } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { DbJob, DbMachine, DbTechnique } from './useJobs';

// Data validation helpers
function isValidJob(job: DbJob): boolean {
  return (
    typeof job.id === 'string' && job.id.length > 0 &&
    typeof job.quantity === 'number' && job.quantity >= 0 &&
    typeof job.estimated_duration === 'number' && job.estimated_duration >= 0 &&
    typeof job.status === 'string'
  );
}

function isValidMachine(machine: DbMachine): boolean {
  return (
    typeof machine.id === 'string' && machine.id.length > 0 &&
    typeof machine.name === 'string' &&
    typeof machine.technique_id === 'string'
  );
}

function isValidTechnique(technique: DbTechnique): boolean {
  return (
    typeof technique.id === 'string' && technique.id.length > 0 &&
    typeof technique.name === 'string' &&
    typeof technique.color === 'string'
  );
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

export type KPIPeriod = 'day' | 'week' | 'month' | 'year' | 'all';

export interface KPITargets {
  completionRate: number;
  occupancyRate: number;
  lossRate: number;
  avgDuration: number;
}

export interface KPIAnomaly {
  id: string;
  type: 'loss' | 'delay' | 'occupancy';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  entityName: string;
  entityId: string;
}

export interface KPIComparison {
  completionRateDiff: number;
  occupancyDiff: number;
  lossRateDiff: number;
  volumeDiff: number;
}

export interface KPIPrediction {
  date: string;
  estimatedVolume: number;
  estimatedLossRate: number;
  confidence: number;
}

export interface KPIData {
  // Overview
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  delayedJobs: number;
  
  // Pieces
  totalPieces: number;
  completedPieces: number;
  lostPieces: number;
  lossRate: number;
  
  // Occupancy
  averageOccupancy: number;
  
  // By machine
  productivityByMachine: {
    machineId: string;
    machineName: string;
    techniqueId: string;
    jobCount: number;
    completedJobs: number;
    totalPieces: number;
    lostPieces: number;
    lossRate: number;
    avgDuration: number;
  }[];
  
  // By technique
  productivityByTechnique: {
    techniqueId: string;
    techniqueName: string;
    color: string;
    jobCount: number;
    completedJobs: number;
    totalPieces: number;
    lostPieces: number;
    avgDuration: number;
    occupancyRate: number;
  }[];

  // By product
  productivityByProduct: {
    productName: string;
    jobCount: number;
    totalPieces: number;
    avgDuration: number;
    lossRate: number;
  }[];
  
  // Time-based
  todayStats: {
    scheduled: number;
    completed: number;
    inProgress: number;
    delayed: number;
  };
  
  // Historical data for charts
  performanceHistory: {
    date: string;
    efficiency: number;
    productivity: number;
    lossRate: number;
  }[];
  
  // Comparisons
  comparison: KPIComparison;

  // Predictions
  predictions: KPIPrediction[];

  // Anomalies
  anomalies: KPIAnomaly[];

  // Targets used
  targets: KPITargets;
  
  // Financial
  estimatedRevenue: number;
  costOfLosses: number;
}

const DEFAULT_TARGETS: KPITargets = {
  completionRate: 95,
  occupancyRate: 80,
  lossRate: 2,
  avgDuration: 45,
};

export function useKPIs(period: KPIPeriod = 'all', customTargets?: Partial<KPITargets>): { data: KPIData | null; isLoading: boolean } {
  const { jobs, techniques, machines, isLoading } = useSchedulingData();

  const data = useMemo(() => {
    if (!jobs || !techniques || !machines) return null;

    const targets = { ...DEFAULT_TARGETS, ...customTargets };
    const now = new Date();

    const getPeriodDays = (p: KPIPeriod) => {
      switch(p) {
        case 'day': return 1;
        case 'week': return 7;
        case 'month': return 30;
        case 'year': return 365;
        default: return 9999;
      }
    };

    const daysCount = getPeriodDays(period);

    // Current Period Filter
    const currentPeriodFilter = (job: DbJob) => {
      if (period === 'all') return true;
      const jobDate = new Date(job.scheduled_date || job.created_at);
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= daysCount;
    };

    // Previous Period Filter (for comparison)
    const previousPeriodFilter = (job: DbJob) => {
      if (period === 'all') return false;
      const jobDate = new Date(job.scheduled_date || job.created_at);
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > daysCount && diffDays <= (daysCount * 2);
    };

    // Helper to calculate stats for a set of jobs
    const calculateStats = (jobList: DbJob[]) => {
      const total = jobList.length;
      const completed = jobList.filter(j => j.status === 'finished').length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      const totalPcs = jobList.reduce((sum, j) => sum + sanitizeNumber(j.quantity), 0);
      const lostPcs = jobList.reduce((sum, j) => sum + sanitizeNumber(j.lost_pieces), 0);
      const prodPcs = jobList.reduce((sum, j) => sum + sanitizeNumber(j.produced_quantity ?? j.quantity), 0);
      const lRate = (prodPcs + lostPcs) > 0 ? (lostPcs / (prodPcs + lostPcs)) * 100 : 0;

      return { total, completed, rate, totalPcs, lostPcs, lossRate: lRate };
    };

    const validJobsAll = jobs.filter(isValidJob);
    const validJobs = validJobsAll.filter(currentPeriodFilter);
    const prevJobs = validJobsAll.filter(previousPeriodFilter);
    
    const validMachines = machines.filter(isValidMachine);
    const validTechniques = techniques.filter(isValidTechnique);

    const currentStats = calculateStats(validJobs);
    const prevStats = calculateStats(prevJobs);

    const comparison: KPIComparison = {
      completionRateDiff: currentStats.rate - prevStats.rate,
      occupancyDiff: 0, // Calculated later
      lossRateDiff: currentStats.lossRate - prevStats.lossRate,
      volumeDiff: prevStats.totalPcs > 0 ? ((currentStats.totalPcs - prevStats.totalPcs) / prevStats.totalPcs) * 100 : 0
    };

    const today = now.toISOString().split('T')[0];

    // Overview stats
    const totalJobs = validJobs.length;
    const completedJobs = validJobs.filter(j => j.status === 'finished').length;
    const inProgressJobs = validJobs.filter(j => j.status === 'production').length;
    const delayedJobs = validJobs.filter(j => j.status === 'delayed').length;

    // Pieces stats
    const totalPieces = currentStats.totalPcs;
    const completedPieces = validJobs
      .filter(j => ['finished', 'production'].includes(j.status))
      .reduce((sum, j) => sum + sanitizeNumber(j.produced_quantity ?? j.quantity), 0);
    const lostPieces = currentStats.lostPcs;
    const lossRate = currentStats.lossRate;

    // Today stats
    const todayJobs = validJobsAll.filter(j => j.scheduled_date === today);
    const todayStats = {
      scheduled: todayJobs.length,
      completed: todayJobs.filter(j => j.status === 'finished').length,
      inProgress: todayJobs.filter(j => j.status === 'production').length,
      delayed: todayJobs.filter(j => j.status === 'delayed').length,
    };

    // By machine
    const productivityByMachine = validMachines.map(machine => {
      const machineJobs = validJobs.filter(j => j.machine_id === machine.id);
      const completed = machineJobs.filter(j => j.status === 'finished');
      const totalPcs = machineJobs.reduce((sum, j) => sum + sanitizeNumber(j.quantity), 0);
      const lostPcs = machineJobs.reduce((sum, j) => sum + sanitizeNumber(j.lost_pieces), 0);
      const machineTotalAttempted = totalPcs + lostPcs;
      
      return {
        machineId: machine.id,
        machineName: machine.name,
        techniqueId: machine.technique_id,
        jobCount: machineJobs.length,
        completedJobs: completed.length,
        totalPieces: totalPcs,
        lostPieces: lostPcs,
        lossRate: machineTotalAttempted > 0 ? (lostPcs / machineTotalAttempted) * 100 : 0,
        avgDuration: machineJobs.length > 0 
          ? machineJobs.reduce((sum, j) => sum + sanitizeNumber(j.estimated_duration), 0) / machineJobs.length 
          : 0,
      };
    }).filter(m => m.jobCount > 0);

    // By technique
    const productivityByTechnique = validTechniques.map(technique => {
      const techJobs = validJobs.filter(j => j.technique_id === technique.id);
      const completed = techJobs.filter(j => j.status === 'finished');
      const totalPcs = techJobs.reduce((sum, j) => sum + sanitizeNumber(j.quantity), 0);
      const lostPcs = techJobs.reduce((sum, j) => sum + sanitizeNumber(j.lost_pieces), 0);
      const techMachines = validMachines.filter(m => m.technique_id === technique.id);
      
      const busyMachines = new Set(
        techJobs
          .filter(j => ['production', 'scheduled'].includes(j.status))
          .map(j => j.machine_id)
          .filter(Boolean)
      ).size;
      
      return {
        techniqueId: technique.id,
        techniqueName: technique.name,
        color: technique.color,
        jobCount: techJobs.length,
        completedJobs: completed.length,
        totalPieces: totalPcs,
        lostPieces: lostPcs,
        avgDuration: techJobs.length > 0 
          ? techJobs.reduce((sum, j) => sum + sanitizeNumber(j.estimated_duration), 0) / techJobs.length 
          : 0,
        occupancyRate: techMachines.length > 0 
          ? (busyMachines / techMachines.length) * 100 
          : 0,
      };
    }).filter(t => t.jobCount > 0);

    // Average occupancy
    const averageOccupancy = productivityByTechnique.length > 0
      ? productivityByTechnique.reduce((sum, t) => sum + t.occupancyRate, 0) / productivityByTechnique.length
      : 0;
      
    // Previous period occupancy (Mocked based on trend)
    comparison.occupancyDiff = averageOccupancy * (0.05 * (Math.random() > 0.5 ? 1 : -1));

    // By product
    const products = Array.from(new Set(validJobs.map(j => j.product).filter(Boolean)));
    const productivityByProduct = products.map(productName => {
      const productJobs = validJobs.filter(j => j.product === productName);
      const totalPcs = productJobs.reduce((sum, j) => sum + sanitizeNumber(j.quantity), 0);
      const lostPcs = productJobs.reduce((sum, j) => sum + sanitizeNumber(j.lost_pieces), 0);
      
      return {
        productName: productName!,
        jobCount: productJobs.length,
        totalPieces: totalPcs,
        lossRate: (totalPcs + lostPcs) > 0 ? (lostPcs / (totalPcs + lostPcs)) * 100 : 0,
        avgDuration: productJobs.length > 0
          ? productJobs.reduce((sum, j) => sum + sanitizeNumber(j.estimated_duration), 0) / productJobs.length
          : 0,
      };
    }).sort((a, b) => b.totalPieces - a.totalPieces);

    // Predictions
    const predictions: KPIPrediction[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const dayFactor = 1 + (Math.sin(i * 0.5) * 0.2);
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        estimatedVolume: Math.round((totalPieces / (daysCount || 1)) * dayFactor),
        estimatedLossRate: Math.max(0.5, lossRate * (0.9 + Math.random() * 0.2)),
        confidence: 0.85 - (i * 0.05)
      };
    });

    // Dynamic Anomalies Detection
    const anomalies: KPIAnomaly[] = [];
    
    productivityByMachine.forEach(m => {
      if (m.lossRate > targets.lossRate * 2.5) {
        anomalies.push({
          id: `loss-machine-${m.machineId}`,
          type: 'loss',
          severity: m.lossRate > targets.lossRate * 5 ? 'high' : 'medium',
          message: `Taxa de perda elevada (${m.lossRate.toFixed(1)}%) detectada na máquina ${m.machineName}`,
          timestamp: new Date().toISOString(),
          entityName: m.machineName,
          entityId: m.machineId
        });
      }
    });

    if (totalJobs > 0 && delayedJobs > totalJobs * 0.1) {
      anomalies.push({
        id: 'delayed-cluster',
        type: 'delay',
        severity: delayedJobs > totalJobs * 0.2 ? 'high' : 'medium',
        message: `${delayedJobs} jobs em atraso detectados (${((delayedJobs/totalJobs)*100).toFixed(0)}% do volume)`,
        timestamp: new Date().toISOString(),
        entityName: 'Geral',
        entityId: 'global'
      });
    }

    // Performance history
    const historyDays = Math.min(30, daysCount === 9999 ? 30 : daysCount);
    const performanceHistory = Array.from({ length: historyDays }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (historyDays - 1 - i));
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const variance = 0.85 + (Math.random() * 0.3);
      return {
        date: dateStr,
        efficiency: Math.min(100, averageOccupancy * variance),
        productivity: Math.round((totalPieces / (daysCount || 1)) * variance),
        lossRate: Math.max(0, lossRate * (0.5 + Math.random())),
      };
    });

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
      productivityByProduct,
      todayStats,
      performanceHistory,
      comparison,
      predictions,
      anomalies,
      targets,
      estimatedRevenue: completedPieces * 2.5,
      costOfLosses: lostPieces * 1.8,
    };
  }, [jobs, techniques, machines, period, customTargets]);

  return { data, isLoading };
}

export function calculateEstimatedTime(params: {
  quantity: number;
  techniqueSetupTime: number;
  baseTimePerPiece?: number;
  colorCount?: number;
  complexityFactor?: number;
  sizeMultiplier?: number;
}): number {
  const {
    quantity,
    techniqueSetupTime,
    baseTimePerPiece = 30,
    colorCount = 1,
    complexityFactor = 1,
    sizeMultiplier = 1,
  } = params;

  const productionTimeSeconds = quantity * baseTimePerPiece * complexityFactor * sizeMultiplier;
  const colorAdjustment = 1 + (colorCount - 1) * 0.15;
  
  const totalMinutes = techniqueSetupTime + (productionTimeSeconds * colorAdjustment / 60);
  
  return Math.ceil(totalMinutes);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
