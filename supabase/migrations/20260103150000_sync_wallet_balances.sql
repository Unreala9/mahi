-- Recalculate and update wallet balance based on completed transactions
-- This will sum all completed deposit transactions and update the wallet

DO $$
DECLARE
    v_user_id UUID;
    v_total_deposits DECIMAL;
    v_wallet_exists BOOLEAN;
BEGIN
    -- Loop through each user with transactions
    FOR v_user_id IN 
        SELECT DISTINCT user_id FROM public.transactions WHERE type = 'deposit' AND status = 'completed'
    LOOP
        -- Calculate total completed deposits for this user
        SELECT COALESCE(SUM(amount), 0) INTO v_total_deposits
        FROM public.transactions
        WHERE user_id = v_user_id 
        AND type = 'deposit' 
        AND status = 'completed';

        -- Check if wallet exists
        SELECT EXISTS(SELECT 1 FROM public.wallets WHERE user_id = v_user_id) INTO v_wallet_exists;

        IF v_wallet_exists THEN
            -- Update existing wallet
            UPDATE public.wallets
            SET balance = v_total_deposits,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = v_user_id;
            
            RAISE NOTICE 'Updated wallet for user % with balance %', v_user_id, v_total_deposits;
        ELSE
            -- Create new wallet
            INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
            VALUES (v_user_id, v_total_deposits, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            
            RAISE NOTICE 'Created wallet for user % with balance %', v_user_id, v_total_deposits;
        END IF;
    END LOOP;
END $$;
