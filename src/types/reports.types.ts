export interface Report {
  id: string;
  type: ReportType;
  title: string;
  data: Record<string, any>;
  period: { start: string; end: string };
  created_at: string;
}

export type ReportType = 'production' | 'quality' | 'oee' | 'efficiency' | 'costs';
