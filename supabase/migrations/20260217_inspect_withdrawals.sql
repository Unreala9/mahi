-- Inspect withdrawal_requests table
SELECT * FROM public.withdrawal_requests ORDER BY created_at DESC LIMIT 5;

-- Check wallet_id or other potential columns just in case
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'withdrawal_requests';
