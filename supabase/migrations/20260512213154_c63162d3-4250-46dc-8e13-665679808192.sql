-- Revogando acesso público e concedendo apenas a usuários autenticados onde necessário
REVOKE EXECUTE ON FUNCTION public.log_technical_sheet_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_technical_sheet_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_inventory_stock() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_sheet_view_count(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_tpm_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_loss_risk() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_job_overlap() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_auto_promotion() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_trigger_func() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_send_tpm_email() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_tpm_execution_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_role_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_technical_sheet_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_logistics_changes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_audit_chain() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_audit_chain(integer) FROM PUBLIC;

-- Concedendo acesso a usuários autenticados para RPCs chamados pelo frontend
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_sheet_view_count(uuid) TO authenticated;
