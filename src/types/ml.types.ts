export interface MLPrediction {
  id: string;
  type: 'delay' | 'failure' | 'quality';
  probability: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
  timestamp: string;
}
