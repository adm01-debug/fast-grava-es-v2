import { useMemo } from 'react';
import { useJobs, useTechniques, useMachines, DbJob, DbMachine, DbTechnique } from './useJobs';

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
  
  // Time-based
  todayStats: {
    scheduled: number;
    completed: number;
    inProgress: number;
    delayed: number;
  };
}

export function useKPIs(): { data: KPIData | null; isLoading: boolean } {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: techniques, isLoading: techniquesLoading } = useTechniques();
  const { data: machines, isLoading: machinesLoading } = useMachines();

  const isLoading = jobsLoading || techniquesLoading || machinesLoading;

  const data = useMemo(() => {
    if (!jobs || !techniques || !machines) return null;

    // Validate and filter data
    const validJobs = jobs.filter(isValidJob);
    const validMachines = machines.filter(isValidMachine);
    const validTechniques = techniques.filter(isValidTechnique);

    if (validJobs.length === 0 && jobs.length > 0) {
      if (import.meta.env.DEV) console.warn('[useKPIs] All jobs failed validation');
    }

    const today = new Date().toISOString().split('T')[0];

    // Overview stats
    const totalJobs = validJobs.length;
    const completedJobs = validJobs.filter(j => j.status === 'finished').length;
    const inProgressJobs = validJobs.filter(j => j.status === 'production').length;
    const delayedJobs = validJobs.filter(j => j.status === 'delayed').length;

    // Pieces stats with sanitization — include in-production jobs for real-time visibility
    const totalPieces = validJobs.reduce((sum, j) => sum + sanitizeNumber(j.quantity), 0);
    const productionStatuses = ['finished', 'production'];
    const completedPieces = validJobs
      .filter(j => productionStatuses.includes(j.status))
      .reduce((sum, j) => sum + sanitizeNumber(j.produced_quantity ?? j.quantity), 0);
    const lostPieces = validJobs
      .filter(j => productionStatuses.includes(j.status))
      .reduce((sum, j) => sum + sanitizeNumber(j.lost_pieces), 0);
    const totalAttempted = completedPieces + lostPieces;
    const lossRate = totalAttempted > 0 ? (lostPieces / totalAttempted) * 100 : 0;

    // Today stats
    const todayJobs = validJobs.filter(j => j.scheduled_date === today);
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
        // Use consistent formula: lostPieces / (totalPieces + lostPieces) 
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
      
      // Calculate occupancy (simplified: jobs in progress or scheduled / total machines)
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
          ? techJobs.reduce((sum, j) => sum + j.estimated_duration, 0) / techJobs.length 
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
      todayStats,
    };
  }, [jobs, techniques, machines]);

  return { data, isLoading };
}

// Time calculation helper
export function calculateEstimatedTime(params: {
  quantity: number;
  techniqueSetupTime: number;
  baseTimePerPiece?: number; // in seconds
  colorCount?: number;
  complexityFactor?: number; // 1 = simple, 2 = medium, 3 = complex
  sizeMultiplier?: number; // 1 = small, 1.5 = medium, 2 = large
}): number {
  const {
    quantity,
    techniqueSetupTime,
    baseTimePerPiece = 30, // 30 seconds per piece default
    colorCount = 1,
    complexityFactor = 1,
    sizeMultiplier = 1,
  } = params;

  // Calculate production time in minutes
  const productionTimeSeconds = quantity * baseTimePerPiece * complexityFactor * sizeMultiplier;
  const colorAdjustment = 1 + (colorCount - 1) * 0.15; // 15% extra per additional color
  
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
