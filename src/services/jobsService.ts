import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export const JobsService = {
  async getAll(filters?: { status?: string; technique_id?: string; date?: string }): Promise<any[]> {
    let query = supabase.from('jobs').select('*, machines(name, code), techniques:technique_id(*)');
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.technique_id) query = query.eq('technique_id', filters.technique_id);
    if (filters?.date) query = query.eq('scheduled_date', filters.date);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Job> {
    const { data, error } = await supabase.from('jobs').select('*, machines(name, code)').eq('id', id).single();
    if (error) throw error;
    return data as Job;
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

  async getByDateRange(start: string, end: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, machines(name, code)')
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .order('scheduled_date');
    if (error) throw error;
    return data || [];
  },
};
