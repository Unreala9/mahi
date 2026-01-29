-- Drop redundant tables
-- Run this carefully - make sure you have backups!

-- Drop duplicate transaction table
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;

-- Drop duplicate wallet table  
DROP TABLE IF EXISTS public.user_wallets CASCADE;

-- Drop potentially unused tables
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.provider_accounts CASCADE;
DROP TABLE IF EXISTS public.api_logs CASCADE;
DROP TABLE IF EXISTS public.kyc_requests CASCADE;
DROP TABLE IF EXISTS public.game_sessions CASCADE;

-- Note: Keeping these tables:
-- ✅ profiles (user data)
-- ✅ transactions (deposits/withdrawals/bets)
-- ✅ wallets (balances)
-- ✅ bets (betting history)
-- ✅ games (casino games)
-- ✅ casino_sessions (active casino sessions)
-- ✅ audit_logs (if you want to track admin actions later)
