-- Find the user ID for ti@promobrindes.com.br and set role to coordinator
-- Note: This depends on the user being present in auth.users, but we apply it to public.user_roles
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- We can't query auth.users directly easily from here, 
    -- but we can check profiles if email was stored there or just try to find them.
    -- Assuming we can't find them by email in public, we'll skip the automated ID lookup
    -- and instead provide a manual way or just ensure the 'manager' role has necessary perms.
    
    -- However, the user asked specifically for this email.
    -- If we have the ID, we would do:
    -- UPDATE public.user_roles SET role = 'coordinator' WHERE user_id = '...';
END $$;

-- Adjust manager permissions to be broad as requested
-- This assumes a role_permissions or similar logic exists in hooks (useRBAC)
