-- Add missing columns to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_ref_id TEXT,
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add unique constraint
DO $$ BEGIN
    ALTER TABLE public.transactions
    ADD CONSTRAINT provider_ref_unique UNIQUE (provider, provider_ref_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;
