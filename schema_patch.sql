-- Add verification fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS national_id_number VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kra_pin VARCHAR(50);

-- Add document upload and audit fields to claims table
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS national_id_url TEXT;
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS kra_certificate_url TEXT;
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS social_verdict TEXT;

-- Add category mapping to policies table
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50);

-- Create table for insurer custom deployed/temporary plans
CREATE TABLE IF NOT EXISTS public.custom_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'kilimo', 'boda', 'biashara', 'health'
    premium_amount NUMERIC(10, 2) NOT NULL,
    coverage_amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for custom plans
ALTER TABLE public.custom_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for custom plans
DROP POLICY IF EXISTS "Anyone can read custom plans" ON public.custom_plans;
CREATE POLICY "Anyone can read custom plans" ON public.custom_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insurers can manage custom plans" ON public.custom_plans;
CREATE POLICY "Insurers can manage custom plans" ON public.custom_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);
