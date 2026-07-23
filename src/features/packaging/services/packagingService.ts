import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type {
  PackagingTask,
  PackagingTaskStatus,
  DefectTriageForm,
  PackagingRegisterForm,
} from '../types/packaging.schema';

export interface PackagingTaskWithJob extends PackagingTask {
  jobs?: {
    id: string;
    order_number: string | null;
    client: string | null;
    product: string | null;
    quantity: number | null;
    technique_id: string | null;
    techniques?: { name: string; short_name: string } | null;
  } | null;
}

export interface PackagingDefectRow {
  id: string;
  packaging_task_id: string;
  quantity: number;
  defect_type: string;
  severity: string;
  decision: string;
  photo_url: string | null;
  reported_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const packagingService = {
  async listTasks(filter?: { status?: PackagingTaskStatus | PackagingTaskStatus[] }): Promise<PackagingTaskWithJob[]> {
    let query = supabase
      .from('packaging_tasks' as never)
      .select('*, jobs:job_id (id, order_number, client, product, quantity, technique_id, techniques:technique_id (name, short_name))')
      .order('created_at', { ascending: false });

    if (filter?.status) {
      if (Array.isArray(filter.status)) {
        query = query.in('status', filter.status);
      } else {
        query = query.eq('status', filter.status);
      }
    }

    const { data, error } = await query;
    if (error) {
      logger.error('packagingService.listTasks failed', error, 'packagingService');
      throw error;
    }
    return (data ?? []) as unknown as PackagingTaskWithJob[];
  },

  async getTask(id: string): Promise<PackagingTaskWithJob | null> {
    const { data, error } = await supabase
      .from('packaging_tasks' as never)
      .select('*, jobs:job_id (id, order_number, client, product, quantity, technique_id, techniques:technique_id (name, short_name))')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      logger.error('packagingService.getTask failed', error, 'packagingService');
      throw error;
    }
    return (data as unknown as PackagingTaskWithJob) ?? null;
  },

  async assignToMe(taskId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    // Optimistic lock: only take if unassigned or already mine.
    const { error } = await supabase
      .from('packaging_tasks' as never)
      .update({ assigned_to: user.id, status: 'in_triage', started_at: new Date().toISOString() })
      .eq('id', taskId)
      .or(`assigned_to.is.null,assigned_to.eq.${user.id}`);
    if (error) throw error;
  },

  async updateStatus(taskId: string, status: PackagingTaskStatus): Promise<void> {
    const patch: Record<string, unknown> = { status };
    if (status === 'ready_to_ship') patch.completed_at = new Date().toISOString();
    const { error } = await supabase
      .from('packaging_tasks' as never)
      .update(patch)
      .eq('id', taskId);
    if (error) throw error;
  },

  async registerPackaging(taskId: string, values: PackagingRegisterForm): Promise<void> {
    const { error } = await supabase
      .from('packaging_tasks' as never)
      .update({
        package_type: values.package_type,
        packages_count: values.packages_count,
        total_weight_kg: values.total_weight_kg ?? null,
        approved_quantity: values.approved_quantity,
        notes: values.notes ?? null,
        status: 'packaging',
      })
      .eq('id', taskId);
    if (error) throw error;
  },

  async listDefects(taskId: string): Promise<PackagingDefectRow[]> {
    const { data, error } = await supabase
      .from('packaging_defects' as never)
      .select('*')
      .eq('packaging_task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as PackagingDefectRow[];
  },

  async recordDefect(taskId: string, form: DefectTriageForm): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase.from('packaging_defects' as never).insert({
      packaging_task_id: taskId,
      quantity: form.quantity,
      defect_type: form.defect_type,
      severity: form.severity,
      decision: form.decision,
      photo_url: form.photo_url || null,
      notes: form.notes ?? null,
      reported_by: user.id,
    });
    if (error) throw error;

    // Increment rejected count on parent task
    const { data: task } = await supabase
      .from('packaging_tasks' as never)
      .select('rejected_quantity')
      .eq('id', taskId)
      .single();
    if (task) {
      const current = (task as { rejected_quantity: number }).rejected_quantity ?? 0;
      await supabase
        .from('packaging_tasks' as never)
        .update({ rejected_quantity: current + form.quantity })
        .eq('id', taskId);
    }
  },

  async uploadDefectPhoto(taskId: string, file: File): Promise<string> {
    const path = `packaging/${taskId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from('production-photos').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('production-photos').createSignedUrl
      ? await supabase.storage.from('production-photos').createSignedUrl(path, 60 * 60 * 24 * 30)
      : { data: { signedUrl: '' } };
    return data?.signedUrl ?? '';
  },
};
