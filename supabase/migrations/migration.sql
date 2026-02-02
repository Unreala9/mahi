
-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure columns exist even if table was already created
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text default 'user' check (role in ('user', 'admin'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text;
  end if;
end $$;

-- 2. Provider Accounts Table
create table if not exists public.provider_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider_user_id text,
  provider_token_json jsonb,
  created_at timestamptz default now()
);

-- 3. API Logs Table
create table if not exists public.api_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  area text, -- 'sports', 'casino', 'wallet'
  endpoint text,
  request_json jsonb,
  response_json jsonb,
  status_code int,
  latency_ms int,
  created_at timestamptz default now()
);

-- 4. Bets Table
create table if not exists public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider_bet_id text,
  sport text,
  event text,
  market text,
  selection text,
  odds numeric,
  stake numeric,
  status text default 'pending', -- 'pending', 'won', 'lost', 'void'
  created_at timestamptz default now()
);

-- 5. Wallet Transactions Table
create table if not exists public.wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('deposit', 'withdraw', 'bet', 'win', 'bonus')),
  amount numeric not null,
  status text default 'pending', -- 'pending', 'completed', 'failed'
  reference text, -- external transaction id or bet id
  created_at timestamptz default now()
);

-- 6. Casino Sessions Table
create table if not exists public.casino_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id text not null,
  launch_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.provider_accounts enable row level security;
alter table public.api_logs enable row level security;
alter table public.bets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.casino_sessions enable row level security;

-- Policies

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Provider Accounts (Admin view only or internal use usually, but let's allow user to see own)
drop policy if exists "Users can view own provider accounts" on public.provider_accounts;
create policy "Users can view own provider accounts" on public.provider_accounts
  for select using (auth.uid() = user_id);

-- API Logs (Admin only usually, maybe user can see own?)
drop policy if exists "Admins can view all api logs" on public.api_logs;
create policy "Admins can view all api logs" on public.api_logs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Bets
drop policy if exists "Users can view own bets" on public.bets;
create policy "Users can view own bets" on public.bets
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all bets" on public.bets;
create policy "Admins can view all bets" on public.bets
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Wallet Transactions
drop policy if exists "Users can view own wallet transactions" on public.wallet_transactions;
create policy "Users can view own wallet transactions" on public.wallet_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all wallet transactions" on public.wallet_transactions;
create policy "Admins can view all wallet transactions" on public.wallet_transactions
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Casino Sessions
drop policy if exists "Users can view own casino sessions" on public.casino_sessions;
create policy "Users can view own casino sessions" on public.casino_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all casino sessions" on public.casino_sessions;
create policy "Admins can view all casino sessions" on public.casino_sessions
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- Indexes for performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_bets_user_id on public.bets(user_id);
create index if not exists idx_bets_created_at on public.bets(created_at);
create index if not exists idx_wallet_user_id on public.wallet_transactions(user_id);
create index if not exists idx_logs_user_id on public.api_logs(user_id);


-- Function to handle new user creation (Triggers)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Snippet to make a user admin (Run manually as needed)
-- update public.profiles set role = 'admin' where id = 'USER_UUID_HERE';
