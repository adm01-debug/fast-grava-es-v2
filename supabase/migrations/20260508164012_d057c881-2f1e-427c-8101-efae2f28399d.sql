-- Fix Search Path for functions with signatures
ALTER FUNCTION public.audit_log_immutable() SET search_path = public;
ALTER FUNCTION public.compute_audit_hash(text, text, text, uuid, jsonb, jsonb, text, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.audit_trigger_func() SET search_path = public;
ALTER FUNCTION public.verify_audit_chain(integer) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.notify_tpm_email() SET search_path = public;
ALTER FUNCTION public.trigger_send_tpm_email() SET search_path = public;
ALTER FUNCTION public.check_tpm_schedules_notifications() SET search_path = public;
ALTER FUNCTION public.process_tpm_notifications_cron() SET search_path = public;
ALTER FUNCTION public.handle_tpm_updated_at() SET search_path = public;
ALTER FUNCTION public.audit_tpm_execution_changes() SET search_path = public;
ALTER FUNCTION public.save_tpm_checklist_snapshot() SET search_path = public;
ALTER FUNCTION public.increment_technical_sheet_version() SET search_path = public;
ALTER FUNCTION public.handle_maintenance_correction_notification() SET search_path = public;
ALTER FUNCTION public.handle_parameter_alert_notification() SET search_path = public;
ALTER FUNCTION public.notify_loss_risk() SET search_path = public;

-- Audit Trigger for Role Changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
DECLARE
    actor_id uuid;
    actor_email text;
BEGIN
    actor_id := auth.uid();
    SELECT email INTO actor_email FROM auth.users WHERE id = actor_id;
    
    INSERT INTO public.audit_log (
        entity_type,
        entity_id,
        action,
        actor_id,
        actor_email,
        old_data,
        new_data,
        changed_fields
    ) VALUES (
        'user_role',
        NEW.user_id::text,
        CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END,
        actor_id,
        actor_email,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        row_to_json(NEW)::jsonb,
        CASE WHEN TG_OP = 'UPDATE' THEN ARRAY['role', 'is_active'] ELSE ARRAY['all'] END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_audit_role_changes ON public.user_roles;
CREATE TRIGGER tr_audit_role_changes
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

-- Update user_roles policies to allow manager access
DROP POLICY IF EXISTS "Managers can view all roles" ON public.user_roles;
CREATE POLICY "Managers can view all roles" 
ON public.user_roles FOR SELECT 
USING (has_role(auth.uid(), 'coordinator') OR has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "Managers can update roles" ON public.user_roles;
CREATE POLICY "Managers can update roles" 
ON public.user_roles FOR UPDATE 
USING (has_role(auth.uid(), 'coordinator') OR has_role(auth.uid(), 'manager'));

-- Audit Log access
DROP POLICY IF EXISTS "Managers can view audit logs" ON public.audit_log;
CREATE POLICY "Managers can view audit logs" 
ON public.audit_log FOR SELECT 
USING (has_role(auth.uid(), 'coordinator') OR has_role(auth.uid(), 'manager'));

-- Add unique constraint to role_permissions if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_role_permission_key') THEN
        ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission);
    END IF;
END $$;

-- Sync manager permissions in role_permissions table
INSERT INTO public.role_permissions (role, permission, resource, action, is_granted)
SELECT 'manager', permission, resource, action, is_granted
FROM public.role_permissions
WHERE role = 'coordinator'
ON CONFLICT (role, permission) DO UPDATE SET is_granted = EXCLUDED.is_granted;
