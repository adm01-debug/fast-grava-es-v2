-- Fix overly permissive RLS policies for mutations
-- tpm_execution_supplies: was allowing INSERT with true
DROP POLICY IF EXISTS "Users can insert execution supplies" ON public.tpm_execution_supplies;
CREATE POLICY "Users can insert execution supplies" 
ON public.tpm_execution_supplies FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- password_reset_requests: was allowing INSERT with true
DROP POLICY IF EXISTS "Anyone can create password reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Authenticated users can request password reset" ON public.password_reset_requests;
CREATE POLICY "Authenticated users can request password reset" 
ON public.password_reset_requests FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- tpm_notification_templates: was ALL with true
DROP POLICY IF EXISTS "Templates editable by admins" ON public.tpm_notification_templates;
CREATE POLICY "Templates editable by admins" 
ON public.tpm_notification_templates FOR ALL 
USING (has_role(auth.uid(), 'coordinator') OR has_role(auth.uid(), 'manager'));

-- tpm_notification_logs: was INSERT with true
DROP POLICY IF EXISTS "Logs insertable by system" ON public.tpm_notification_logs;
CREATE POLICY "Logs insertable by system" 
ON public.tpm_notification_logs FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- tpm_severity_configs: was ALL with true
DROP POLICY IF EXISTS "Severity configs editable by authenticated users" ON public.tpm_severity_configs;
CREATE POLICY "Severity configs editable by authenticated users" 
ON public.tpm_severity_configs FOR ALL 
USING (auth.uid() IS NOT NULL);

-- tpm_notification_queue: was ALL with true
DROP POLICY IF EXISTS "Acesso interno para fila TPM" ON public.tpm_notification_queue;
CREATE POLICY "Acesso interno para fila TPM" 
ON public.tpm_notification_queue FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Fix Storage Policies to prevent listing while allowing access
-- Usually broad SELECT on storage.objects allows listing.
-- We can add a check for auth.role() = 'authenticated' to at least hide from truly public.

DROP POLICY IF EXISTS "Anyone can view execution evidence" ON storage.objects;
CREATE POLICY "Authenticated can view execution evidence" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'execution-evidence' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view production photos" ON storage.objects;
CREATE POLICY "Authenticated can view production photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'production-photos' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view technical documents" ON storage.objects;
CREATE POLICY "Authenticated can view technical documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'technical-documents' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Assinaturas são visíveis para todos" ON storage.objects;
CREATE POLICY "Authenticated can view signatures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'tpm_signatures' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Evidências públicas" ON storage.objects;
CREATE POLICY "Authenticated can view tpm evidences" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'tpm-evidences' AND auth.uid() IS NOT NULL);

-- Ensure all uploads require authentication
DROP POLICY IF EXISTS "Upload de evidências TPM" ON storage.objects;
CREATE POLICY "Authenticated can upload tpm evidences" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'tpm-evidences' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem enviar assinaturas" ON storage.objects;
CREATE POLICY "Authenticated can upload signatures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'tpm_signatures' AND auth.uid() IS NOT NULL);
