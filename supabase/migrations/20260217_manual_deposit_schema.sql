-- Migration: 20260217_manual_deposit_schema
-- Description: Schema changes for manual deposit system (screenshot proof, admin approval)

-- 1. Add screenshot_url to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS screenshot_url text,
ADD COLUMN IF NOT EXISTS admin_processed_by uuid REFERENCES auth.users(id);

-- 2. Create Storage Bucket for Deposit Proofs (if not exists)
-- Note: This requires the 'storage' extension which is usually enabled by default in Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit_proofs', 'deposit_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Allow authenticated users to upload, Public/Admins to view)
CREATE POLICY "Give users access to own folder 1oj01k_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'deposit_proofs' AND auth.role() = 'authenticated');
CREATE POLICY "Give users access to own folder 1oj01k_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'deposit_proofs' AND auth.role() = 'authenticated');
-- Admin policy (simplified for now, relying on public bucket or Authenticated role)

-- 4. RPC: Approve Deposit
CREATE OR REPLACE FUNCTION public.approve_deposit(
  p_transaction_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx record;
  v_admin_id uuid;
BEGIN
  -- Get current user ID (admin)
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access denied: Admin only');
  END IF;

  -- Lock transaction row
  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
  END IF;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction is not pending');
  END IF;

  IF v_tx.type <> 'deposit' THEN
     RETURN jsonb_build_object('success', false, 'message', 'Transaction is not a deposit');
  END IF;

  -- Update transaction
  UPDATE public.transactions
  SET status = 'completed',
      completed_at = NOW(),
      updated_at = NOW(),
      admin_processed_by = v_admin_id,
      description = 'Manual Deposit Approved'
  WHERE id = p_transaction_id;

  -- Credit Wallet
  UPDATE public.wallets
  SET balance = balance + v_tx.amount,
      total_deposited = total_deposited + v_tx.amount,
      updated_at = NOW()
  WHERE user_id = v_tx.user_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 5. RPC: Reject Deposit
CREATE OR REPLACE FUNCTION public.reject_deposit(
  p_transaction_id uuid,
  p_reason text DEFAULT 'Invalid Proof'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx record;
  v_admin_id uuid;
BEGIN
  -- Get current user ID (admin)
  v_admin_id := auth.uid();

  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Access denied: Admin only');
  END IF;

  -- Lock transaction row
  SELECT * INTO v_tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction not found');
  END IF;

  IF v_tx.status <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Transaction is not pending');
  END IF;

  -- Update transaction
  UPDATE public.transactions
  SET status = 'cancelled',
      updated_at = NOW(),
      admin_processed_by = v_admin_id,
      admin_notes = p_reason,
      description = 'Manual Deposit Rejected: ' || p_reason
  WHERE id = p_transaction_id;

  -- No wallet change for rejected deposit

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
