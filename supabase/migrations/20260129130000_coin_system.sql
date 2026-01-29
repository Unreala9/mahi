-- RPC for requesting withdrawal (Atomic deduction)
CREATE OR REPLACE FUNCTION request_withdrawal(p_user_id UUID, p_amount DECIMAL, p_upi_id TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance DECIMAL;
  v_tx_id UUID;
BEGIN
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than 0';
  END IF;

  -- Lock wallet
  SELECT balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct Balance
  UPDATE public.wallets
  SET balance = balance - p_amount
  WHERE user_id = p_user_id;

  -- Create Transaction with UPI details
  INSERT INTO public.transactions (user_id, type, amount, status, description, payment_details)
  VALUES (
    p_user_id, 
    'withdrawal'::transaction_type, 
    p_amount, 
    'pending'::transaction_status, 
    'Withdrawal Request',
    CASE WHEN p_upi_id IS NOT NULL THEN 'UPI: ' || p_upi_id ELSE NULL END
  )
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_current_balance - p_amount);
END;
$$;

-- RPC for Rejecting Withdrawal (Refund)
CREATE OR REPLACE FUNCTION reject_withdrawal(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx RECORD;
BEGIN
  -- Get Transaction
  SELECT * INTO v_tx FROM public.wallet_transactions WHERE id = p_transaction_id FOR UPDATE;

  IF v_tx.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending';
  END IF;

  IF v_tx.type != 'withdrawal'::transaction_type THEN
     RAISE EXCEPTION 'Transaction is not a withdrawal';
  END IF;

  -- Refund Wallet
  UPDATE public.wallets
  SET balance = balance + v_tx.amount
  WHERE user_id = v_tx.user_id;

  -- Update Transaction Status
  UPDATE public.wallet_transactions
  SET status = 'failed', updated_at = NOW()
  WHERE id = p_transaction_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC for Approving Withdrawal
CREATE OR REPLACE FUNCTION approve_withdrawal(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.wallet_transactions
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_transaction_id AND status = 'pending';

  RETURN jsonb_build_object('success', true);
END;
$$;
