-- Migration: 20260217_consolidated_schema
-- Description: Consolidated schema for Mahi platform including Sports, Casino, and Wallets

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "moddatetime";
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;

-- Function: settle_single_bet
CREATE OR REPLACE FUNCTION public.settle_single_bet(
  p_bet_id uuid,
  p_status text,
  p_payout numeric DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet record;
  v_old_status text;
  v_user_id uuid;
BEGIN
  IF p_status NOT IN ('won', 'lost', 'void') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  SELECT * INTO v_bet FROM public.bets WHERE id = p_bet_id FOR UPDATE;

  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Bet not found'); END IF;

  v_old_status := v_bet.status;
  v_user_id := v_bet.user_id;

  IF v_old_status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Bet already settled', 'current_status', v_old_status);
  END IF;

  UPDATE public.bets
  SET status = p_status, payout = p_payout, settled_at = NOW()
  WHERE id = p_bet_id;

  IF p_status IN ('won', 'void') AND p_payout > 0 THEN
    UPDATE public.wallets
    SET locked_balance = GREATEST(locked_balance - v_bet.stake, 0),
        balance = balance + p_payout,
        total_won = total_won + (CASE WHEN p_status = 'won' THEN p_payout ELSE 0 END)
    WHERE user_id = v_user_id;

    INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
    VALUES (v_user_id, CASE WHEN p_status='won' THEN 'bet_win' ELSE 'bet_void_refund' END, p_payout, 'completed', 'Bet Settlement', p_bet_id::text);

  ELSIF p_status = 'lost' THEN
    UPDATE public.wallets
    SET locked_balance = GREATEST(locked_balance - v_bet.stake, 0),
        total_lost = total_lost + v_bet.stake
    WHERE user_id = v_user_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Create Enums
DO $$ BEGIN
    CREATE TYPE game_status AS ENUM ('active', 'maintenance', 'disabled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

DO $$ BEGIN
   CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
   WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES
-- =====================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  kyc_status kyc_status DEFAULT 'not_submitted'::kyc_status,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- WALLETS
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

-- TRANSACTIONS
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

-- GAMES (Casino/Slots)
CREATE TABLE IF NOT EXISTS public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_id text NOT NULL,
  provider_name text NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  thumbnail_url text,
  status game_status DEFAULT 'active'::game_status,
  min_bet numeric DEFAULT 1.00,
  max_bet numeric DEFAULT 10000.00,
  rtp numeric,
  is_featured boolean DEFAULT false,
  play_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT games_pkey PRIMARY KEY (id)
);

-- GAME RESULTS
CREATE TABLE IF NOT EXISTS public.game_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_type text NOT NULL CHECK (game_type = ANY (ARRAY['sports'::text, 'casino'::text])),
  game_id text NOT NULL,
  game_name text NOT NULL,
  market_id text NOT NULL,
  market_name text NOT NULL,
  winning_selection text NOT NULL,
  winning_selection_id text,
  result text NOT NULL,
  result_details jsonb,
  result_status text DEFAULT 'DECLARED'::text CHECK (result_status = ANY (ARRAY['PENDING'::text, 'DECLARED'::text, 'VOIDED'::text])),
  declared_at timestamp with time zone NOT NULL,
  total_bets integer DEFAULT 0,
  won_bets integer DEFAULT 0,
  lost_bets integer DEFAULT 0,
  void_bets integer DEFAULT 0,
  total_payout numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_results_pkey PRIMARY KEY (id)
);

-- SPORTS BETS
CREATE TABLE IF NOT EXISTS public.bets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id uuid NOT NULL,
  provider_bet_id text,
  sport text NOT NULL,
  event text NOT NULL,
  event_name text,
  market text NOT NULL,
  market_name text,
  selection text NOT NULL,
  selection_name text,
  odds numeric NOT NULL,
  stake numeric NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text, 'void'::text, 'half_won'::text, 'half_lost'::text, 'cashed_out'::text])),
  bet_type text NOT NULL,
  potential_payout numeric NOT NULL,
  payout numeric DEFAULT 0,
  settled_at timestamp with time zone,
  bet_on text CHECK (bet_on = ANY (ARRAY['odds'::text, 'fancy'::text, 'bookmaker'::text])),
  exposure numeric DEFAULT 0,
  rate numeric DEFAULT 100,
  auto_settled boolean DEFAULT false,
  api_result jsonb,
  market_id text,
  api_event_id text,
  CONSTRAINT bets_pkey PRIMARY KEY (id),
  CONSTRAINT bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- CASINO BETS
CREATE TABLE IF NOT EXISTS public.casino_bets (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  user_id uuid NOT NULL,
  game_id text NOT NULL,
  game_name text,
  round_id text NOT NULL,
  selection text NOT NULL,
  odds numeric NOT NULL CHECK (odds > 0::numeric),
  stake numeric NOT NULL CHECK (stake > 0::numeric),
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'WIN'::text, 'LOSS'::text, 'VOID'::text, 'CANCELLED'::text])),
  win_amount numeric DEFAULT 0 CHECK (win_amount >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  settled_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT casino_bets_pkey PRIMARY KEY (id),
  CONSTRAINT casino_bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- CASINO RESULTS
CREATE TABLE IF NOT EXISTS public.casino_results (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  game_id text NOT NULL,
  round_id text NOT NULL,
  result text NOT NULL,
  raw jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT casino_results_pkey PRIMARY KEY (id),
  CONSTRAINT casino_results_unique_round UNIQUE (game_id, round_id)
);

-- CASINO SESSIONS
CREATE TABLE IF NOT EXISTS public.casino_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  game_id text NOT NULL,
  launch_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT casino_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT casino_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id)
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_everything_profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "allow_signup_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_view_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- WALLETS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_view_all_wallets" ON public.wallets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "allow_wallet_creation" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_view_own_wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_update_own_wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "service_role_manage_wallets" ON public.wallets FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');


-- TRANSACTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_view_all_transactions" ON public.transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admin_can_update_transactions" ON public.transactions FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_view_own_transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BETS
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_view_all_bets" ON public.bets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "users_view_own_bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_role_manage_bets" ON public.bets FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- CASINO BETS
ALTER TABLE public.casino_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_casino_bets" ON public.casino_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_casino_bets" ON public.casino_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "service_role_manage_casino_bets" ON public.casino_bets FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- CASINO RESULTS
ALTER TABLE public.casino_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_view_casino_results" ON public.casino_results FOR SELECT USING (true);
CREATE POLICY "service_role_manage_casino_results" ON public.casino_results FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- AUDIT LOGS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_audit_logs" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- GAMES
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_view_active_games" ON public.games FOR SELECT USING (status = 'active');
CREATE POLICY "admins_manage_games" ON public.games FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Trigger: handle_new_user (Creates profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: handle_new_user_wallet (Creates wallet on profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- Function: update_updated_at (Generic)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();


-- Function: check_is_admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$;

-- Function: get_wallet_balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance numeric;
BEGIN
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = p_user_id;
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Function: request_withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount numeric,
  p_upi_id text,
  p_user_id uuid
)
RETURNS TABLE(transaction_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx_id uuid := gen_random_uuid();
  v_wallet record;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  -- Lock wallet
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Create transaction
  INSERT INTO public.transactions (id, user_id, type, amount, status, payment_details)
  VALUES (v_tx_id, p_user_id, 'withdraw', p_amount, 'pending', p_upi_id);

  -- Deduct balance triggers via application logic or separate function usually,
  -- but here we rely on admin approval or immediate deduction.
  -- Let's immediately deduct "locked" balance or similar if needed.
  -- For now, we will just record the transaction. Actual deduction happens on approval or here?
  -- Common pattern: Deduct immediately from usable balance.

  UPDATE public.wallets
  SET balance = balance - p_amount,
      total_withdrawn = total_withdrawn + p_amount
  WHERE user_id = p_user_id;

  transaction_id := v_tx_id;
  RETURN NEXT;
END;
$$;

-- Function: settle_market (Consolidated)
CREATE OR REPLACE FUNCTION public.settle_market(
  p_market_id text,
  p_result_code text,
  p_settlement_mode text DEFAULT 'normal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet record;
  v_payout numeric;
  v_total_settled int := 0;
BEGIN
  -- Iterate pending bets for this market
  FOR v_bet IN
    SELECT * FROM public.bets
    WHERE market_id = p_market_id AND status = 'pending'
    FOR UPDATE
  LOOP
     v_payout := 0;
     -- Simple match logic (can be expanded)
     IF p_settlement_mode = 'normal' THEN
        IF v_bet.selection_name = p_result_code OR v_bet.selection = p_result_code THEN
           v_payout := v_bet.stake * v_bet.odds;
           UPDATE public.bets SET status = 'won', payout = v_payout, settled_at = NOW() WHERE id = v_bet.id;
           UPDATE public.wallets SET balance = balance + v_payout, total_won = total_won + v_payout WHERE user_id = v_bet.user_id;

           INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
           VALUES (v_bet.user_id, 'bet_win', v_payout, 'completed', 'Won bet ' || v_bet.id, v_bet.id::text);
        ELSE
           UPDATE public.bets SET status = 'lost', payout = 0, settled_at = NOW() WHERE id = v_bet.id;
           UPDATE public.wallets SET total_lost = total_lost + v_bet.stake WHERE user_id = v_bet.user_id;
        END IF;
     END IF;

     -- Add other modes (void, half_win) as needed based on previous research

     v_total_settled := v_total_settled + 1;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'settled', v_total_settled);
END;
$$;

-- Function: get_pending_casino_bets
CREATE OR REPLACE FUNCTION public.get_pending_casino_bets(p_user_id uuid)
RETURNS TABLE (
  id bigint,
  game_id text,
  game_name text,
  round_id text,
  selection text,
  odds numeric,
  stake numeric,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, game_id, game_name, round_id, selection, odds, stake, created_at
  FROM public.casino_bets
  WHERE user_id = p_user_id AND status = 'PENDING'
  ORDER BY created_at DESC;
$$;

-- Function: deduct_balance
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance numeric;
BEGIN
  -- Lock wallet
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  UPDATE public.wallets
  SET balance = balance - p_amount,
      total_wagered = total_wagered + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_balance', v_balance - p_amount);
END;
$$;

-- Function: increment_balance
CREATE OR REPLACE FUNCTION public.increment_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallets
  SET balance = balance + p_amount,
      total_won = total_won + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: approve_withdrawal
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx record;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not pending');
  END IF;

  UPDATE public.transactions
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE id = p_transaction_id;

  -- Balance was already deducted at request time (in request_withdrawal)

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: reject_withdrawal
CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx record;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not pending');
  END IF;

  UPDATE public.transactions
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_transaction_id;

  -- Refund balance
  UPDATE public.wallets
  SET balance = balance + v_tx.amount,
      total_withdrawn = total_withdrawn - v_tx.amount
  WHERE user_id = v_tx.user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: settle_casino_bet
CREATE OR REPLACE FUNCTION public.settle_casino_bet(
  p_bet_id bigint,
  p_status text,
  p_win_amount numeric,
  p_api_result jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bet record;
BEGIN
  SELECT * INTO v_bet FROM public.casino_bets WHERE id = p_bet_id FOR UPDATE;

  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'Bet not found'); END IF;
  IF v_bet.status <> 'PENDING' THEN RETURN jsonb_build_object('success', false, 'error', 'Already settled'); END IF;

  UPDATE public.casino_bets
  SET status = p_status, win_amount = p_win_amount, settled_at = NOW(), metadata = metadata || p_api_result
  WHERE id = p_bet_id;

  IF p_status = 'WIN' AND p_win_amount > 0 THEN
      UPDATE public.wallets SET balance = balance + p_win_amount, total_won = total_won + p_win_amount WHERE user_id = v_bet.user_id;
      INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
      VALUES (v_bet.user_id, 'bet_win', p_win_amount, 'completed', 'Casino Win', p_bet_id::text);
  ELSIF p_status = 'VOID' OR p_status = 'CANCELLED' THEN
      -- Refund stake
       UPDATE public.wallets SET balance = balance + v_bet.stake WHERE user_id = v_bet.user_id;
  ELSE
       -- Loss
       UPDATE public.wallets SET total_lost = total_lost + v_bet.stake WHERE user_id = v_bet.user_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant permissions explicitly where needed (though RLS handles most)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

