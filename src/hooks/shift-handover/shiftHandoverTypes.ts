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

export const SHIFT_TYPE_LABELS = {
  morning: 'Manhã (06:00 - 14:00)',
  afternoon: 'Tarde (14:00 - 22:00)',
  night: 'Noite (22:00 - 06:00)'
};

export function getCurrentShiftType(): 'morning' | 'afternoon' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'morning';
  if (hour >= 14 && hour < 22) return 'afternoon';
  return 'night';
}
