-- =====================================================
-- QUICK FIX: Create deduct_balance RPC Function
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop function if exists (to recreate fresh)
DROP FUNCTION IF EXISTS public.deduct_balance(uuid, numeric);

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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO service_role;

-- Test the function (optional - comment out if not needed)
-- SELECT public.deduct_balance('3c776638-f211-42ed-b25a-168b25abe76c', 10);
