-- Force Reject specific ID for debugging
DO $$
DECLARE
  v_target_id uuid := '85aef80e-d96b-4b18-b19d-15adb13aaa23'; -- ID from your screenshot
  v_exists boolean;
BEGIN
  -- 1. Check if it exists
  SELECT EXISTS(SELECT 1 FROM public.withdrawal_requests WHERE id = v_target_id) INTO v_exists;

  IF v_exists THEN
    RAISE NOTICE 'Record found. Attempting update...';

    -- 2. Force Update Status
    UPDATE public.withdrawal_requests
    SET status = 'rejected',
        admin_notes = 'Manually Rejected via SQL Debug',
        updated_at = NOW()
    WHERE id = v_target_id;

    RAISE NOTICE 'Update executed.';

    -- 3. Verify Update
    IF EXISTS (SELECT 1 FROM public.withdrawal_requests WHERE id = v_target_id AND status = 'rejected') THEN
       RAISE NOTICE 'SUCCESS: Record is now REJECTED.';
    ELSE
       RAISE NOTICE 'FAILURE: Record is STILL PENDING. Check Triggers or RLS.';
    END IF;

  ELSE
    RAISE NOTICE 'Record NOT found with that ID.';
  END IF;
END $$;
