-- Create the approve_withdrawal function for admin approval
CREATE OR REPLACE FUNCTION public.approve_withdrawal(p_transaction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction record;
  v_wallet record;
  v_result jsonb;
BEGIN
  -- Get the transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
    AND type = 'withdraw'
    AND status = 'pending'
  FOR UPDATE;

  -- Check if transaction exists and is pending
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Transaction not found or not pending'
    );
  END IF;

  -- Get user wallet
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = v_transaction.user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User wallet not found'
    );
  END IF;

  -- Check if user has sufficient balance (including locked balance)
  IF (v_wallet.balance + v_wallet.locked_balance) < v_transaction.amount THEN
    -- Update transaction status to failed
    UPDATE transactions
    SET
      status = 'failed',
      admin_notes = 'Insufficient balance',
      updated_at = NOW(),
      completed_at = NOW()
    WHERE id = p_transaction_id;

    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient balance'
    );
  END IF;

  BEGIN
    -- Deduct amount from wallet balance
    UPDATE wallets
    SET
      balance = GREATEST(0, balance - v_transaction.amount),
      total_withdrawn = total_withdrawn + v_transaction.amount,
      updated_at = NOW()
    WHERE user_id = v_transaction.user_id;

    -- Update transaction status to completed
    UPDATE transactions
    SET
      status = 'completed',
      updated_at = NOW(),
      completed_at = NOW()
    WHERE id = p_transaction_id;

    -- Create audit log entry
    INSERT INTO audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      new_values,
      created_at
    ) VALUES (
      auth.uid(),
      'approve_withdrawal',
      'transaction',
      p_transaction_id,
      jsonb_build_object(
        'transaction_id', p_transaction_id,
        'amount', v_transaction.amount,
        'user_id', v_transaction.user_id,
        'approved_by', auth.uid()
      ),
      NOW()
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Withdrawal approved successfully',
      'transaction_id', p_transaction_id,
      'amount', v_transaction.amount
    );

  EXCEPTION WHEN OTHERS THEN
    -- If anything fails, rollback will happen automatically
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error processing withdrawal: ' || SQLERRM
    );
  END;
END;
$$;

-- Create the reject_withdrawal function for admin rejection
CREATE OR REPLACE FUNCTION public.reject_withdrawal(
  p_transaction_id uuid,
  p_reason text DEFAULT 'Rejected by admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction record;
  v_result jsonb;
BEGIN
  -- Get the transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id
    AND type = 'withdraw'
    AND status = 'pending'
  FOR UPDATE;

  -- Check if transaction exists and is pending
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Transaction not found or not pending'
    );
  END IF;

  BEGIN
    -- Update transaction status to failed with reason
    UPDATE transactions
    SET
      status = 'failed',
      admin_notes = p_reason,
      updated_at = NOW(),
      completed_at = NOW()
    WHERE id = p_transaction_id;

    -- Create audit log entry
    INSERT INTO audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      new_values,
      created_at
    ) VALUES (
      auth.uid(),
      'reject_withdrawal',
      'transaction',
      p_transaction_id,
      jsonb_build_object(
        'transaction_id', p_transaction_id,
        'amount', v_transaction.amount,
        'user_id', v_transaction.user_id,
        'rejected_by', auth.uid(),
        'reason', p_reason
      ),
      NOW()
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Withdrawal rejected successfully',
      'transaction_id', p_transaction_id,
      'reason', p_reason
    );

  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error rejecting withdrawal: ' || SQLERRM
    );
  END;
END;
$$;

-- Grant execute permissions to authenticated users (RLS will control access)
GRANT EXECUTE ON FUNCTION public.approve_withdrawal(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_withdrawal(uuid, text) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.approve_withdrawal IS
'Approves a pending withdrawal request. Deducts amount from user wallet and marks transaction as completed.';

COMMENT ON FUNCTION public.reject_withdrawal IS
'Rejects a pending withdrawal request with optional reason. Marks transaction as failed.';