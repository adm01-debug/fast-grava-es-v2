import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShiftHandover, ShiftChecklistItem, ShiftPendingTask, ShiftOccurrence, ChecklistTemplate } from './shiftHandoverTypes';

export function useShiftHandovers(filters?: { date?: string; machineId?: string; status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['shift-handovers', filters],
    queryFn: async () => {
      let query = supabase.from('shift_handovers').select(`*, machine:machines(id, name, code)`).order('started_at', { ascending: false });
      if (filters?.date) query = query.eq('shift_date', filters.date);
      if (filters?.machineId) query = query.eq('machine_id', filters.machineId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.limit) query = query.limit(filters.limit);
      const { data, error } = await query;
      if (error) throw error;

      const operatorIds = [...new Set(data.flatMap(h => [h.outgoing_operator_id, h.incoming_operator_id].filter(Boolean)))];
      let profileMap = new Map<string, { id: string; full_name: string | null }>();
      if (operatorIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', operatorIds as string[]);
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
      const { data, error } = await supabase.from('shift_handovers').select(`*, machine:machines(id, name, code)`).eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const operatorIds = [data.outgoing_operator_id, data.incoming_operator_id].filter((id): id is string => !!id);
      let profileMap = new Map<string, { id: string; full_name: string | null }>();
      if (operatorIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', operatorIds);
        profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      }

      return { ...data, outgoing_profile: profileMap.get(data.outgoing_operator_id) || null, incoming_profile: data.incoming_operator_id ? profileMap.get(data.incoming_operator_id) || null : null } as ShiftHandover;
    },
    enabled: !!id
  });
}

export function useShiftChecklist(handoverId: string | null) {
  return useQuery({
    queryKey: ['shift-checklist', handoverId],
    queryFn: async () => {
      if (!handoverId) return [];
      const { data, error } = await supabase.from('shift_handover_checklist').select('*').eq('handover_id', handoverId).order('item_order');
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
      let query = supabase.from('shift_pending_tasks').select(`*, machine:machines(id, name, code), job:jobs(id, order_number, product)`).order('created_at', { ascending: false });
      if (handoverId) query = query.eq('handover_id', handoverId);
      if (!includeAll) query = query.in('status', ['pending', 'in_progress']);
      const { data, error } = await query;
      if (error) throw error;
      return data as ShiftPendingTask[];
    }
  });
}

export function useShiftOccurrences(handoverId?: string | null, filters?: { machineId?: string; type?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['shift-occurrences', handoverId, filters],
    queryFn: async () => {
      let query = supabase.from('shift_occurrences').select(`*, machine:machines(id, name, code)`).order('occurred_at', { ascending: false });
      if (handoverId) query = query.eq('handover_id', handoverId);
      if (filters?.machineId) query = query.eq('machine_id', filters.machineId);
      if (filters?.type) query = query.eq('occurrence_type', filters.type);
      if (filters?.startDate) query = query.gte('occurred_at', filters.startDate);
      if (filters?.endDate) query = query.lte('occurred_at', filters.endDate);
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
      const { data, error } = await supabase.from('shift_checklist_templates').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data as ChecklistTemplate[];
    }
  });
}
