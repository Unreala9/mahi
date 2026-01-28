-- Create bets table
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_bet_id TEXT,
    sport TEXT NOT NULL,
    event TEXT NOT NULL,
    event_name TEXT,
    market TEXT NOT NULL,
    market_name TEXT,
    selection TEXT NOT NULL,
    selection_name TEXT,
    odds DECIMAL NOT NULL,
    stake DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void', 'cashed_out')),
    bet_type TEXT NOT NULL, -- 'BACK' or 'LAY'
    potential_payout DECIMAL NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS bets_user_id_idx ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS bets_status_idx ON public.bets(status);
CREATE INDEX IF NOT EXISTS bets_created_at_idx ON public.bets(created_at);

-- Add RLS policies
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
    ON public.bets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all bets"
    ON public.bets FOR ALL
    USING (auth.role() = 'service_role');
