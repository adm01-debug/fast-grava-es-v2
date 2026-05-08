-- Add consumables to technical_sheets
ALTER TABLE public.technical_sheets 
ADD COLUMN IF NOT EXISTS consumables JSONB DEFAULT '[]'::jsonb;

-- Add mandatory adjustment fields and consumables to pre_production_checklists
ALTER TABLE public.pre_production_checklists 
ADD COLUMN IF NOT EXISTS squeegee_passes TEXT,
ADD COLUMN IF NOT EXISTS pressure TEXT,
ADD COLUMN IF NOT EXISTS speed TEXT,
ADD COLUMN IF NOT EXISTS temperature TEXT,
ADD COLUMN IF NOT EXISTS technical_sheet_version INTEGER,
ADD COLUMN IF NOT EXISTS consumables_confirmed JSONB DEFAULT '[]'::jsonb;
