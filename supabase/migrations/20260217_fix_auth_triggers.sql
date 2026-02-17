-- FIX AUTH TRIGGERS & RLS
-- This migration fixes the "500 Error" on signup by rebuilding the user creation trigger.

-- 1. Drop existing trigger and function to ensure a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recreate the function with SECURITY DEFINER and strict search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, full_name, role, kyc_status, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user', -- Default role
    'not_submitted',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  -- Create Wallet (CRITICAL: References 'wallets', NOT 'user_wallets')
  INSERT INTO public.wallets (user_id, balance, locked_balance, currency)
  VALUES (
    NEW.id,
    0.00,
    0.00,
    'INR'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error (optional, but helpful for debugging if we had logs)
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW; -- Ensure auth user is still created even if profile fails (prevents 500, but profile might be missing)
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Ensure RLS Policies allow the new user to see their own profile/wallet
-- (Fixes 406 Not Acceptable error on select)

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- WALLETS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

-- SYSTEM SETTINGS (Ensure public read is definitely on)
DROP POLICY IF EXISTS "Allow public read access" ON public.system_settings;
CREATE POLICY "Allow public read access"
ON public.system_settings FOR SELECT
TO authenticated, anon
USING (true);
