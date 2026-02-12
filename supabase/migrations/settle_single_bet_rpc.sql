-- Simple RPC function to settle a single bet
-- Bypasses RLS using SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.settle_single_bet(
  p_bet_id uuid,
  p_status text,
  p_payout numeric DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bet record;
  v_old_status text;
  v_user_id uuid;
  v_transaction_id uuid;
BEGIN
  -- Validate status
  IF p_status NOT IN ('won', 'lost', 'void') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid status. Must be won, lost, or void'
    );
  END IF;

  -- Get and lock the bet
  SELECT * INTO v_bet
  FROM bets
  WHERE id = p_bet_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bet not found'
    );
  END IF;

  -- Store old status
  v_old_status := v_bet.status;
  v_user_id := v_bet.user_id;

  -- Check if already settled
  IF v_old_status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bet already settled',
      'current_status', v_old_status
    );
  END IF;

  -- Update bet status
  UPDATE bets
  SET 
    status = p_status,
    payout = p_payout,
    settled_at = NOW()
  WHERE id = p_bet_id;

  -- If won or void, credit the wallet
  IF p_status IN ('won', 'void') AND p_payout > 0 THEN
    -- Unlock the stake from locked balance
    UPDATE wallets
    SET 
      locked_balance = GREATEST(locked_balance - v_bet.stake, 0),
      balance = balance + p_payout
    WHERE user_id = v_user_id;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      description,
      reference_id
    ) VALUES (
      v_user_id,
      CASE 
        WHEN p_status = 'won' THEN 'bet_win'
        ELSE 'bet_void'
      END,
      p_payout,
      'completed',
      CASE 
        WHEN p_status = 'won' THEN 'Bet won: ' || COALESCE(v_bet.event_name, v_bet.game_id, 'Unknown')
        ELSE 'Bet void: ' || COALESCE(v_bet.event_name, v_bet.game_id, 'Unknown')
      END,
      p_bet_id
    ) RETURNING id INTO v_transaction_id;
  ELSIF p_status = 'lost' THEN
    -- Unlock the stake from locked balance (no payout for lost bets)
    UPDATE wallets
    SET locked_balance = GREATEST(locked_balance - v_bet.stake, 0)
    WHERE user_id = v_user_id;
  END IF;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'bet_id', p_bet_id,
    'old_status', v_old_status,
    'new_status', p_status,
    'payout', p_payout,
    'transaction_id', v_transaction_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.settle_single_bet(uuid, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_single_bet(uuid, text, numeric) TO anon;

-- Comment
COMMENT ON FUNCTION public.settle_single_bet IS 'Settles a single bet and updates wallet balance. Uses SECURITY DEFINER to bypass RLS.';
