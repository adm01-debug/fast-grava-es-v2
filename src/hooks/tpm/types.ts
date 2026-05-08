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
  machine?: { id: string; name: string; code: string; technique_id?: string };
  maintenance_type?: MaintenanceType;
}

export interface MaintenanceChecklist {
  id: string;
  maintenance_type_id: string;
  technique_id: string | null;
  name: string;
  description: string | null;
  version: number;
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
  status: 'in_progress' | 'completed' | 'approved' | 'cancelled' | 'pending_parts' | 'correction_requested';
  correction_notes: string | null;
  correction_deadline: string | null;
  notes: string | null;
  photos: string[];
  total_cost: number;
  downtime_minutes: number;
  signature_url: string | null;
  approver_id: string | null;
  approved_at: string | null;
  next_scheduled_date_after_approval: string | null;
  checklist_version: number | null;
  checklist_snapshot: any | null;
  created_at: string;
  technical_sheet_id?: string | null;
  technical_sheet_version?: number | null;
  adjustment_parameters?: any | null;
  quality_checklist_results?: any | null;
  failure_risk_detected?: boolean;
  supplies_used?: Array<{
    name: string;
    quantity: string;
    alternative_used?: boolean;
    original_recommended_id?: string;
  }>;
  execution_alerts?: Array<{
    alert_type: string;
    parameter_name?: string;
    expected_range?: string;
    actual_value?: string;
    severity?: string;
    description?: string;
    evidence_urls?: string[];
  }>;
  schedule?: MaintenanceSchedule;
  machine?: { id: string; name: string; code: string; technique_id?: string };
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
  machine?: { id: string; name: string; code: string; technique_id?: string };
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
