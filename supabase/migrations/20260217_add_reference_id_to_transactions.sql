-- Add reference_id column to transactions table
-- This column is required to link transactions to withdrawal_requests

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS reference_id text;

-- Optional: Create an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON public.transactions(reference_id);
