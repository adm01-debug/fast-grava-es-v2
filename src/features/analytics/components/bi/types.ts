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
  dailyProduction: { date: string; pieces: number; efficiency: number }[];
  lossImpact: number;
}

// Fixed BIJob type that is compatible with Table interfaces
export interface BIJob extends Omit<Job, 'status'> {
  status: string; // Keep as string for BI flexibility
  efficiency: string;
}
