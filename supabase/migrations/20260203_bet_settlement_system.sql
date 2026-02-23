-- Secure Bet Settlement System for Sports/Casino Betting
-- This function handles all bet settlements with proper locking and transaction safety

CREATE OR REPLACE FUNCTION public.settle_market(
  p_market_id uuid,
  p_result_code text,
  p_settlement_mode text DEFAULT 'normal'
)
RETURNS TABLE(
  success boolean,
  message text,
  market_id uuid,
  total_bets integer,
  total_won integer,
  total_lost integer,
  total_void integer,
  total_half_won integer,
  total_half_lost integer,
  total_payout numeric,
  settlement_mode text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_market_record record;
  v_bet_record record;
  v_selection_record record;
  v_payout numeric;
  v_stake_half numeric;
  v_stats record := (0, 0, 0, 0, 0, 0, 0.00)::record;
  v_transaction_id uuid;
BEGIN
  -- Initialize stats tracking
  v_stats.total_bets := 0;
  v_stats.total_won := 0;
  v_stats.total_lost := 0;
  v_stats.total_void := 0;
  v_stats.total_half_won := 0;
  v_stats.total_half_lost := 0;
  v_stats.total_payout := 0.00;

  -- Validate settlement mode
  IF p_settlement_mode NOT IN ('normal', 'void', 'half_win', 'half_lost') THEN
    RAISE EXCEPTION 'Invalid settlement mode: %. Must be normal, void, half_win, or half_lost', p_settlement_mode;
  END IF;

  -- Step 1: Check and lock market (prevent double settlement)
  SELECT * INTO v_market_record
  FROM markets
  WHERE id = p_market_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    success := false;
    message := 'Market not found';
    market_id := p_market_id;
    total_bets := 0;
    total_won := 0;
    total_lost := 0;
    total_void := 0;
    total_half_won := 0;
    total_half_lost := 0;
    total_payout := 0;
    settlement_mode := p_settlement_mode;
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_market_record.status = 'settled' THEN
    success := false;
    message := 'Market already settled';
    market_id := p_market_id;
    total_bets := 0;
    total_won := 0;
    total_lost := 0;
    total_void := 0;
    total_half_won := 0;
    total_half_lost := 0;
    total_payout := 0;
    settlement_mode := p_settlement_mode;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Step 2: Update market result and status
  UPDATE markets
  SET
    result = p_result_code,
    status = 'settled'
  WHERE id = p_market_id;

  -- Step 3: Process all pending bets with proper locking
  FOR v_bet_record IN
    SELECT b.*, s.code as selection_code, s.odds as current_odds
    FROM bets b
    JOIN selections s ON b.selection_id = s.id
    WHERE b.market_id = p_market_id
    AND b.status = 'pending'
    FOR UPDATE OF b NOWAIT
  LOOP
    v_stats.total_bets := v_stats.total_bets + 1;
    v_payout := 0;

    -- Calculate payout based on settlement mode
    CASE p_settlement_mode
      WHEN 'normal' THEN
        IF v_bet_record.selection_code = p_result_code THEN
          -- Win: payout = stake * odds
          v_payout := v_bet_record.stake * v_bet_record.odds;
          v_stats.total_won := v_stats.total_won + 1;

          UPDATE bets
          SET status = 'won',
              payout = v_payout,
              settled_at = NOW()
          WHERE id = v_bet_record.id;
        ELSE
          -- Loss: no payout
          v_payout := 0;
          v_stats.total_lost := v_stats.total_lost + 1;

          UPDATE bets
          SET status = 'lost',
              payout = 0,
              settled_at = NOW()
          WHERE id = v_bet_record.id;
        END IF;

      WHEN 'void' THEN
        -- Void: refund stake
        v_payout := v_bet_record.stake;
        v_stats.total_void := v_stats.total_void + 1;

        UPDATE bets
        SET status = 'void',
            payout = v_payout,
            settled_at = NOW()
        WHERE id = v_bet_record.id;

      WHEN 'half_win' THEN
        -- Half win: (stake/2 * odds) + (stake/2) = half won + half void
        v_stake_half := v_bet_record.stake / 2;
        v_payout := (v_stake_half * v_bet_record.odds) + v_stake_half;
        v_stats.total_half_won := v_stats.total_half_won + 1;

        UPDATE bets
        SET status = 'half_won',
            payout = v_payout,
            settled_at = NOW()
        WHERE id = v_bet_record.id;

      WHEN 'half_lost' THEN
        -- Half lost: stake/2 refunded (half lost + half void)
        v_payout := v_bet_record.stake / 2;
        v_stats.total_half_lost := v_stats.total_half_lost + 1;

        UPDATE bets
        SET status = 'half_lost',
            payout = v_payout,
            settled_at = NOW()
        WHERE id = v_bet_record.id;
    END CASE;

    -- Credit user wallet if there's a payout
    IF v_payout > 0 THEN
      -- Update wallet balance atomically
      UPDATE wallets
      SET balance = balance + v_payout
      WHERE user_id = v_bet_record.user_id;

      -- Create transaction record
      v_transaction_id := gen_random_uuid();

      INSERT INTO transactions (
        id,
        user_id,
        bet_id,
        amount,
        type,
        created_at
      ) VALUES (
        v_transaction_id,
        v_bet_record.user_id,
        v_bet_record.id,
        v_payout,
        CASE
          WHEN p_settlement_mode = 'normal' AND v_bet_record.selection_code = p_result_code THEN 'bet_win'
          WHEN p_settlement_mode = 'void' THEN 'bet_void_refund'
          WHEN p_settlement_mode = 'half_win' THEN 'bet_half_win'
          WHEN p_settlement_mode = 'half_lost' THEN 'bet_half_refund'
          ELSE 'bet_settlement'
        END,
        NOW()
      );
    END IF;

    v_stats.total_payout := v_stats.total_payout + v_payout;
  END LOOP;

  -- Return settlement summary
  success := true;
  message := 'Market settled successfully';
  market_id := p_market_id;
  total_bets := v_stats.total_bets;
  total_won := v_stats.total_won;
  total_lost := v_stats.total_lost;
  total_void := v_stats.total_void;
  total_half_won := v_stats.total_half_won;
  total_half_lost := v_stats.total_half_lost;
  total_payout := v_stats.total_payout;
  settlement_mode := p_settlement_mode;

  RETURN NEXT;
END;
$$;

-- Grant execution only to service_role for security
GRANT EXECUTE ON FUNCTION public.settle_market(uuid, text, text) TO service_role;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_bets_market_status ON bets(market_id, status);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_selections_market_id ON selections(market_id);

-- Add constraint to prevent negative wallet balances
ALTER TABLE wallets
ADD CONSTRAINT check_positive_balance
CHECK (balance >= 0);

COMMENT ON FUNCTION public.settle_market IS 'Secure bet settlement function - callable only by service role with proper locking to prevent double settlements';