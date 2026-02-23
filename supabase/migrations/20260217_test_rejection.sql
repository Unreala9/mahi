-- Test Rejection Manually
-- Replace 'THE_UUID_HERE' with one of the IDs from your screenshot
-- You can get the ID from inspecting the table

DO $$
DECLARE
  v_id uuid;
  v_res jsonb;
BEGIN
  -- Select the most recent pending request
  SELECT id INTO v_id FROM public.withdrawal_requests WHERE status = 'pending' LIMIT 1;

  IF v_id IS NOT NULL THEN
    RAISE NOTICE 'Attempting to reject request: %', v_id;

    -- Call the function
    v_res := public.reject_withdrawal(v_id);

    RAISE NOTICE 'Result: %', v_res;
  ELSE
    RAISE NOTICE 'No pending requests found';
  END IF;
END $$;
