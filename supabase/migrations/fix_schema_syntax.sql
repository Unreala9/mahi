-- Fixed schema with proper syntax
-- This corrects the USER-DEFINED keyword errors

-- First, create enum types if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_status') THEN
    CREATE TYPE game_status AS ENUM ('active', 'inactive', 'maintenance');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'bet', 'win', 'bonus');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
  END IF;
END $$;

-- Table: audit_logs
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

-- Table: profiles
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
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Table: bets
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
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text, 'void'::text, 'cashed_out'::text])),
  bet_type text NOT NULL,
  potential_payout numeric NOT NULL,
  payout numeric DEFAULT 0,
  settled_at timestamp with time zone,
  bet_on text CHECK (bet_on = ANY (ARRAY['odds'::text, 'fancy'::text, 'bookmaker'::text])),
  exposure numeric DEFAULT 0,
  rate numeric DEFAULT 100,
  CONSTRAINT bets_pkey PRIMARY KEY (id),
  CONSTRAINT bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Table: casino_sessions
CREATE TABLE IF NOT EXISTS public.casino_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_id text NOT NULL,
  launch_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT casino_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT casino_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Table: game_results
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

-- Table: wallets (Create BEFORE transactions since transactions references it)
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric DEFAULT 0.00 CHECK (balance >= 0::numeric),
  locked_balance numeric DEFAULT 0.00 CHECK (locked_balance >= 0::numeric),
  total_deposited numeric DEFAULT 0.00,
  total_withdrawn numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  currency text DEFAULT 'INR'::text,
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Table: transactions
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
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id)
);

-- Table: games
CREATE TABLE IF NOT EXISTS public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id text NOT NULL UNIQUE,
  name text NOT NULL,
  provider text NOT NULL,
  category text NOT NULL,
  image_url text,
  status game_status DEFAULT 'active'::game_status,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT games_pkey PRIMARY KEY (id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON public.bets(created_at);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_casino_sessions_user_id ON public.casino_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON public.game_results(game_id);
CREATE INDEX IF NOT EXISTS idx_game_results_declared_at ON public.game_results(declared_at);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
