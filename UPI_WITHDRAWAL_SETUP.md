# UPI Withdrawal System

## Simple Manual UPI Payment Flow

This is a straightforward withdrawal system where users provide their UPI ID and admin manually sends money.

## How It Works

### User Side (Wallet Page)

1. User goes to Wallet → Withdraw tab
2. Enters withdrawal amount (₹1,000 - ₹10,000)
3. Enters their UPI ID (e.g., `username@paytm` or `9876543210@ybl`)
4. Clicks "Request UPI Payout"
5. Balance is immediately deducted
6. Request goes to admin for processing

### Admin Side (Admin Dashboard)

1. Admin sees withdrawal request notification
2. Request shows:
   - User name and email
   - Amount to transfer
   - User's UPI ID
3. Admin opens their payment app (PhonePe, GPay, Paytm, etc.)
4. Sends money to the user's UPI ID
5. Returns to dashboard and clicks "Approve"
6. Can add optional notes (e.g., transaction ID)

### If Admin Needs to Reject

1. Admin clicks "Reject" button
2. Amount is automatically refunded to user's balance
3. Transaction marked as failed

## Setup Steps

### 1. Run Database Migration

The `withdrawal_system.sql` migration is already created. Run it:

```bash
supabase migration up
```

This adds `payment_details` and `admin_notes` columns to the transactions table.

### 2. Deploy Admin Page

The `AdminWithdrawals.tsx` page is ready. Make sure it's accessible to admins in your admin dashboard.

### 3. Test the Flow

**As User:**
1. Login as a regular user
2. Go to Wallet page
3. Try requesting a withdrawal with your UPI ID

**As Admin:**
1. Login with admin account
2. Go to Admin Withdrawals page
3. See the pending request
4. Approve or reject it

## UPI ID Format

Users can enter UPI IDs in these formats:
- `username@paytm`
- `9876543210@ybl` (PhonePe/Google Pay)
- `username@oksbi` (SBI)
- `username@apl` (Amazon Pay)
- Any valid UPI ID format

## Security Features

✅ Balance deducted atomically during request (prevents double-spending)
✅ RLS policies ensure only user and admin can see transactions
✅ Admin role verification on approve/reject actions
✅ Failed withdrawals automatically refund user
✅ Real-time notifications to admin dashboard

## Payment Apps Admin Can Use

Admin can use ANY payment app to send money:
- PhonePe
- Google Pay (GPay)
- Paytm
- BHIM
- WhatsApp Pay
- Bank UPI apps
- Any UPI-enabled app

## Transaction States

- **Pending**: User requested, waiting for admin
- **Completed**: Admin approved and sent money
- **Failed**: Admin rejected, amount refunded

## Admin Notes

Admins can add notes when approving, such as:
- UPI transaction ID
- Date/time of transfer
- Any remarks

## Advantages of UPI Flow

✅ **Instant Transfers**: UPI is instant (unlike bank transfers)
✅ **No Fees**: UPI transactions are free
✅ **Simple**: Just need UPI ID, no complex bank details
✅ **Universal**: Works with all UPI apps
✅ **24/7 Available**: Works anytime, including holidays

## Troubleshooting

### User says they didn't receive money
1. Check admin dashboard - is it marked "Completed"?
2. Check if admin sent to correct UPI ID
3. Ask user to check all linked bank accounts
4. UPI transfers are instant, so check immediately

### Wrong UPI ID entered by user
1. If money already sent: Contact user to return it
2. If not sent yet: Reject the request (auto-refunds user)
3. User can request again with correct UPI ID

### Admin accidentally approved without sending
1. Send money to user's UPI ID immediately
2. Cannot reverse the approval in system
3. Add notes explaining the situation

## Next Steps

1. ✅ Migration is ready - run `supabase migration up`
2. ✅ Frontend is ready - both user and admin pages updated
3. ✅ Test with a small amount first
4. ✅ Train your admin team on the process
5. ✅ Monitor the dashboard regularly

---

**That's it! Simple, fast, and secure UPI withdrawals.** 🎯
