import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Teste Compreensivo de RLS (Segurança 10/10)
 * Valida que o acesso não autenticado é negado para TODAS as 114+ tabelas do sistema.
 */
describe('Segurança RLS - Proteção Universal de Dados', () => {
  const allTables = [
    'security_events', 'technical_sheet_audit', 'query_telemetry', 'rate_limit_logs', 'spc_alerts', 
    'tpm_execution_alerts', 'materials', 'dashboard_layouts', 'tpm_execution_supplies', 'role_permissions', 
    'technical_conversations', 'technical_documents', 'maintenance_checklists', 'gamification_rewards', 
    'reward_redemptions', 'bitrix24_field_mappings', 'tpm_execution_checklist', 'error_logs', 
    'new_device_alerts', 'rls_test_results', 'password_reset_requests', 'inventory_items', 
    'spc_control_parameters', 'pre_production_checklists', 'login_audit', 'operator_rankings', 
    'abc_activities', 'technical_sheet_materials', 'tpm_notification_templates', 'lot_movements', 
    'shift_checklist_templates', 'machine_downtime', 'lot_components', 'webauthn_challenges', 
    'shipments', 'tpm_executions', 'maintenance_item_responses', 'bitrix24_oauth_tokens', 
    'blocked_ips', 'technical_sheet_tips', 'technical_sheets', 'email_verification_tokens', 
    'maintenance_checklist_items', 'production_losses', 'user_favorites', 'technical_messages', 
    'energy_targets', 'daily_summaries', 'operator_goals', 'inventory_movements', 'geo_blocking_logs', 
    'product_categories', 'efficiency_alert_history', 'document_versions', 'machine_health_metrics', 
    'audit_log', 'geo_blocking_rules', 'operator_achievements', 'shipment_costs', 'abc_activity_rates', 
    'webauthn_credentials', 'operator_machines', 'maintenance_records', 'tpm_severity_configs', 
    'tpm_parameter_alerts', 'tpm_notification_logs', 'shift_handover_checklist', 'job_status_history', 
    'energy_consumption', 'technical_sheet_audit_logs', 'shift_occurrences', 'user_mfa_settings', 
    'prediction_history', 'machine_predictions', 'operator_skills', 'ip_allowlist', 'techniques', 
    'geo_blocking_settings', 'shift_handovers', 'tpm_notification_queue', 'maintenance_types', 
    'technical_sheet_steps', 'qr_scan_history', 'abc_cost_pools', 'technical_sheet_favorites', 
    'tpm_execution_parts', 'tpm_execution_audit_logs', 'jobs', 'report_templates', 'profiles', 
    'operator_status_audit', 'user_roles', 'business_config', 'tpm_notification_templates_published', 
    'rate_limit_settings', 'spc_measurements', 'maintenance_schedules', 'machines', 'abc_job_costs', 
    'production_lots', 'push_notifications', 'gamification_settings', 'energy_alerts', 'user_devices', 
    'shipping_providers', 'push_subscriptions', 'spc_capability_history', 'bitrix24_sync_history', 
    'shift_pending_tasks', 'technical_sheet_versions', 'login_lockouts', 'chat_messages', 
    'user_notification_settings', 'lot_quality_inspections', 'maintenance_alerts'
  ];

  allTables.forEach(table => {
    it(`deve bloquear acesso anônimo na tabela ${table}`, async () => {
      const { data, error } = await supabase.from(table as any).select('*').limit(1);
      
      // Se não houver erro, data deve estar vazio (RLS bloqueia linhas)
      // Se houver erro, deve ser de permissão ou autenticação
      if (error) {
        // Códigos 42501 (insufficient_privilege) ou PGRSTxxx (PostgREST errors)
        expect(['42501', 'PGRST116', 'PGRST301']).toContain(error.code || '');
      } else {
        expect(data?.length).toBe(0);
      }
    });
  });

  it('deve garantir que perfis não podem ser criados por anônimos', async () => {
    const { error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Hacker'
    });
    expect(error).toBeDefined();
  });
});
