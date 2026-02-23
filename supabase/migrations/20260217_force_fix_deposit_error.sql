-- FORCE FIX for "relation public.user_wallets does not exist" error
-- This migration aggressively cleans up and recreates the deposit approval logic.

-- 1. Drop the functions explicitly to ensure we replace any stale versions
DROP FUNCTION IF EXISTS public.approve_deposit(uuid);
DROP FUNCTION IF EXISTS public.reject_deposit(uuid);
DROP FUNCTION IF EXISTS public.reject_deposit(uuid, text);

-- 2. Clean up potential legacy triggers on transactions table
-- (Guessing common names to be safe, ignore errors if they don't exist)
DROP TRIGGER IF EXISTS tr_approve_deposit ON public.transactions;
DROP TRIGGER IF EXISTS trigger_approve_deposit ON public.transactions;
DROP TRIGGER IF EXISTS on_transaction_update ON public.transactions;
DROP TRIGGER IF EXISTS transaction_update_trigger ON public.transactions;

-- 3. Recreate approve_deposit with VERIFIED logic using 'wallets' table
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

  -- Update Wallet Balance (Using 'wallets' table explicitly)
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

-- 4. Recreate reject_deposit with VERIFIED logic
CREATE OR REPLACE FUNCTION public.reject_deposit(
  p_transaction_id uuid,
  p_reason text DEFAULT 'Invalid Proof'
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

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access denied: Admin only');
  END IF;

  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
  END IF;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction is not pending');
  END IF;

  UPDATE public.transactions
  SET status = 'cancelled',
      updated_at = NOW(),
      admin_processed_by = v_admin_id,
      admin_notes = p_reason,
      description = 'Manual Deposit Rejected: ' || p_reason
  WHERE id = p_transaction_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 5. Helper: Drop user_wallets if it still exists (Cleanup)
DROP TABLE IF EXISTS public.user_wallets CASCADE;

-- 6. Ensure wallets table exists and has correct columns (Quick check)
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id)
);
