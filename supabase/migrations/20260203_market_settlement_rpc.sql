-- =====================================================
-- Market Settlement RPC Function
-- Settles all pending bets for a market atomically
-- =====================================================

-- Create settlement_mode enum type
DO $$ BEGIN
  CREATE TYPE settlement_mode AS ENUM ('normal', 'void', 'half_win', 'half_lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.settle_market(text, text, settlement_mode);

-- Create the settlement function
CREATE OR REPLACE FUNCTION public.settle_market(
  p_market_id text,
  p_result_code text,
  p_settlement_mode settlement_mode DEFAULT 'normal'
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
  v_total_bets integer := 0;
  v_total_won integer := 0;
  v_total_lost integer := 0;
  v_total_void integer := 0;
  v_total_payout numeric := 0;
  v_bet_status text;
  v_bet_payout numeric;
  v_transaction_type text;
BEGIN
  -- Lock and fetch market to prevent concurrent settlement
  SELECT * INTO v_market
  FROM markets
  WHERE id = p_market_id
  FOR UPDATE;

  -- Check if market exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Market not found',
      'market_id', p_market_id
    );
  END IF;

  -- Check if market is already settled
  IF v_market.status = 'settled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Market already settled',
      'market_id', p_market_id,
      'settled_at', v_market.settled_at
    );
  END IF;

  -- Update market status to settled
  UPDATE markets
  SET 
    status = 'settled',
    result = p_result_code,
    settled_at = NOW()
  WHERE id = p_market_id;

  -- Process all pending bets for this market
  FOR v_bet IN 
    SELECT b.* 
    FROM bets b
    WHERE b.market = p_market_id
      AND b.status = 'pending'
    FOR UPDATE
  LOOP
    v_total_bets := v_total_bets + 1;

    -- Get selection details to check if it's the winner
    -- In your current schema, selection is stored as text in bets table
    -- We'll compare bet.selection with p_result_code
    
    -- Calculate payout based on settlement mode
    CASE p_settlement_mode
      WHEN 'normal' THEN
        -- Check if bet selection matches result
        IF v_bet.selection = p_result_code OR v_bet.selection_name = p_result_code THEN
          -- Winner
          v_bet_status := 'won';
          v_bet_payout := v_bet.stake * v_bet.odds;
          v_transaction_type := 'bet_win';
          v_total_won := v_total_won + 1;
        ELSE
          -- Loser
          v_bet_status := 'lost';
          v_bet_payout := 0;
          v_transaction_type := NULL; -- No transaction for lost bets
          v_total_lost := v_total_lost + 1;
        END IF;

      WHEN 'void' THEN
        -- Void - refund stake
        v_bet_status := 'void';
        v_bet_payout := v_bet.stake;
        v_transaction_type := 'bet_void_refund';
        v_total_void := v_total_void + 1;

      WHEN 'half_win' THEN
        -- Half stake won at odds, half stake refunded
        IF v_bet.selection = p_result_code OR v_bet.selection_name = p_result_code THEN
          v_bet_status := 'won';
          v_bet_payout := (v_bet.stake / 2 * v_bet.odds) + (v_bet.stake / 2);
          v_transaction_type := 'bet_win';
          v_total_won := v_total_won + 1;
        ELSE
          v_bet_status := 'lost';
          v_bet_payout := v_bet.stake / 2; -- Refund half
          v_transaction_type := 'bet_void_refund';
          v_total_lost := v_total_lost + 1;
        END IF;

      WHEN 'half_lost' THEN
        -- Half stake lost, half stake refunded
        IF v_bet.selection = p_result_code OR v_bet.selection_name = p_result_code THEN
          v_bet_status := 'won';
          v_bet_payout := (v_bet.stake / 2 * v_bet.odds) + (v_bet.stake / 2);
          v_transaction_type := 'bet_win';
          v_total_won := v_total_won + 1;
        ELSE
          v_bet_status := 'lost';
          v_bet_payout := v_bet.stake / 2; -- Refund half
          v_transaction_type := 'bet_void_refund';
          v_total_lost := v_total_lost + 1;
        END IF;

    END CASE;

    -- Update bet record
    UPDATE bets
    SET
      status = v_bet_status,
      payout = v_bet_payout,
      settled_at = NOW()
    WHERE id = v_bet.id;

    -- Add to total payout
    v_total_payout := v_total_payout + v_bet_payout;

    -- Credit user balance if payout > 0
    IF v_bet_payout > 0 THEN
      -- Use increment_balance RPC function
      PERFORM increment_balance(v_bet.user_id, v_bet_payout);

      -- Insert transaction record
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        provider_ref_id,
        description
      ) VALUES (
        v_bet.user_id,
        v_transaction_type,
        v_bet_payout,
        'completed',
        v_bet.id::text,
        format('Settlement: %s - %s (Market: %s)', 
          v_bet_status, 
          v_bet.selection_name, 
          p_market_id
        )
      );
    END IF;

  END LOOP;

  -- Return settlement summary
  RETURN jsonb_build_object(
    'success', true,
    'market_id', p_market_id,
    'result_code', p_result_code,
    'settlement_mode', p_settlement_mode,
    'total_bets', v_total_bets,
    'total_won', v_total_won,
    'total_lost', v_total_lost,
    'total_void', v_total_void,
    'total_payout', v_total_payout,
    'settled_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.settle_market(text, text, settlement_mode) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_market(text, text, settlement_mode) TO service_role;

-- Drop and recreate increment_balance function (for settlements)
DROP FUNCTION IF EXISTS public.increment_balance(uuid, numeric);

CREATE OR REPLACE FUNCTION public.increment_balance(
  p_user_id uuid,
  p_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet record;
  v_new_balance numeric;
BEGIN
  SELECT * INTO v_wallet
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance, created_at, updated_at)
    VALUES (p_user_id, p_amount, NOW(), NOW());
    
    RETURN jsonb_build_object(
      'success', true,
      'old_balance', 0,
      'new_balance', p_amount,
      'added', p_amount
    );
  END IF;

  v_new_balance := v_wallet.balance + p_amount;

  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'old_balance', v_wallet.balance,
    'new_balance', v_new_balance,
    'added', p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_balance(uuid, numeric) TO service_role;

-- Add markets table if not exists (for the settlement system)
CREATE TABLE IF NOT EXISTS public.markets (
  id text PRIMARY KEY,
  event_id text NOT NULL,
  event_name text,
  name text NOT NULL,
  type text NOT NULL,
  result text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'suspended', 'settled', 'cancelled')),
  settled_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_markets_event_id ON markets(event_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_bets_market_status ON bets(market, status);

COMMENT ON FUNCTION public.settle_market IS 'Settles all pending bets for a market atomically with support for normal, void, half_win, and half_lost settlements';
