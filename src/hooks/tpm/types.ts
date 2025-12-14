// TPM Types and Interfaces

export interface MaintenanceType {
  id: string;
  name: string;
  description: string | null;
  default_interval_days: number;
  color: string;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  machine_id: string;
  maintenance_type_id: string;
  name: string;
  description: string | null;
  interval_days: number;
  last_completed_at: string | null;
  next_due_at: string;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  machine?: { id: string; name: string; code: string };
  maintenance_type?: MaintenanceType;
}

export interface MaintenanceChecklist {
  id: string;
  maintenance_type_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: MaintenanceChecklistItem[];
}

export interface MaintenanceChecklistItem {
  id: string;
  checklist_id: string;
  item_order: number;
  description: string;
  is_critical: boolean;
  requires_photo: boolean;
  requires_measurement: boolean;
  measurement_unit: string | null;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  schedule_id: string;
  machine_id: string;
  maintenance_type_id: string;
  performed_by: string | null;
  performed_by_name: string | null;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'cancelled' | 'pending_parts';
  notes: string | null;
  photos: string[];
  total_cost: number;
  downtime_minutes: number;
  created_at: string;
  schedule?: MaintenanceSchedule;
  machine?: { id: string; name: string; code: string };
}

export interface MaintenanceAlert {
  id: string;
  schedule_id: string;
  machine_id: string;
  alert_type: 'upcoming' | 'due' | 'overdue' | 'critical';
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  schedule?: MaintenanceSchedule;
  machine?: { id: string; name: string; code: string };
}

export interface TPMStats {
  totalScheduled: number;
  dueToday: number;
  overdue: number;
  upcoming7Days: number;
  completedThisMonth: number;
  activeAlerts: number;
  criticalAlerts: number;
}

export interface SchedulesByStatus {
  overdue: MaintenanceSchedule[];
  dueToday: MaintenanceSchedule[];
  upcoming: MaintenanceSchedule[];
}

// Error context for debugging
export const TPM_ERROR_CONTEXT = {
  types: { hook: 'useTPM', entity: 'maintenance_types' },
  schedules: { hook: 'useTPM', entity: 'maintenance_schedules' },
  checklists: { hook: 'useTPM', entity: 'maintenance_checklists' },
  records: { hook: 'useTPM', entity: 'maintenance_records' },
  alerts: { hook: 'useTPM', entity: 'maintenance_alerts' },
  machines: { hook: 'useTPM', entity: 'machines' },
};
