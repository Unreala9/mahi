# 🚨 URGENT: Fix Signup Issue

## Problem

"Database error saving new user" - Trigger failing to create profile/wallet

## Solution - Run SQL in Supabase Dashboard

### Steps:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Project**
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**
5. **Copy-paste the SQL below**
6. **Click "Run"** button

### SQL Script:

```sql
-- Add missing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'not_submitted';

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance numeric DEFAULT 0 NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Add policies
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
CREATE POLICY "Service role can insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (auth.uid() = user_id);

-- Fix trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, kyc_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'user',
    'not_submitted'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0, 'INR')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### After Running SQL:

✅ Try registering again - should work!

---

## Alternative: Temporary Disable Trigger (NOT RECOMMENDED)

If you want to test without fixing database:

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

But then profiles/wallets won't be created automatically.
