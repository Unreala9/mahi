# Simple Manual Withdrawal System Setup

## How It Works

1. **User requests withdrawal** from Wallet page
2. **System deducts amount** from user balance immediately
3. **Admin gets notified** in dashboard (real-time)
4. **Admin transfers money** to user manually
5. **Admin approves** the withdrawal in system
6. OR **Admin rejects** - money refunded automatically to user

## Setup Steps

### 1. Run Database Migration

Execute in Supabase SQL Editor:
```bash
supabase/migrations/withdrawal_system.sql
```

This adds admin columns to transactions table and sets up permissions.

### 2. Set Admin User

Run in Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 3. Add Admin Route

Add to your app routing:
```typescript
{
  path: "/admin/withdrawals",
  element: <AdminWithdrawals />
}
```

### 4. Test the Flow

**As User:**
1. Go to Wallet page
2. Enter withdrawal amount (1000-10000)
3. Click "Request Payout"
4. See balance deducted immediately

**As Admin:**
1. Go to `/admin/withdrawals`
2. See pending withdrawal request
3. Transfer money to user manually (UPI/bank/etc)
4. Click "Approve" button
5. Add notes (optional) and confirm

## Features

- ✅ Real-time notifications for admin
- ✅ Automatic balance deduction on request
- ✅ Automatic refund on rejection
- ✅ Admin notes for tracking
- ✅ Withdrawal limits (1000-10000)
- ✅ Full transaction history

## Admin Dashboard

The admin page shows:
- All withdrawal requests (pending, completed, rejected)
- User information (name, email)
- Requested amount
- Status badge
- Approve/Reject buttons
- Real-time updates

## User Experience

Users see:
- Withdrawal request in transaction history
- Status: "pending" → "completed" or "failed"
- Balance updates in real-time
- Can't request more withdrawals until current one is processed

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Only admins can approve/reject
- ✅ Atomic transactions (no double-spending)
- ✅ Validated amounts (1000-10000)
- ✅ Users can only see their own withdrawals

## Notification Sound

Add a notification sound file: `/public/notification.mp3`

Or remove the audio code from AdminWithdrawals.tsx if not needed.

---

**That's it!** Simple, secure, and works with your existing system.
