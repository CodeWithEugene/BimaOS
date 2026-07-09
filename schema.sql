-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables/triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.ledger_logs;
DROP TABLE IF EXISTS public.claims;
DROP TABLE IF EXISTS public.policies;
DROP TABLE IF EXISTS public.users;

-- Core Users Table (Synchronized with Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    phone_number VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'consumer', -- 'consumer', 'agent', 'adjuster', 'admin', 'insurer'
    national_id_number VARCHAR(50),
    kra_pin VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Active Insurance Policies
CREATE TABLE public.policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- 'daily_boda', 'daily_market', 'seasonal_crop', 'health_cover', 'sme_fire', 'life_cover', 'funeral', 'education_savings'
    premium_amount NUMERIC(10, 2) NOT NULL,
    coverage_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'claimed', 'cancelled'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    blockchain_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Claims Management
CREATE TABLE public.claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'ai_review', 'human_review', 'approved', 'settled', 'rejected'
    ai_confidence_score NUMERIC(5, 2),
    image_urls TEXT[], -- Array of Supabase Storage bucket URLs
    payout_amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blockchain Transaction Registry for IRA RegTech Audits
CREATE TABLE public.ledger_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'premium_collection', 'claim_payout', 'policy_issuance'
    entity_id UUID NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    network VARCHAR(30) NOT NULL, -- 'stellar_soroban' or 'base_mainnet'
    block_number BIGINT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS
-- Users profile: Users can read their own profiles, insurers/adjusters can read all
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Insurers/adjusters can read all profiles" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "All users can insert profile" ON public.users FOR INSERT WITH CHECK (true);

-- Policies table: Users can read/write their own, insurers can read all
CREATE POLICY "Users can read own policies" ON public.policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insurers/adjusters can read all policies" ON public.policies FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);
CREATE POLICY "Users can insert own policies" ON public.policies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insurers can update policies" ON public.policies FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);

-- Claims table: Users can read/write their own, insurers/adjusters can read/update all
CREATE POLICY "Users can read own claims" ON public.claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insurers/adjusters can read all claims" ON public.claims FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);
CREATE POLICY "Users can insert own claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Insurers/adjusters can update claims" ON public.claims FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);

-- Ledger logs: Anyone can read, only service role or insurers can write
CREATE POLICY "Anyone can read ledger logs" ON public.ledger_logs FOR SELECT USING (true);
CREATE POLICY "Insurers can write ledger logs" ON public.ledger_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('insurer', 'adjuster', 'admin')
  )
);

-- Trigger to handle user signup and auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone_number, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.phone, new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'consumer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
