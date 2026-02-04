-- Add API event tracking columns to bets table for auto-settlement
ALTER TABLE public.bets
ADD COLUMN IF NOT EXISTS api_event_id TEXT,
ADD COLUMN IF NOT EXISTS api_market_type TEXT,
ADD COLUMN IF NOT EXISTS api_result JSONB,
ADD COLUMN IF NOT EXISTS auto_settled BOOLEAN DEFAULT FALSE;

-- Create indexes for faster settlement queries
CREATE INDEX IF NOT EXISTS idx_bets_api_event_pending
ON public.bets(api_event_id, status)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_bets_auto_settlement
ON public.bets(api_event_id, api_market_type, status)
WHERE status = 'pending' AND auto_settled = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.bets.api_event_id IS 'Diamond API event/match ID (gmid) for linking bets to API results';
COMMENT ON COLUMN public.bets.api_market_type IS 'Type of market from API: match_odds, bookmaker, or fancy';
COMMENT ON COLUMN public.bets.api_result IS 'Raw API result data for this event stored as JSON';
COMMENT ON COLUMN public.bets.auto_settled IS 'Whether this bet was automatically settled by the system';
