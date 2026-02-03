-- ============================================================================
-- QUICK FIX: Set Admin Role for Your Account
-- ============================================================================
--
-- INSTRUCTIONS:
-- 1. Replace 'your-email@example.com' with your actual email address
-- 2. Run this script in Supabase SQL Editor
-- 3. Logout and login again
-- 4. Admin panel should now show all data
--
-- ============================================================================

-- Step 1: Check if your profile exists and current role
SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE email = 'your-email@example.com';

-- Step 2: Update role to admin
-- REPLACE 'your-email@example.com' WITH YOUR ACTUAL EMAIL!
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Step 3: Verify the update was successful
SELECT
    id,
    email,
    full_name,
    role as "Current Role",
    CASE
        WHEN role = 'admin' THEN '✅ Admin access granted'
        ELSE '❌ Not admin'
    END as "Status"
FROM profiles
WHERE email = 'your-email@example.com';

-- ============================================================================
-- Optional: Create admin if profile doesn't exist
-- ============================================================================
-- Uncomment and run this if you don't have a profile yet:
/*
INSERT INTO profiles (id, email, full_name, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
    'your-email@example.com',
    'Admin User',
    'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
*/

-- ============================================================================
-- Verify RLS Policies are Working
-- ============================================================================
-- This should now return data if you're an admin:
SELECT COUNT(*) as "Total Transactions" FROM transactions;
SELECT COUNT(*) as "Total Bets" FROM bets;
SELECT COUNT(*) as "Total Users" FROM profiles;
SELECT COUNT(*) as "Total Wallets" FROM wallets;

-- ============================================================================
-- Check who has admin access
-- ============================================================================
SELECT
    email,
    full_name,
    role,
    created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Next steps:
-- 1. Logout of your admin account
-- 2. Login again at /admin/login
-- 3. Navigate to /admin dashboard
-- 4. You should now see:
--    ✅ Transactions data
--    ✅ Bets data
--    ✅ Withdrawal requests
--    ✅ User list
--    ✅ Dashboard statistics
-- ============================================================================
