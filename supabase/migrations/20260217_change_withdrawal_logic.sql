DROP FUNCTION IF EXISTS public.request_withdrawal(numeric, text, uuid);
DROP FUNCTION IF EXISTS public.approve_withdrawal(uuid);
DROP FUNCTION IF EXISTS public.reject_withdrawal(uuid);

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_amount numeric,
  p_upi_id text,
  p_user_id uuid
)
RETURNS TABLE(request_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req_id uuid := gen_random_uuid();
  v_wallet record;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  INSERT INTO public.wallets (user_id, balance) VALUES (p_user_id, 0.00) ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id;

  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  INSERT INTO public.withdrawal_requests (id, user_id, amount, status, payment_details)
  VALUES (v_req_id, p_user_id, p_amount, 'pending', p_upi_id);

  INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
  VALUES (p_user_id, 'withdraw', p_amount, 'pending', 'Withdrawal Request (Pending Approval)', v_req_id::text);

  request_id := v_req_id;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
  v_current_balance numeric;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_transaction_id FOR UPDATE;

  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request not pending');
  END IF;

  SELECT balance INTO v_current_balance FROM public.wallets WHERE user_id = v_req.user_id FOR UPDATE;

  IF v_current_balance < v_req.amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'User has insufficient balance now');
  END IF;

  UPDATE public.wallets
  SET balance = balance - v_req.amount,
      total_withdrawn = total_withdrawn + v_req.amount
  WHERE user_id = v_req.user_id;

  UPDATE public.withdrawal_requests
  SET status = 'approved', updated_at = NOW()
  WHERE id = p_transaction_id;
  UPDATE public.transactions
  SET status = 'completed', completed_at = NOW(), description = 'Withdrawal Approved'
  WHERE reference_id = p_transaction_id::text AND type = 'withdraw';

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_transaction_id FOR UPDATE;

  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request not pending');
  END IF;

  UPDATE public.withdrawal_requests
  SET status = 'rejected', updated_at = NOW()
  WHERE id = p_transaction_id;
  UPDATE public.transactions
  SET status = 'cancelled', description = 'Withdrawal Rejected'
  WHERE reference_id = p_transaction_id::text AND type = 'withdraw';

  RETURN jsonb_build_object('success', true);
END;
$$;
