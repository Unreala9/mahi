-- Fix for Infinite Recursion in RLS Policies

-- 1. Create a secure function to check admin status (Bypasses RLS)
-- SECURITY DEFINER allows this function to run with the privileges of the creator (postgres/admin)
-- rather than the user calling it, effectively bypassing RLS for this specific check.
-- Hardened admin check to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- This runs with definer privileges and a fixed search_path,
  -- preventing recursion issues with RLS on public.profiles.
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin_user;
  RETURN is_admin_user;
END;
$$;

-- Ensure authenticated users can execute the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 2. Update the problematic policies to use this function

-- Profiles: The root cause of the recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Provider Accounts
DROP POLICY IF EXISTS "Admins can view all provider accounts" ON public.provider_accounts;
CREATE POLICY "Admins can view all provider accounts" ON public.provider_accounts
  FOR SELECT USING (public.is_admin());

-- API Logs
DROP POLICY IF EXISTS "Admins can view all api logs" ON public.api_logs;
CREATE POLICY "Admins can view all api logs" ON public.api_logs
  FOR SELECT USING (public.is_admin());

-- Bets
DROP POLICY IF EXISTS "Admins can view all bets" ON public.bets;
CREATE POLICY "Admins can view all bets" ON public.bets
  FOR SELECT USING (public.is_admin());

-- Wallet Transactions
DROP POLICY IF EXISTS "Admins can view all wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can view all wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (public.is_admin());

-- Casino Sessions
DROP POLICY IF EXISTS "Admins can view all casino sessions" ON public.casino_sessions;
CREATE POLICY "Admins can view all casino sessions" ON public.casino_sessions
  FOR SELECT USING (public.is_admin());
