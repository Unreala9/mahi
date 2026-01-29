-- Fix Signup Trigger (Handle New User)
-- This ensures that when a new user signs up, their profile and wallet are created correctly.
-- We use SECURITY DEFINER to bypass RLS during this automated process.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name, email, role, kyc_status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'user', -- Default role
    'not_submitted'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email; -- Ensure email is synced

  -- 2. Create Wallet (if not exists)
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (new.id, 0, 'INR')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Re-apply Profile RLS (Just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
CREATE POLICY "Users can see their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to do everything (using is_admin function from previous migration)
-- Note: Assuming is_admin() exists. If not, this might fail, but it should exist.
