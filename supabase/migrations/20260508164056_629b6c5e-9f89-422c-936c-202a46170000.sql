-- Revoke execute from public for security definer functions
-- These are usually called via triggers or rpc but should not be directly callable by anon.

REVOKE EXECUTE ON FUNCTION public.audit_log_immutable() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.compute_audit_hash(text, text, text, uuid, jsonb, jsonb, text, timestamp with time zone) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.audit_trigger_func() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.verify_audit_chain(integer) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.log_role_changes() FROM public, anon;

-- Grant execute to authenticated users for functions that might be called via RPC
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_audit_chain(integer) TO authenticated;
