import { useMemo } from 'react';
import { useJobs, useTechniques, useMachines } from './useJobs';

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

    const today = new Date().toISOString().split('T')[0];

    // Overview stats
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'finished').length;
    const inProgressJobs = jobs.filter(j => j.status === 'production').length;
    const delayedJobs = jobs.filter(j => j.status === 'delayed').length;

    // Pieces stats
    const totalPieces = jobs.reduce((sum, j) => sum + j.quantity, 0);
    const completedPieces = jobs
      .filter(j => j.status === 'finished')
      .reduce((sum, j) => sum + j.quantity, 0);
    const lostPieces = jobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
    const lossRate = completedPieces > 0 ? (lostPieces / completedPieces) * 100 : 0;

    // Today stats
    const todayJobs = jobs.filter(j => j.scheduled_date === today);
    const todayStats = {
      scheduled: todayJobs.length,
      completed: todayJobs.filter(j => j.status === 'finished').length,
      inProgress: todayJobs.filter(j => j.status === 'production').length,
      delayed: todayJobs.filter(j => j.status === 'delayed').length,
    };

    // By machine
    const productivityByMachine = machines.map(machine => {
      const machineJobs = jobs.filter(j => j.machine_id === machine.id);
      const completed = machineJobs.filter(j => j.status === 'finished');
      const totalPcs = machineJobs.reduce((sum, j) => sum + j.quantity, 0);
      const lostPcs = machineJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
      
      return {
        machineId: machine.id,
        machineName: machine.name,
        techniqueId: machine.technique_id,
        jobCount: machineJobs.length,
        completedJobs: completed.length,
        totalPieces: totalPcs,
        lostPieces: lostPcs,
        lossRate: totalPcs > 0 ? (lostPcs / totalPcs) * 100 : 0,
        avgDuration: machineJobs.length > 0 
          ? machineJobs.reduce((sum, j) => sum + j.estimated_duration, 0) / machineJobs.length 
          : 0,
      };
    }).filter(m => m.jobCount > 0);

    // By technique
    const productivityByTechnique = techniques.map(technique => {
      const techJobs = jobs.filter(j => j.technique_id === technique.id);
      const completed = techJobs.filter(j => j.status === 'finished');
      const totalPcs = techJobs.reduce((sum, j) => sum + j.quantity, 0);
      const lostPcs = techJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
      const techMachines = machines.filter(m => m.technique_id === technique.id);
      
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
