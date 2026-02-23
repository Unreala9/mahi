-- Update RPC Functions to use withdrawal_requests table

-- 1. Request Withdrawal
-- Drop conflicting signatures first to resolve "ambiguous function call" error
DROP FUNCTION IF EXISTS public.request_withdrawal(numeric, text, uuid);
DROP FUNCTION IF EXISTS public.request_withdrawal(uuid, numeric, text);

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

  -- Lock wallet
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;

  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Create withdrawal request
  INSERT INTO public.withdrawal_requests (id, user_id, amount, status, payment_details)
  VALUES (v_req_id, p_user_id, p_amount, 'pending', p_upi_id);

  -- Deduct balance immediately (lock it)
  UPDATE public.wallets
  SET balance = balance - p_amount,
      total_withdrawn = total_withdrawn + p_amount
  WHERE user_id = p_user_id;

  -- Optional: Log a 'withdraw_request' transaction for ledger history
  INSERT INTO public.transactions (user_id, type, amount, status, description, reference_id)
  VALUES (p_user_id, 'withdraw', p_amount, 'pending', 'Withdrawal Request', v_req_id::text);

  request_id := v_req_id;
  RETURN NEXT;
END;
$$;


-- 2. Approve Withdrawal
-- Drop first because we look to be changing parameter names or it might not exist
DROP FUNCTION IF EXISTS public.approve_withdrawal(uuid);

CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_request_id FOR UPDATE;

  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request not pending');
  END IF;

  -- Mark request as approved
  UPDATE public.withdrawal_requests
  SET status = 'approved', updated_at = NOW()
  WHERE id = p_request_id;

  -- Update the related transaction status if it exists
  UPDATE public.transactions
  SET status = 'completed', completed_at = NOW()
  WHERE reference_id = p_request_id::text AND type = 'withdraw';

  RETURN jsonb_build_object('success', true);
END;
$$;


-- 3. Reject Withdrawal
-- Drop first
DROP FUNCTION IF EXISTS public.reject_withdrawal(uuid);

CREATE OR REPLACE FUNCTION public.reject_withdrawal(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_req record;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_req FROM public.withdrawal_requests WHERE id = p_request_id FOR UPDATE;

  IF v_req.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request not pending');
  END IF;

  -- Mark request as rejected
  UPDATE public.withdrawal_requests
  SET status = 'rejected', updated_at = NOW()
  WHERE id = p_request_id;

  -- Refund balance to wallet
  UPDATE public.wallets
  SET balance = balance + v_req.amount,
      total_withdrawn = total_withdrawn - v_req.amount
  WHERE user_id = v_req.user_id;

  -- Update/Cancel transaction log
  UPDATE public.transactions
  SET status = 'cancelled', description = 'Withdrawal Rejected - Refunded'
  WHERE reference_id = p_request_id::text AND type = 'withdraw';

  RETURN jsonb_build_object('success', true);
END;
$$;
