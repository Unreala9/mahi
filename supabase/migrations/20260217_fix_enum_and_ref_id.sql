-- FIX: Add 'withdraw' to Enum and 'reference_id' to Transactions

-- 1. Add 'withdraw' to transaction_type enum (Safely)
-- We wrap in a DO block to avoid errors if it already exists
DO $$
BEGIN
    ALTER TYPE public.transaction_type ADD VALUE 'withdraw';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Value "withdraw" already exists in enum';
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add value "withdraw": %', SQLERRM;
END $$;

-- 2. Add reference_id column to transactions (Safely)
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS reference_id text;

-- 3. Create index for reference_id
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON public.transactions(reference_id);
