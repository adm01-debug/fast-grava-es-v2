-- Corrigindo todas as funções SECURITY DEFINER identificadas com search_path ausente
ALTER FUNCTION public.log_technical_sheet_change() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.audit_technical_sheet_changes() SET search_path = public;
ALTER FUNCTION public.update_inventory_stock() SET search_path = public;
ALTER FUNCTION public.increment_sheet_view_count(uuid) SET search_path = public;
ALTER FUNCTION public.notify_tpm_email() SET search_path = public;
ALTER FUNCTION public.notify_loss_risk() SET search_path = public;
ALTER FUNCTION public.check_job_overlap() SET search_path = public;
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.trigger_auto_promotion() SET search_path = public;
ALTER FUNCTION public.audit_trigger_func() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.trigger_send_tpm_email() SET search_path = public;
ALTER FUNCTION public.audit_tpm_execution_changes() SET search_path = public;
ALTER FUNCTION public.log_role_changes() SET search_path = public;
ALTER FUNCTION public.create_technical_sheet_version() SET search_path = public;
ALTER FUNCTION public.audit_logistics_changes() SET search_path = public;

-- Restringindo inserção de logs de erro para usuários autenticados (prevenção de DOS)
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Authenticated users can insert error logs" 
ON public.error_logs FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Garantir que técnicas sempre tenham uma cor válida se não fornecida
ALTER TABLE public.techniques ALTER COLUMN color SET DEFAULT '#3b82f6';
