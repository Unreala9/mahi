-- NUCLEAR TRIGGER CLEANUP
-- This script creates a function to dynamically find and DROP ALL triggers on the 'transactions' table.
-- Then it recreates only the necessary one.

-- 1. Create a helper function to drop all triggers on a specific table
CREATE OR REPLACE FUNCTION public.drop_all_triggers_on_table(p_table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_trigger_record RECORD;
    v_sql text;
BEGIN
    FOR v_trigger_record IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = p_table_name
        AND trigger_schema = 'public'
    LOOP
        v_sql := 'DROP TRIGGER IF EXISTS "' || v_trigger_record.trigger_name || '" ON public."' || p_table_name || '";';
        RAISE NOTICE 'Dropping trigger: %', v_trigger_record.trigger_name;
        EXECUTE v_sql;
    END LOOP;
END;
$$;

-- 2. Execute the function for 'transactions' table
SELECT public.drop_all_triggers_on_table('transactions');

-- 3. Execute the function for 'wallets' table (just in case)
SELECT public.drop_all_triggers_on_table('wallets');

-- 4. Re-add ONLY the essential updated_at triggers
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- 5. Force drop the user_wallets table again
DROP TABLE IF EXISTS public.user_wallets CASCADE;

-- 6. Verification: Output remaining triggers (Manual check by user if needed)
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('transactions', 'wallets', 'user_wallets');
