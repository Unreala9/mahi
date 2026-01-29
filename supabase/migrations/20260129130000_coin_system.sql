-- RPC for requesting withdrawal (Atomic deduction)
CREATE OR REPLACE FUNCTION request_withdrawal(p_user_id UUID, p_amount DECIMAL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance DECIMAL;
  v_tx_id UUID;
BEGIN
  -- Validate Limits
  IF p_amount < 1000 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Withdrawal amount must be between 1000 and 10000 coins.';
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

  -- Create Transaction in wallet_transactions table
  INSERT INTO public.wallet_transactions (user_id, type, amount, status, reference, description)
  VALUES (p_user_id, 'withdraw', p_amount, 'pending', CONCAT('WD_', EXTRACT(EPOCH FROM NOW())::BIGINT), 'Withdrawal Request')
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

  IF v_tx.type != 'withdraw' THEN
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
