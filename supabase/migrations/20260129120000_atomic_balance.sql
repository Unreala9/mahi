-- Atomic balance deduction function
CREATE OR REPLACE FUNCTION deduct_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance DECIMAL;
  v_new_balance DECIMAL;
BEGIN
  -- Lock the wallet row for update to prevent race conditions
  SELECT balance INTO v_current_balance
  FROM public.wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance: % < %', v_current_balance, p_amount;
  END IF;

  UPDATE public.wallets
  SET balance = balance - p_amount
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;
