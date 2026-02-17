-- Create Withdrawal Requests Table
-- This table is dedicated to managing withdrawal requests separately from transactions.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_details text, -- UPI ID or Bank Details
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id),
  CONSTRAINT withdrawal_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Drop first to avoid errors)

-- Allow users to view their own requests
DROP POLICY IF EXISTS "users_view_own_withdrawal_requests" ON public.withdrawal_requests;
CREATE POLICY "users_view_own_withdrawal_requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create withdrawal requests
DROP POLICY IF EXISTS "users_create_withdrawal_requests" ON public.withdrawal_requests;
CREATE POLICY "users_create_withdrawal_requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all requests
DROP POLICY IF EXISTS "admins_view_all_withdrawal_requests" ON public.withdrawal_requests;
CREATE POLICY "admins_view_all_withdrawal_requests"
ON public.withdrawal_requests
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow admins to update requests (approve/reject)
DROP POLICY IF EXISTS "admins_update_withdrawal_requests" ON public.withdrawal_requests;
CREATE POLICY "admins_update_withdrawal_requests"
ON public.withdrawal_requests
FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Create Trigger to update updated_at
-- Convert this to a reusable block if needed, or check if trigger exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_withdrawal_requests_updated_at') THEN
        CREATE TRIGGER update_withdrawal_requests_updated_at
        BEFORE UPDATE ON public.withdrawal_requests
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at();
    END IF;
END $$;
