-- Ensure RLS and Policies for withdrawal_requests

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- 1. Admins can do everything
DROP POLICY IF EXISTS "admins_manage_withdrawal_requests" ON public.withdrawal_requests;
CREATE POLICY "admins_manage_withdrawal_requests"
ON public.withdrawal_requests
FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Users can view their own requests
DROP POLICY IF EXISTS "users_view_own_requests" ON public.withdrawal_requests;
CREATE POLICY "users_view_own_requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Users can create their own requests (INSERT)
DROP POLICY IF EXISTS "users_create_own_requests" ON public.withdrawal_requests;
CREATE POLICY "users_create_own_requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Service Role (if needed)
DROP POLICY IF EXISTS "service_role_manage_withdrawals" ON public.withdrawal_requests;
CREATE POLICY "service_role_manage_withdrawals"
ON public.withdrawal_requests
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
