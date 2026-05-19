import { Database } from "@/integrations/supabase/types";

export type JobStatus = 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled' | 'delayed' | 'rework' | 'buffer';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Job extends Omit<Database['public']['Tables']['jobs']['Row'], 'status' | 'priority'> {
  status: JobStatus;
  priority: JobPriority;
}

export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export interface JobWithRelations extends Job {
  machines: { name: string; code: string } | null;
  techniques: Database['public']['Tables']['techniques']['Row'] | null;
}
