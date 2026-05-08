-- Add root cause columns to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS rework_reason TEXT,
ADD COLUMN IF NOT EXISTS loss_category TEXT;
