-- Add product_category_id to jobs
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS product_category_id UUID REFERENCES public.product_categories(id);
