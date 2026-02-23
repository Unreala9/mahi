-- FORCE FIX: Approve Deposit Logic
-- This script ensures the approve_deposit function correctly updates the wallet balance.

-- 1. Drop existing function to ensure fresh creation
DROP FUNCTION IF EXISTS public.approve_deposit(uuid);

-- 2. Re-create approve_deposit with explicit wallet update
CREATE OR REPLACE FUNCTION public.approve_deposit(
  p_transaction_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx record;
  v_admin_id uuid;
BEGIN
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access denied: Admin only');
  END IF;

  -- Lock transaction
  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
  END IF;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction is not pending');
  END IF;

  IF v_tx.type <> 'deposit' THEN
     RETURN jsonb_build_object('success', false, 'message', 'Transaction is not a deposit');
  END IF;

  -- Update transaction status
  UPDATE public.transactions
  SET status = 'completed',
      completed_at = NOW(),
      updated_at = NOW(),
      admin_processed_by = v_admin_id,
      description = 'Manual Deposit Approved'
  WHERE id = p_transaction_id;

  -- CREDIT WALLET (The critical part)
  UPDATE public.wallets
  SET balance = balance + v_tx.amount,
      total_deposited = total_deposited + v_tx.amount,
      updated_at = NOW()
  WHERE user_id = v_tx.user_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
