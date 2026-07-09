-- ============================================================
-- FIX: Infinite RLS Recursion on public.users
-- Root cause: RLS policies on users/policies/claims/ledger_logs
-- all do "SELECT 1 FROM public.users" to check role, which
-- re-triggers the same policies → infinite recursion.
--
-- Fix: Use auth.jwt() to read the role from the JWT token
-- instead of querying the users table inside a policy.
-- Also adds a security definer helper function as an alternative
-- for tables that need the role check.
-- ============================================================

-- Step 1: Drop all broken recursive policies
DROP POLICY IF EXISTS "Insurers/adjusters can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Insurers/adjusters can read all policies" ON public.policies;
DROP POLICY IF EXISTS "Insurers can update policies" ON public.policies;
DROP POLICY IF EXISTS "Insurers/adjusters can read all claims" ON public.claims;
DROP POLICY IF EXISTS "Insurers/adjusters can update claims" ON public.claims;
DROP POLICY IF EXISTS "Insurers can write ledger logs" ON public.ledger_logs;

-- Step 2: Create a SECURITY DEFINER function to check role
-- This runs with elevated privileges and does NOT trigger RLS,
-- breaking the recursion cycle.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id LIMIT 1;
$$;

-- Step 3: Recreate all policies using the safe helper function

-- USERS table
CREATE POLICY "Staff can read all profiles" ON public.users
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );

-- POLICIES table
CREATE POLICY "Staff can read all policies" ON public.policies
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );

CREATE POLICY "Staff can update policies" ON public.policies
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );

-- CLAIMS table
CREATE POLICY "Staff can read all claims" ON public.claims
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );

CREATE POLICY "Staff can update claims" ON public.claims
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );

-- LEDGER LOGS table
CREATE POLICY "Staff can write ledger logs" ON public.ledger_logs
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('insurer', 'adjuster', 'admin')
  );
