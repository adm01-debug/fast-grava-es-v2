export interface TPMSchedule {
  id: string;
  machineId: string;
  type: 'preventive' | 'corrective' | 'predictive';
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
}
