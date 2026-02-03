-- RLS Policies for all tables
-- Enable Row Level Security on all tables

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- BETS TABLE
-- ============================================================================
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_view_all_bets"
ON public.bets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "enable_read_own_bets"
ON public.bets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all bets"
ON public.bets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own bets"
ON public.bets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- CASINO_SESSIONS TABLE
-- ============================================================================
ALTER TABLE public.casino_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all casino sessions"
ON public.casino_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can view own casino sessions"
ON public.casino_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- GAME_RESULTS TABLE
-- ============================================================================
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert game results"
ON public.game_results
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read access to game results"
ON public.game_results
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- GAMES TABLE
-- ============================================================================
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage games"
ON public.games
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can view active games"
ON public.games
FOR SELECT
TO authenticated
USING (status = 'active');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their own profile during signup
CREATE POLICY "allow_signup_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (for trigger)
CREATE POLICY "service_role_can_insert_profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "admins_can_view_all_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can manage all profiles
CREATE POLICY "admins_can_manage_profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_can_update_all_transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "admin_can_view_all_transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update transactions"
ON public.transactions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "enable_read_own_transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- WALLETS TABLE
-- ============================================================================
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Admins can view all wallets
CREATE POLICY "admin_can_view_all_wallets"
ON public.wallets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow wallet creation during signup
CREATE POLICY "allow_wallet_creation"
ON public.wallets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow service role to create wallets (for trigger)
CREATE POLICY "service_role_can_create_wallets"
ON public.wallets
FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can view their own wallet
CREATE POLICY "users_view_own_wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own wallet
CREATE POLICY "users_update_own_wallet"
ON public.wallets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all wallets
CREATE POLICY "admins_can_manage_wallets"
ON public.wallets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
