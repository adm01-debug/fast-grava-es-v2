export interface OEEData {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  timestamp: string;
}

export interface OEELoss {
  type: 'availability' | 'performance' | 'quality';
  reason: string;
  duration: number;
  impact: number;
}
