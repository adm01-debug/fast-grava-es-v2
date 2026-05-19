export interface AuditEntry {
  id: string;
  action: string;
  actor_id: string;
  actor_name?: string;
  entity_type: string;
  entity_id: string;
  old_data: any;
  new_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
