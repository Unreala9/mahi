-- Wallet RPC Functions for Atomic Balance Operations
-- These functions ensure thread-safe balance updates with proper locking

-- Function to deduct balance (for placing bets)
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet record;
  v_new_balance numeric;
BEGIN
  -- Lock the wallet row for update
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    -- Create wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW());

    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient balance',
      'old_balance', 0,
      'new_balance', 0
    );
  END IF;

  -- Check if sufficient balance
  IF v_wallet.balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient balance',
      'old_balance', v_wallet.balance,
      'new_balance', v_wallet.balance,
      'required', p_amount
    );
  END IF;

  -- Deduct balance atomically
  v_new_balance := v_wallet.balance - p_amount;

  UPDATE wallets
  SET
    balance = v_new_balance,
    total_wagered = COALESCE(total_wagered, 0) + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Balance deducted successfully',
    'old_balance', v_wallet.balance,
    'new_balance', v_new_balance,
    'deducted', p_amount
  );
END;
$$;

-- Function to increment balance (for winning bets, deposits, refunds)
CREATE OR REPLACE FUNCTION public.increment_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet record;
  v_new_balance numeric;
BEGIN
  -- Lock the wallet row for update
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    -- Create wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (p_user_id, p_amount, NOW(), NOW());

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Wallet created and balance added',
      'old_balance', 0,
      'new_balance', p_amount,
      'added', p_amount
    );
  END IF;

  -- Increment balance atomically
  v_new_balance := v_wallet.balance + p_amount;

  UPDATE wallets
  SET
    balance = v_new_balance,
    total_won = COALESCE(total_won, 0) + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Balance incremented successfully',
    'old_balance', v_wallet.balance,
    'new_balance', v_new_balance,
    'added', p_amount
  );
END;
$$;

-- Function to record a loss (doesn't change balance, just tracks the loss amount)
-- Note: Balance was already deducted when the bet was placed, this only updates statistics
CREATE OR REPLACE FUNCTION public.record_loss(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet record;
BEGIN
  -- Lock the wallet row for update
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    -- Create wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance, total_lost, created_at, updated_at)
    VALUES (p_user_id, 0, p_amount, NOW(), NOW());

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Wallet created and loss recorded',
      'total_lost', p_amount
    );
  END IF;

  -- Record loss atomically (balance already deducted when bet was placed)
  -- This only updates the total_lost statistic, does NOT change the current balance
  UPDATE wallets
  SET
    total_lost = COALESCE(total_lost, 0) + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Loss recorded successfully',
    'total_lost', COALESCE(v_wallet.total_lost, 0) + p_amount,
    'lost_amount', p_amount
  );
END;
$$;

-- Function to get current wallet balance
CREATE OR REPLACE FUNCTION public.get_wallet_balance(
  p_user_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
BEGIN
  SELECT balance INTO v_balance
  FROM wallets
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW());
    RETURN 0;
  END IF;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_loss(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_wallet_balance(uuid) TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);
CREATE INDEX IF NOT EXISTS idx_bets_user_status ON bets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type, status);

-- Add comment
COMMENT ON FUNCTION public.deduct_balance IS 'Atomically deduct amount from user wallet when placing a bet (with proper locking)';
COMMENT ON FUNCTION public.increment_balance IS 'Atomically add amount to user wallet for winnings, deposits, or refunds';
COMMENT ON FUNCTION public.record_loss IS 'Record a lost bet in wallet statistics (balance already deducted at bet placement time)';
COMMENT ON FUNCTION public.get_wallet_balance IS 'Get current wallet balance for a user';
