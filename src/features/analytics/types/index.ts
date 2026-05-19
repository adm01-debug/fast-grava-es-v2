import { DbJob, DbMachine, DbTechnique } from '@/features/jobs';

export interface BIJob {
  id: string;
  order_number: string | null;
  product_name?: string | null;
  product?: string | null;
  status: string;
  quantity: number;
  produced_quantity: number | null;
  lost_pieces: number | null;
  delay_time?: string | null;
  machine_id?: string | null;
  technique_id?: string | null;
  efficiency?: string | number | null;
  actual_end_time?: string | null;
  created_at?: string | null;
}

export interface BIMetrics {
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  dailyTrend: Array<{
    date: string;
    fullDate: string;
    jobs: number;
    produced: number;
    lost: number;
    efficiency: number;
  }>;
  techniquePerformance: Array<{
    id: string;
    name: string;
    jobs: number;
    produced: number;
    lost: number;
    machines: number;
    quality: number;
    color: string;
  }>;
  machineUtilization: Array<{
    id: string;
    name: string;
    technique: string;
    totalJobs: number;
    completedJobs: number;
    utilization: number;
  }>;
  periodJobs: number;
  periodJobsList: BIJob[];
  periodCompletedJobs: number;
  periodCompletedPieces: number;
  periodLostPieces: number;
  periodLossRate: number;
  toDoJobs: number;
  activeMachines: number;
  activeTechniques: number;
  productionTrend?: string;
  trendPercentage?: string;
}

export interface BIProps {
  isLoading?: boolean;
  biMetrics: BIMetrics;
  kpis: {
    inProgressJobs: number;
    delayedJobs: number;
  };
  oeeData: {
    overallAvailability: number;
    overallOEE: number;
    overallPerformance: number;
    overallQuality: number;
  };
}

export interface MachineLoad {
  machine: DbMachine;
  technique: DbTechnique;
  scheduledMinutes: number;
  availableMinutes: number;
  occupancyRate: number;
  jobCount: number;
  jobs: DbJob[];
}

export interface LoadBalancingSuggestion {
  id?: string;
  jobId: string;
  orderNumber: string;
  client: string;
  product?: string;
  estimatedDuration?: number;
  currentMachineId: string;
  currentMachineName: string;
  suggestedMachineId: string;
  suggestedMachineName: string;
  currentLoad: number; // percentage
  suggestedLoad: number; // percentage
  loadDifference: number; // percentage points saved
}

export interface TechniqueLoadSummary {
  technique: DbTechnique;
  machines: MachineLoad[];
  averageOccupancy: number;
  maxOccupancy: number;
  minOccupancy: number;
  isUnbalanced: boolean; // > 30% difference between min/max
  suggestions: LoadBalancingSuggestion[];
}

