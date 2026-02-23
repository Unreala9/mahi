-- FIX: Missing Wallets & Auto-Create on Deposit Approval

-- 1. Backfill Missing Wallets for Existing Users
-- Assuming public.profiles contains all users (which is standard for Supabase starter kits)
-- If not, we can also check referencing user_ids from transactions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles
    LOOP
        INSERT INTO public.wallets (user_id, balance)
        VALUES (r.id, 0.00)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;


-- 2. Update approve_deposit to Auto-Create Wallet if missing
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

  -- ENSURE WALLET EXISTS
  INSERT INTO public.wallets (user_id, balance)
  VALUES (v_tx.user_id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;

  -- CREDIT WALLET
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
