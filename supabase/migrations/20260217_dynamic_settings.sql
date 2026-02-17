-- DYNAMIC SETTINGS MIGRATION
-- Create specific table for key-value system settings (Bank, UPI, QR)

create table if not exists public.system_settings (
    key text primary key,
    value jsonb not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by uuid references auth.users(id)
);

-- RLS
alter table public.system_settings enable row level security;

-- Allow read access to everyone (User Wallet needs to see bank details)
create policy "Allow public read access"
on public.system_settings for select
to authenticated, anon
using (true);

-- Allow write access only to admins
create policy "Allow admin write access"
on public.system_settings for all
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

-- Seed Initial Data (Placeholder)
insert into public.system_settings (key, value, description)
values
(
    'bank_details',
    '{"bankName": "HDFC Bank", "accountHolder": "Mahi Exchange", "accountNumber": "50200012345678", "ifsc": "HDFC0001234"}',
    'Bank Transfer Details'
),
(
    'upi_details',
    '{"upiId": "pay.mahi@axisbank"}',
    'Official UPI ID'
),
(
    'qr_code',
    '{"url": ""}',
    'QR Code Image URL'
)
on conflict (key) do nothing;
