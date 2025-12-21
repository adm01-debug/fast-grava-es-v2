export interface QualityCheck {
  id: string;
  jobId: string;
  checkType: string;
  result: 'pass' | 'fail';
  measurements?: Record<string, number>;
  inspector: string;
  timestamp: string;
}
