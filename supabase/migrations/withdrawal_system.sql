-- Simple Withdrawal Request System
-- Works with existing transactions table and request_withdrawal RPC
-- This just adds admin-friendly view and notification system

-- Add payment_details column to transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'payment_details'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN payment_details TEXT;
    END IF;
END $$;

-- Add admin notes column to transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Grant admin permissions to view all withdrawal transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Grant admin permissions to update withdrawal transactions
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
CREATE POLICY "Admins can update transactions"
    ON public.transactions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
