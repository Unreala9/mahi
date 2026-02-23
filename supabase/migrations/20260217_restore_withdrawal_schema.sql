-- Restore Transactions and Wallets Schema (Robust Version)

-- 1. Create Enums if they don't exist
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'bet_place', 'bet_win', 'bet_refund', 'bet_void_refund', 'adjustment', 'bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Wallets Table (if not exists)
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric DEFAULT 0.00 CHECK (balance >= 0::numeric),
  locked_balance numeric DEFAULT 0.00 CHECK (locked_balance >= 0::numeric),
  total_deposited numeric DEFAULT 0.00,
  total_withdrawn numeric DEFAULT 0.00,
  total_wagered numeric DEFAULT 0.00,
  total_won numeric DEFAULT 0.00,
  total_lost numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  currency text DEFAULT 'INR'::text,
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Create Transactions Table (if not exists)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type transaction_type NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  status transaction_status NOT NULL DEFAULT 'pending'::transaction_status,
  description text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  provider text,
  provider_ref_id text,
  wallet_id uuid,
  completed_at timestamp with time zone,
  payment_details text,
  admin_notes text,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id)
);

-- 4. Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "admin_can_view_all_wallets" ON public.wallets;
DROP POLICY IF EXISTS "users_view_own_wallet" ON public.wallets;
DROP POLICY IF EXISTS "service_role_manage_wallets" ON public.wallets;

DROP POLICY IF EXISTS "admin_can_view_all_transactions" ON public.transactions;
DROP POLICY IF EXISTS "admin_can_update_transactions" ON public.transactions;
DROP POLICY IF EXISTS "users_view_own_transactions" ON public.transactions;
DROP POLICY IF EXISTS "users_insert_own_transactions" ON public.transactions;

-- 6. Re-create Policies
-- Wallets
CREATE POLICY "admin_can_view_all_wallets" ON public.wallets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_view_own_wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_role_manage_wallets" ON public.wallets FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Transactions
CREATE POLICY "admin_can_view_all_transactions" ON public.transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_can_update_transactions" ON public.transactions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_view_own_transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
