-- Add missing fields to bets table for settlement
-- This migration adds fields needed for bet settlement functionality

-- Add payout field (actual payout after settlement)
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS payout DECIMAL DEFAULT 0;

-- Add settled_at timestamp
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE;

-- Add selection_id for matching bets to selections
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS selection_id TEXT;

-- Add event_id for matching bets to events/matches
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS event_id TEXT;

-- Add game_id as alias for event_id (some code uses this)
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS game_id TEXT;

-- Add market_id for fancy bets and other markets
ALTER TABLE public.bets 
ADD COLUMN IF NOT EXISTS market_id TEXT;

-- Add indexes for settlement queries
CREATE INDEX IF NOT EXISTS bets_event_id_idx ON public.bets(event_id);
CREATE INDEX IF NOT EXISTS bets_game_id_idx ON public.bets(game_id);
CREATE INDEX IF NOT EXISTS bets_selection_id_idx ON public.bets(selection_id);
CREATE INDEX IF NOT EXISTS bets_market_id_idx ON public.bets(market_id);
CREATE INDEX IF NOT EXISTS bets_settled_at_idx ON public.bets(settled_at);

-- Add comment explaining the fields
COMMENT ON COLUMN public.bets.payout IS 'Actual payout amount after settlement (0 for lost bets)';
COMMENT ON COLUMN public.bets.settled_at IS 'Timestamp when the bet was settled';
COMMENT ON COLUMN public.bets.potential_payout IS 'Potential payout if bet wins (calculated at placement)';
COMMENT ON COLUMN public.bets.selection_id IS 'ID of the selection/runner that was bet on';
COMMENT ON COLUMN public.bets.event_id IS 'ID of the event/match';
COMMENT ON COLUMN public.bets.game_id IS 'Alias for event_id (used by some code)';
COMMENT ON COLUMN public.bets.market_id IS 'ID of the market (for fancy bets, etc)';
