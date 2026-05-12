export interface BIJob {
  id: string;
  order_number: string;
  product_name?: string;
  product?: string;
  status: string;
  quantity: number;
  produced_quantity: number;
  lost_pieces: number;
  delay_time?: string;
  machine_id?: string;
  technique_id?: string;
  efficiency?: string;
}

export interface BIMetrics {
  toDoJobs: number;
  periodLossRate: number;
  periodJobsList: BIJob[];
  dailyTrend: Array<{
    date: string;
    produced: number;
    lost: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  machineUtilization: Array<{
    machine: string;
    technique: string;
    totalJobs: number;
    utilization: number;
  }>;
  periodCompletedJobs: number;
  periodCompletedPieces: number;
  periodLostPieces: number;
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
