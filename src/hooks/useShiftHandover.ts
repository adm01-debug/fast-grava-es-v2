import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface ShiftHandover {
  id: string;
  shift_date: string;
  shift_type: 'morning' | 'afternoon' | 'night';
  outgoing_operator_id: string;
  incoming_operator_id: string | null;
  machine_id: string | null;
  status: 'open' | 'pending_acceptance' | 'completed' | 'cancelled';
  general_notes: string | null;
  started_at: string;
  completed_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  machine?: { id: string; name: string; code: string };
  outgoing_profile?: { id: string; full_name: string | null };
  incoming_profile?: { id: string; full_name: string | null };
}

export interface ShiftChecklistItem {
  id: string;
  handover_id: string;
  item_description: string;
  is_checked: boolean;
  checked_at: string | null;
  notes: string | null;
  item_order: number;
  created_at: string;
}

export interface ShiftPendingTask {
  id: string;
  handover_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  machine_id: string | null;
  job_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  machine?: { id: string; name: string; code: string };
  job?: { id: string; order_number: string; product: string };
}

export interface ShiftOccurrence {
  id: string;
  handover_id: string;
  occurrence_type: 'incident' | 'maintenance' | 'quality' | 'safety' | 'production' | 'other';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  machine_id: string | null;
  job_id: string | null;
  occurred_at: string;
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  photos: string[];
  created_at: string;
  machine?: { id: string; name: string; code: string };
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  items: { description: string; order: number }[];
  machine_id: string | null;
  technique_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const SHIFT_TYPE_LABELS = {
  morning: 'Manhã (06:00 - 14:00)',
  afternoon: 'Tarde (14:00 - 22:00)',
  night: 'Noite (22:00 - 06:00)'
};

function getCurrentShiftType(): 'morning' | 'afternoon' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
}

export function useShiftHandovers(filters?: { 
  date?: string; 
  machineId?: string; 
  status?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['shift-handovers', filters],
    queryFn: async () => {
      let query = supabase
        .from('shift_handovers')
        .select(`
          *,
          machine:machines(id, name, code)
        `)
        .order('started_at', { ascending: false });

      if (filters?.date) {
        query = query.eq('shift_date', filters.date);
      }
      if (filters?.machineId) {
        query = query.eq('machine_id', filters.machineId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      const operatorIds = [...new Set(data.flatMap(h => [h.outgoing_operator_id, h.incoming_operator_id].filter(Boolean)))];
      
      let profileMap = new Map<string, { id: string; full_name: string | null }>();
      if (operatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', operatorIds);
        profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      }


      return data.map(h => ({
        ...h,
        outgoing_profile: profileMap.get(h.outgoing_operator_id) || null,
        incoming_profile: h.incoming_operator_id ? profileMap.get(h.incoming_operator_id) || null : null
      })) as ShiftHandover[];
    }
  });
}

export function useShiftHandover(id: string | null) {
  return useQuery({
    queryKey: ['shift-handover', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('shift_handovers')
        .select(`
          *,
          machine:machines(id, name, code)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch profiles
      const operatorIds = [data.outgoing_operator_id, data.incoming_operator_id].filter(Boolean);
      let profileMap = new Map<string, { id: string; full_name: string | null }>();
      if (operatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', operatorIds);
        profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      }

      return {
        ...data,
        outgoing_profile: profileMap.get(data.outgoing_operator_id) || null,
        incoming_profile: data.incoming_operator_id ? profileMap.get(data.incoming_operator_id) || null : null
      } as ShiftHandover;
    },
    enabled: !!id
  });
}

export function useShiftChecklist(handoverId: string | null) {
  return useQuery({
    queryKey: ['shift-checklist', handoverId],
    queryFn: async () => {
      if (!handoverId) return [];
      
      const { data, error } = await supabase
        .from('shift_handover_checklist')
        .select('*')
        .eq('handover_id', handoverId)
        .order('item_order');

      if (error) throw error;
      return data as ShiftChecklistItem[];
    },
    enabled: !!handoverId
  });
}

export function useShiftPendingTasks(handoverId?: string | null, includeAll?: boolean) {
  return useQuery({
    queryKey: ['shift-pending-tasks', handoverId, includeAll],
    queryFn: async () => {
      let query = supabase
        .from('shift_pending_tasks')
        .select(`
          *,
          machine:machines(id, name, code),
          job:jobs(id, order_number, product)
        `)
        .order('created_at', { ascending: false });

      if (handoverId) {
        query = query.eq('handover_id', handoverId);
      }
      
      if (!includeAll) {
        query = query.in('status', ['pending', 'in_progress']);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShiftPendingTask[];
    }
  });
}

export function useShiftOccurrences(handoverId?: string | null, filters?: {
  machineId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['shift-occurrences', handoverId, filters],
    queryFn: async () => {
      let query = supabase
        .from('shift_occurrences')
        .select(`
          *,
          machine:machines(id, name, code)
        `)
        .order('occurred_at', { ascending: false });

      if (handoverId) {
        query = query.eq('handover_id', handoverId);
      }
      if (filters?.machineId) {
        query = query.eq('machine_id', filters.machineId);
      }
      if (filters?.type) {
        query = query.eq('occurrence_type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('occurred_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('occurred_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShiftOccurrence[];
    }
  });
}

export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_checklist_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as ChecklistTemplate[];
    }
  });
}

export function useShiftHandoverMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createHandover = useMutation({
    mutationFn: async (data: {
      shift_type?: 'morning' | 'afternoon' | 'night';
      machine_id?: string | null;
      general_notes?: string;
      checklist_items?: string[];
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: handover, error } = await supabase
        .from('shift_handovers')
        .insert({
          shift_type: data.shift_type || getCurrentShiftType(),
          outgoing_operator_id: user.id,
          machine_id: data.machine_id || null,
          general_notes: data.general_notes || null
        })
        .select()
        .single();

      if (error) throw error;

      // Create checklist items if provided
      if (data.checklist_items && data.checklist_items.length > 0) {
        const checklistItems = data.checklist_items.map((item, index) => ({
          handover_id: handover.id,
          item_description: item,
          item_order: index
        }));

        const { error: checklistError } = await supabase
          .from('shift_handover_checklist')
          .insert(checklistItems);

        if (checklistError) throw checklistError;
      }

      return handover;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] });
      toast.success('Passagem de turno iniciada');
    },
    onError: (error) => {
      toast.error('Erro ao iniciar passagem: ' + error.message);
    }
  });

  const updateHandover = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ShiftHandover> & { id: string }) => {
      const { error } = await supabase
        .from('shift_handovers')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['shift-handover'] });
      toast.success('Passagem atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const completeHandover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shift_handovers')
        .update({
          status: 'pending_acceptance',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['shift-handover'] });
      toast.success('Passagem finalizada, aguardando aceite');
    },
    onError: (error) => {
      toast.error('Erro ao finalizar: ' + error.message);
    }
  });

  const acceptHandover = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('shift_handovers')
        .update({
          status: 'completed',
          incoming_operator_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] });
      queryClient.invalidateQueries({ queryKey: ['shift-handover'] });
      toast.success('Passagem de turno aceita');
    },
    onError: (error) => {
      toast.error('Erro ao aceitar: ' + error.message);
    }
  });

  const updateChecklistItem = useMutation({
    mutationFn: async ({ id, is_checked, notes }: { id: string; is_checked: boolean; notes?: string }) => {
      const { error } = await supabase
        .from('shift_handover_checklist')
        .update({
          is_checked,
          checked_at: is_checked ? new Date().toISOString() : null,
          notes: notes || null
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-checklist'] });
    }
  });

  const addPendingTask = useMutation({
    mutationFn: async (data: Omit<ShiftPendingTask, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'completed_by' | 'machine' | 'job'>) => {
      const { error } = await supabase
        .from('shift_pending_tasks')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-pending-tasks'] });
      toast.success('Pendência adicionada');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar pendência: ' + error.message);
    }
  });

  const updatePendingTask = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ShiftPendingTask> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      
      if (data.status === 'completed' && user) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      }

      const { error } = await supabase
        .from('shift_pending_tasks')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-pending-tasks'] });
      toast.success('Pendência atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const addOccurrence = useMutation({
    mutationFn: async (data: Omit<ShiftOccurrence, 'id' | 'created_at' | 'resolved_at' | 'resolved_by' | 'machine'>) => {
      const { error } = await supabase
        .from('shift_occurrences')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-occurrences'] });
      toast.success('Ocorrência registrada');
    },
    onError: (error) => {
      toast.error('Erro ao registrar ocorrência: ' + error.message);
    }
  });

  const resolveOccurrence = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('shift_occurrences')
        .update({
          resolution,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-occurrences'] });
      toast.success('Ocorrência resolvida');
    },
    onError: (error) => {
      toast.error('Erro ao resolver: ' + error.message);
    }
  });

  return {
    createHandover,
    updateHandover,
    completeHandover,
    acceptHandover,
    updateChecklistItem,
    addPendingTask,
    updatePendingTask,
    addOccurrence,
    resolveOccurrence
  };
}

export { SHIFT_TYPE_LABELS, getCurrentShiftType };
