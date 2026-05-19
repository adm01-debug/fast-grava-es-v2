import { Database } from "@/integrations/supabase/types";

export type JobStatus = 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled' | 'delayed' | 'rework' | 'buffer';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Job extends Partial<Omit<Database['public']['Tables']['jobs']['Row'], 'status' | 'priority' | 'order_number' | 'created_at'>> {
  id: string;
  order_number?: string | null;
  created_at?: string | null;
  status: JobStatus | any;
  priority?: JobPriority | any;
  product_name?: string | null;
  delay_time?: string | null;
  responsible_name?: string | null;
  efficiency?: string | number | null;
}

export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export interface JobWithRelations extends Job {
  machines?: { name: string; code: string } | null;
  techniques?: Database['public']['Tables']['techniques']['Row'] | null;
}
