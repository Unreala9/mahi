-- Add razorpay_order_id column to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_razorpay_order_id 
ON public.transactions(razorpay_order_id);
