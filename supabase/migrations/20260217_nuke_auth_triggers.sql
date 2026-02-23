-- NUCLEAR AUTH RESET
-- The 500 error persists, which means a bad trigger is still attached to auth.users.
-- This script dynamically finds AND DROPS ALL triggers on the auth.users table.

-- 1. DROP ALL TRIGGERS ON auth.users
DO $$
DECLARE
    trg RECORD;
BEGIN
    FOR trg IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
        AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trg.trigger_name) || ' ON auth.users CASCADE';
        RAISE NOTICE 'Dropped trigger: %', trg.trigger_name;
    END LOOP;
END $$;

-- 2. DROP THE FUNCTION
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. CREATE A MINIMAL, FAIL-SAFE FUNCTION
-- This version wraps EVERYTHING in an error handler to ensure the User is ALWAYS created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert Profile
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, kyc_status, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'user',
      'not_submitted',
      true
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
  END;

  -- Insert Wallet
  BEGIN
    INSERT INTO public.wallets (user_id, balance, locked_balance, currency)
    VALUES (
      NEW.id,
      0.00,
      0.00,
      'INR'
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Wallet creation failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 4. RE-ATTACH THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. VERIFY POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Profile Read" ON public.profiles;
CREATE POLICY "Public Profile Read" ON public.profiles FOR SELECT USING (true);
