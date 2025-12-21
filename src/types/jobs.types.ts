export interface Job {
  id: string;
  order_number: string;
  client: string;
  product: string;
  quantity: number;
  status: JobStatus;
  technique: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
}

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
