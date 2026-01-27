-- Database Schema for Edge Function Based Betting System
-- Run this in Supabase SQL Editor

-- Add missing columns to bets table
ALTER TABLE bets
ADD COLUMN IF NOT EXISTS event TEXT,
ADD COLUMN IF NOT EXISTS event_name TEXT,
ADD COLUMN IF NOT EXISTS market TEXT,
ADD COLUMN IF NOT EXISTS market_name TEXT,
ADD COLUMN IF NOT EXISTS selection TEXT,
ADD COLUMN IF NOT EXISTS selection_name TEXT,
ADD COLUMN IF NOT EXISTS potential_payout DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS bet_type TEXT CHECK (bet_type IN ('BACK', 'LAY')),
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payout DECIMAL(10, 2);

-- Ensure wallet_transactions table exists with proper structure
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'bonus')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
  reference TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at DESC);

-- Enable RLS on wallet_transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Service role full access to wallet_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON wallet_transactions;

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own transactions"
  ON wallet_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access to wallet_transactions"
  ON wallet_transactions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Drop existing policies on bets table if they exist
DROP POLICY IF EXISTS "Users can view their own bets" ON bets;
DROP POLICY IF EXISTS "Service role full access to bets" ON bets;
DROP POLICY IF EXISTS "Users can insert their own bets" ON bets;

-- RLS policies for bets table
CREATE POLICY "Users can view their own bets"
  ON bets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to bets"
  ON bets
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create or update wallets table to have balance column
ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0);

-- Update existing user wallet with initial balance if needed
-- This is safe to run multiple times
INSERT INTO wallets (user_id, balance)
SELECT id, 0
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM wallets WHERE wallets.user_id = auth.users.id)
ON CONFLICT (user_id) DO NOTHING;

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for wallet_transactions
DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON wallet_transactions TO service_role;
GRANT SELECT ON wallet_transactions TO authenticated;
GRANT ALL ON bets TO service_role;
GRANT SELECT ON bets TO authenticated;
GRANT ALL ON wallets TO service_role;
GRANT SELECT, UPDATE ON wallets TO authenticated;

-- Verify tables
SELECT 'Tables are ready!' as status;
