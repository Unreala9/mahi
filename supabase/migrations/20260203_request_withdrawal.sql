-- RPC: request_withdrawal
-- Creates a withdrawal transaction + wallet_transactions entry and returns the transaction id

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount numeric,
  p_upi_id text,
  p_user_id uuid
)
RETURNS TABLE(transaction_id uuid) AS $$
DECLARE
  v_tx_id uuid := gen_random_uuid();
  v_wallet record;
BEGIN
  -- Basic validation
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid withdrawal amount';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id required';
  END IF;

  IF p_upi_id IS NULL OR trim(p_upi_id) = '' THEN
    RAISE EXCEPTION 'UPI ID is required';
  END IF;

  -- Ensure wallet exists
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  -- Check balance
  IF (v_wallet.balance::numeric) < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Insert into transactions table (use transaction id we generated)
  INSERT INTO public.transactions (
    id, user_id, type, amount, status, provider, payment_details, created_at, updated_at
  ) VALUES (
    v_tx_id,
    p_user_id,
    'withdraw'::transaction_type,
    p_amount,
    'pending'::transaction_status,
    'upi',
    p_upi_id,
    now(),
    now()
  );

  -- We store the withdrawal as a transaction (front-end should read from `transactions`)
  -- No separate `wallet_transactions` row is created; use the `transactions` table instead.

  -- Return the new transaction id
  transaction_id := v_tx_id;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow authenticated role to call this RPC (so client can call it)
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric, text, uuid) TO authenticated;

-- If you want the anon role to be able to call it (usually not recommended), uncomment below
-- GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric, text, uuid) TO anon;
