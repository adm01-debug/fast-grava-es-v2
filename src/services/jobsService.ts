import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Job = Database['public']['Tables']['jobs']['Row'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export interface JobWithRelations extends Job {
  machines: { name: string; code: string } | null;
  techniques: Database['public']['Tables']['techniques']['Row'] | null;
}

export const jobsService = {
  async getAll(filters?: { status?: string; technique_id?: string; date?: string }): Promise<JobWithRelations[]> {
    let query = supabase.from('jobs').select('*, machines(name, code), techniques:technique_id(*)');
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.technique_id) query = query.eq('technique_id', filters.technique_id);
    if (filters?.date) query = query.eq('scheduled_date', filters.date);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as JobWithRelations[];
  },

  async getById(id: string): Promise<JobWithRelations> {
    const { data, error } = await supabase.from('jobs').select('*, machines(name, code), techniques:technique_id(*)').eq('id', id).single();
    if (error) throw error;
    return data as JobWithRelations;
  },

  async create(job: JobInsert): Promise<Job> {
    const { data, error } = await supabase.from('jobs').insert(job).select().single();
    if (error) throw error;
    return data as Job;
  },

  async update(id: string, updates: JobUpdate): Promise<Job> {
    const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Job;
  },

  async updateStatus(id: string, status: string): Promise<Job> {
    return this.update(id, { status, updated_at: new Date().toISOString() });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
  },

  async getByDateRange(start: string, end: string): Promise<JobWithRelations[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, machines(name, code), techniques:technique_id(*)')
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .order('scheduled_date');
    if (error) throw error;
    return (data || []) as JobWithRelations[];
  },
};
