import { Job } from "@/types/job";

export interface BIMetrics {
  totalJobs: number;
  completedJobs: number;
  delayedJobs: number;
  totalPieces: number;
  completedPieces: number;
  lostPieces: number;
  avgEfficiency: string;
  statusDistribution: { name: string; value: number; color: string }[];
  dailyTrend: { date: string; fullDate: string; produced: number; jobs: number; lost: number; efficiency: number }[];
  lossImpact: number;
  machineUtilization?: { machine: string; technique: string; value: number; totalJobs: number; utilization: number }[];
  periodJobsList: BIJob[];
  toDoJobs: number;
  periodLossRate: number;
  techniquePerformance: any[];
  periodJobs: number;
  periodCompletedJobs: number;
  periodCompletedPieces: number;
  periodLostPieces: number;
  activeMachines: number;
  activeTechniques: number;
}

// Fixed BIJob type that is compatible with Table interfaces
export interface BIJob extends Omit<Job, 'status'> {
  status: string; // Keep as string for BI flexibility
  efficiency: string;
}

export interface BIProps {
  biMetrics: BIMetrics;
  kpis: any;
  oeeData: any;
  isLoading: boolean;
}
