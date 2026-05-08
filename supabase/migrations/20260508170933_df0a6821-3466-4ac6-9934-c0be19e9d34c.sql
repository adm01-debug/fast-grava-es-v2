-- Make hash nullable in audit_log as the trigger is not providing it currently
ALTER TABLE public.audit_log ALTER COLUMN hash DROP NOT NULL;

-- Fix Security Definer issues by revoking public execute on sensitive functions
-- (Assuming standard naming from common patterns in this project)
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, nspname 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE p.prosecdef = true AND n.nspname = 'public'
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I FROM PUBLIC, ANON;', func_record.nspname, func_record.proname);
    END LOOP;
END $$;

-- Update the specific user to have coordinator role
UPDATE public.user_roles 
SET role = 'coordinator' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ti@promobrindes.com.br');
