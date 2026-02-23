-- Casino Betting & Settlement Tables
-- Migration: 20260211_casino_betting

-- =====================================================
-- 1. CASINO BETS TABLE
-- =====================================================
create table if not exists casino_bets (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Game & Round Info
  game_id text not null,          -- gmid from casino API (e.g., 'dt20')
  game_name text,                 -- Human-readable game name
  round_id text not null,         -- Round identifier from provider

  -- Bet Details
  selection text not null,        -- What user bet on (e.g., 'Dragon', 'Player', 'Red')
  odds numeric(10,4) not null check (odds > 0),
  stake numeric(18,2) not null check (stake > 0),

  -- Settlement
  status text not null default 'PENDING' check (status in ('PENDING', 'WIN', 'LOSS', 'VOID', 'CANCELLED')),
  win_amount numeric(18,2) default 0 check (win_amount >= 0),

  -- Timestamps
  created_at timestamptz not null default now(),
  settled_at timestamptz,

  -- Metadata
  metadata jsonb default '{}'::jsonb
);

-- Indexes for performance
create index idx_casino_bets_user on casino_bets (user_id, created_at desc);
create index idx_casino_bets_game_round on casino_bets (game_id, round_id);
create index idx_casino_bets_status on casino_bets (status) where status = 'PENDING';
create index idx_casino_bets_settlement on casino_bets (game_id, round_id, status) where status = 'PENDING';

-- =====================================================
-- 2. CASINO RESULTS TABLE (Anti-Duplicate)
-- =====================================================
create table if not exists casino_results (
  id bigserial primary key,

  -- Game & Round
  game_id text not null,
  round_id text not null,

  -- Result
  result text not null,           -- Winning selection

  -- Raw data from provider
  raw jsonb not null,

  -- Timestamp
  created_at timestamptz not null default now(),

  -- Prevent duplicate settlement
  unique(game_id, round_id)
);

-- Indexes
create index idx_casino_results_game on casino_results (game_id, created_at desc);
create index idx_casino_results_lookup on casino_results (game_id, round_id);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Casino Bets: Users can only see their own bets
alter table casino_bets enable row level security;

create policy "Users can view own casino bets"
  on casino_bets for select
  using (auth.uid() = user_id);

create policy "Users can insert own casino bets"
  on casino_bets for insert
  with check (auth.uid() = user_id);

-- Casino Results: Public read (for displaying results)
alter table casino_results enable row level security;

create policy "Anyone can view casino results"
  on casino_results for select
  using (true);

-- Service role can manage everything
create policy "Service role can manage casino bets"
  on casino_bets for all
  using (auth.jwt() ->> 'role' = 'service_role');

create policy "Service role can manage casino results"
  on casino_results for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Get user's pending casino bets
create or replace function get_pending_casino_bets(p_user_id uuid)
returns table (
  id bigint,
  game_id text,
  game_name text,
  round_id text,
  selection text,
  odds numeric,
  stake numeric,
  created_at timestamptz
)
language sql
security definer
as $$
  select
    id,
    game_id,
    game_name,
    round_id,
    selection,
    odds,
    stake,
    created_at
  from casino_bets
  where user_id = p_user_id
    and status = 'PENDING'
  order by created_at desc;
$$;

-- Get casino bet statistics
create or replace function get_casino_bet_stats(p_user_id uuid)
returns json
language sql
security definer
as $$
  select json_build_object(
    'total_bets', count(*),
    'total_wagered', coalesce(sum(stake), 0),
    'total_won', coalesce(sum(case when status = 'WIN' then win_amount else 0 end), 0),
    'total_lost', coalesce(sum(case when status = 'LOSS' then stake else 0 end), 0),
    'pending_bets', count(*) filter (where status = 'PENDING'),
    'win_rate',
      case
        when count(*) filter (where status in ('WIN', 'LOSS')) > 0
        then round(
          count(*) filter (where status = 'WIN')::numeric /
          count(*) filter (where status in ('WIN', 'LOSS'))::numeric * 100,
          2
        )
        else 0
      end
  )
  from casino_bets
  where user_id = p_user_id;
$$;

-- =====================================================
-- 5. COMMENTS
-- =====================================================

comment on table casino_bets is 'Stores all casino bets placed by users';
comment on table casino_results is 'Stores casino round results to prevent duplicate settlement';
comment on column casino_bets.game_id is 'Game identifier (gmid) from casino API';
comment on column casino_bets.round_id is 'Round identifier from casino provider';
comment on column casino_results.raw is 'Raw result data from casino API for audit';
