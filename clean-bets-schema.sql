-- Clean up and Fix Bets Table Schema
-- Run this in Supabase SQL Editor

-- 1. Drop unused redundant columns
ALTER TABLE public.bets
DROP COLUMN IF EXISTS event_id,
DROP COLUMN IF EXISTS game_id,
DROP COLUMN IF EXISTS market_id,
DROP COLUMN IF EXISTS selection_id;

-- 2. Add necessary columns for betting logic (if they don't exist)
ALTER TABLE public.bets
ADD COLUMN IF NOT EXISTS bet_on text CHECK (bet_on IN ('odds', 'fancy', 'bookmaker')),
ADD COLUMN IF NOT EXISTS exposure numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rate numeric DEFAULT 100;

-- 3. Ensure correctness of existing columns (optional constraints)
-- Ensure IDs are text (as used in code)
-- event, market, selection are already text in the provided DDL

-- 4. Re-create indexes for remaining useful columns
-- (Some were on dropped columns, so those indexes are gone automatically)
CREATE INDEX IF NOT EXISTS idx_bets_event ON public.bets(event);
CREATE INDEX IF NOT EXISTS idx_bets_market ON public.bets(market);
CREATE INDEX IF NOT EXISTS idx_bets_bet_on ON public.bets(bet_on);

-- 5. Verification
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'bets';

-- 6. User Roles Table (Fix for Sidebar 404 Error)
-- Create enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('player', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_roles_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON public.user_roles;
CREATE POLICY "Service role full access" ON public.user_roles
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default roles for existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'player'::public.app_role
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id)
ON CONFLICT (user_id) DO NOTHING;
