-- Add trigger to keep transactions in sync with withdrawal_requests
-- This ensures that when withdrawal_requests is updated, transactions is also updated
-- (Though the RPC handles this, a trigger is a safety net)

-- 1. Function to sync status
CREATE OR REPLACE FUNCTION public.sync_withdrawal_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE public.transactions
        SET status = 'completed', completed_at = NOW(), updated_at = NOW()
        WHERE reference_id = NEW.id::text AND type = 'withdraw';
    ELSIF NEW.status = 'rejected' THEN
        UPDATE public.transactions
        SET status = 'cancelled', updated_at = NOW()
        WHERE reference_id = NEW.id::text AND type = 'withdraw';
    END IF;
    RETURN NEW;
END;
$$;

-- 2. Create Trigger (Drop first if exists)
DROP TRIGGER IF EXISTS tr_sync_withdrawal_transaction ON public.withdrawal_requests;
CREATE TRIGGER tr_sync_withdrawal_transaction
AFTER UPDATE OF status ON public.withdrawal_requests
FOR EACH ROW
EXECUTE PROCEDURE public.sync_withdrawal_transaction();
