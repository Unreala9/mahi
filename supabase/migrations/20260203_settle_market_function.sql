-- =====================================================
-- PRODUCTION-READY MARKET SETTLEMENT FUNCTION
-- Settles all pending bets for a market in a single transaction
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.settle_market(uuid, text, text);

-- Create the settlement function
CREATE OR REPLACE FUNCTION public.settle_market(
  p_market_id text,
  p_result_code text,
  p_settlement_mode text DEFAULT 'normal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_market record;
  v_bet record;
  v_selection record;
  v_wallet record;
  v_payout numeric;
  v_total_bets integer := 0;
  v_total_won integer := 0;
  v_total_lost integer := 0;
  v_total_void integer := 0;
  v_total_payout numeric := 0;
  v_bet_status text;
  v_is_winner boolean;
BEGIN
  -- Validate settlement mode
  IF p_settlement_mode NOT IN ('normal', 'void', 'half_win', 'half_lost') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid settlement mode. Must be: normal, void, half_win, or half_lost'
    );
  END IF;

  -- Lock and fetch market to prevent double settlement
  SELECT * INTO v_market
  FROM bets
  WHERE market = p_market_id
  LIMIT 1
  FOR UPDATE;

  -- Check if market exists (by checking if any bets exist for it)
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No bets found for this market'
    );
  END IF;

  -- Get all pending bets for this market
  FOR v_bet IN
    SELECT *
    FROM bets
    WHERE market = p_market_id
      AND status = 'pending'
    FOR UPDATE
  LOOP
    v_total_bets := v_total_bets + 1;
    v_payout := 0;
    
    -- Determine if this bet won based on selection
    -- In casino games, selection_name is what user bet on (e.g., "PLAYER A")
    -- p_result_code is the winner (e.g., "A")
    v_is_winner := false;
    
    -- Normalize both for comparison
    IF p_settlement_mode = 'normal' THEN
      -- Check if bet selection matches result
      v_is_winner := (
        UPPER(REPLACE(REPLACE(REPLACE(v_bet.selection_name, ' ', ''), '_', ''), '-', '')) 
        = UPPER(REPLACE(REPLACE(REPLACE(p_result_code, ' ', ''), '_', ''), '-', ''))
        OR
        UPPER(REPLACE(REPLACE(REPLACE(v_bet.selection, ' ', ''), '_', ''), '-', '')) 
        = UPPER(REPLACE(REPLACE(REPLACE(p_result_code, ' ', ''), '_', ''), '-', ''))
        OR
        UPPER(v_bet.selection_name) LIKE '%' || UPPER(p_result_code) || '%'
        OR
        UPPER(p_result_code) LIKE '%' || UPPER(v_bet.selection_name) || '%'
      );
    END IF;

    -- Calculate payout and status based on settlement mode
    CASE p_settlement_mode
      WHEN 'normal' THEN
        IF v_is_winner THEN
          v_bet_status := 'won';
          v_payout := v_bet.stake * v_bet.odds;
          v_total_won := v_total_won + 1;
        ELSE
          v_bet_status := 'lost';
          v_payout := 0;
          v_total_lost := v_total_lost + 1;
        END IF;

      WHEN 'void' THEN
        v_bet_status := 'void';
        v_payout := v_bet.stake; -- Full refund
        v_total_void := v_total_void + 1;

      WHEN 'half_win' THEN
        IF v_is_winner THEN
          v_bet_status := 'won';
          -- Half stake wins, half refunded
          v_payout := (v_bet.stake / 2 * v_bet.odds) + (v_bet.stake / 2);
          v_total_won := v_total_won + 1;
        ELSE
          v_bet_status := 'lost';
          -- Half stake lost, half refunded
          v_payout := v_bet.stake / 2;
          v_total_lost := v_total_lost + 1;
        END IF;

      WHEN 'half_lost' THEN
        IF v_is_winner THEN
          v_bet_status := 'won';
          -- Half stake wins, half lost
          v_payout := v_bet.stake / 2 * v_bet.odds;
          v_total_won := v_total_won + 1;
        ELSE
          v_bet_status := 'lost';
          -- Half stake lost, half refunded
          v_payout := v_bet.stake / 2;
          v_total_lost := v_total_lost + 1;
        END IF;
    END CASE;

    -- Update bet status and payout
    UPDATE bets
    SET
      status = v_bet_status,
      payout = v_payout,
      settled_at = NOW()
    WHERE id = v_bet.id;

    -- If there's a payout (won or void), credit user's wallet
    IF v_payout > 0 THEN
      -- Lock wallet for update
      SELECT * INTO v_wallet
      FROM wallets
      WHERE user_id = v_bet.user_id
      FOR UPDATE;

      -- Create wallet if doesn't exist
      IF NOT FOUND THEN
        INSERT INTO wallets (user_id, balance, created_at, updated_at)
        VALUES (v_bet.user_id, v_payout, NOW(), NOW());
      ELSE
        -- Update wallet balance
        UPDATE wallets
        SET
          balance = balance + v_payout,
          updated_at = NOW()
        WHERE user_id = v_bet.user_id;
      END IF;

      -- Insert transaction record
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        created_at
      )
      VALUES (
        v_bet.user_id,
        CASE
          WHEN v_bet_status = 'won' THEN 'bet_win'
          WHEN v_bet_status = 'void' THEN 'bet_void_refund'
          ELSE 'bet_settlement'
        END,
        v_payout,
        'completed',
        format(
          'Settlement for bet %s - %s (%s mode)',
          v_bet.id,
          v_bet_status,
          p_settlement_mode
        ),
        NOW()
      );

      v_total_payout := v_total_payout + v_payout;
    END IF;
  END LOOP;

  -- Return settlement summary
  RETURN jsonb_build_object(
    'success', true,
    'market_id', p_market_id,
    'result_code', p_result_code,
    'settlement_mode', p_settlement_mode,
    'summary', jsonb_build_object(
      'total_bets', v_total_bets,
      'total_won', v_total_won,
      'total_lost', v_total_lost,
      'total_void', v_total_void,
      'total_payout', v_total_payout
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically, just return error
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.settle_market(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_market(text, text, text) TO service_role;

-- Create convenience function for settling by market_name (event)
CREATE OR REPLACE FUNCTION public.settle_market_by_event(
  p_event_id text,
  p_market_name text,
  p_result_code text,
  p_settlement_mode text DEFAULT 'normal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_market_id text;
  v_result jsonb;
BEGIN
  -- Find market ID from event and market_name
  SELECT market INTO v_market_id
  FROM bets
  WHERE event = p_event_id
    AND market_name = p_market_name
    AND status = 'pending'
  LIMIT 1;

  IF v_market_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Market not found or no pending bets'
    );
  END IF;

  -- Call the main settlement function
  RETURN settle_market(v_market_id, p_result_code, p_settlement_mode);
END;
$$;

GRANT EXECUTE ON FUNCTION public.settle_market_by_event(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_market_by_event(text, text, text, text) TO service_role;

-- Comments for documentation
COMMENT ON FUNCTION public.settle_market IS 'Settles all pending bets for a market in a single atomic transaction. Supports normal, void, half_win, and half_lost settlement modes.';
COMMENT ON FUNCTION public.settle_market_by_event IS 'Settles bets by event ID and market name. Convenience wrapper around settle_market.';
