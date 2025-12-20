import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChecklistItem {
  id: string;
  description: string;
  is_required: boolean;
  item_type: 'check' | 'measurement' | 'photo' | 'text';
}

export interface QualityChecklist {
  id: string;
  name: string;
  description?: string;
  technique_id?: string;
  items: ChecklistItem[];
  is_active: boolean;
}

// Simplified quality checklist using shift_checklist_templates
export function useQualityChecklists() {
  const { data: checklists, isLoading, error } = useQuery({
    queryKey: ['quality-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_checklist_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Map to QualityChecklist format
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        technique_id: template.technique_id,
        items: Array.isArray(template.items) 
          ? (template.items as any[]).map((item, i) => ({
              id: `${template.id}-${i}`,
              description: typeof item === 'string' ? item : item.description || '',
              is_required: true,
              item_type: 'check' as const,
            }))
          : [],
        is_active: template.is_active,
      })) as QualityChecklist[];
    },
  });

  return {
    checklists,
    isLoading,
    error,
    createChecklist: () => toast.info('Use o gerenciador de checklists de turno'),
    updateChecklist: () => {},
    deleteChecklist: () => {},
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  };
}

export function useQualityInspections(jobId?: string) {
  const { data: inspections, isLoading, error } = useQuery({
    queryKey: ['quality-inspections', jobId],
    queryFn: async () => {
      // Use lot_quality_inspections as base
      let query = supabase
        .from('lot_quality_inspections')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const canFinalizeJob = async (jobId: string) => {
    const { data } = await supabase
      .from('lot_quality_inspections')
      .select('result')
      .eq('lot_id', jobId);

    const rejected = data?.filter(i => i.result === 'failed').length || 0;
    if (rejected > 0) {
      return { canFinalize: false, reason: `${rejected} inspeção(ões) reprovada(s)` };
    }
    return { canFinalize: true };
  };

  return {
    inspections,
    isLoading,
    error,
    createInspection: () => toast.info('Registre inspeções via lotes de produção'),
    completeInspection: () => {},
    getPendingCount: async () => 0,
    canFinalizeJob,
    isCreating: false,
    isCompleting: false,
  };
}
