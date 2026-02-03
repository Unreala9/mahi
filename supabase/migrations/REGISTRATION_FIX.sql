-- 🔧 REGISTRATION FIX - Database Setup
-- Copy paste this entire SQL in Supabase SQL Editor

-- ============================================
-- STEP 1: Create Profile & Wallet Automatically
-- ============================================

-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, role, kyc_status, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    'not_submitted',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance, locked_balance, currency)
  VALUES (
    NEW.id,
    0.00,
    0.00,
    'INR'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 2: Fix RLS Policies for Registration
-- ============================================

-- Profiles table policies
DROP POLICY IF EXISTS "allow_signup_insert" ON public.profiles;
DROP POLICY IF EXISTS "service_role_insert_profiles" ON public.profiles;

CREATE POLICY "allow_signup_insert"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "service_role_insert_profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Wallets table policies
DROP POLICY IF EXISTS "allow_wallet_creation" ON public.wallets;
DROP POLICY IF EXISTS "service_role_create_wallets" ON public.wallets;

CREATE POLICY "allow_wallet_creation"
ON public.wallets
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "service_role_create_wallets"
ON public.wallets
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- STEP 3: Grant Permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wallets TO anon, authenticated;

-- ============================================
-- Verification Query (Run this to check)
-- ============================================
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
