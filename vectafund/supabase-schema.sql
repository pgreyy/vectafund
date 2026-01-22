-- VectaFund Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  telegram_chat_id text,
  telegram_username text,
  email_notifications boolean default true,
  telegram_notifications boolean default false,
  notification_frequency text default 'realtime' check (notification_frequency in ('realtime', 'daily', 'weekly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VCs/Investors table
create table if not exists public.vcs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  twitter_handle text unique not null,
  description text,
  website text,
  avatar_url text,
  category text not null check (category in ('tier1', 'tier2', 'tier3', 'angel')),
  ethos_score integer,
  ethos_profile_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User follows (which VCs a user follows)
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  vc_id uuid references public.vcs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, vc_id)
);

-- Fundraises table
create table if not exists public.fundraises (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  project_description text,
  project_website text,
  project_twitter text,
  amount_raised bigint,
  currency text default 'USD',
  round_type text check (round_type in ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'strategic', 'unknown')),
  announced_date date not null,
  source_url text,
  source_name text,
  lead_investors text[] default '{}',
  other_investors text[] default '{}',
  total_ethos_score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications log
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  fundraise_id uuid references public.fundraises(id) on delete cascade,
  channel text not null check (channel in ('email', 'telegram')),
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_vcs_twitter_handle on public.vcs(twitter_handle);
create index if not exists idx_vcs_category on public.vcs(category);
create index if not exists idx_user_follows_user_id on public.user_follows(user_id);
create index if not exists idx_user_follows_vc_id on public.user_follows(vc_id);
create index if not exists idx_fundraises_announced_date on public.fundraises(announced_date desc);
create index if not exists idx_fundraises_total_ethos_score on public.fundraises(total_ethos_score desc);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.vcs enable row level security;
alter table public.user_follows enable row level security;
alter table public.fundraises enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- VCs policies (public read)
create policy "VCs are viewable by everyone" on public.vcs
  for select using (true);

-- User follows policies
create policy "Users can view own follows" on public.user_follows
  for select using (auth.uid() = user_id);

create policy "Users can insert own follows" on public.user_follows
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own follows" on public.user_follows
  for delete using (auth.uid() = user_id);

-- Fundraises policies (public read)
create policy "Fundraises are viewable by everyone" on public.fundraises
  for select using (true);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to enforce max 5 follows per user
create or replace function public.check_max_follows()
returns trigger as $$
begin
  if (select count(*) from public.user_follows where user_id = new.user_id) >= 5 then
    raise exception 'Maximum of 5 VC follows allowed per user';
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger for max follows
drop trigger if exists enforce_max_follows on public.user_follows;
create trigger enforce_max_follows
  before insert on public.user_follows
  for each row execute procedure public.check_max_follows();

-- Function to update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_vcs_updated_at on public.vcs;
create trigger update_vcs_updated_at
  before update on public.vcs
  for each row execute procedure public.update_updated_at();

-- ============================================
-- SEED DATA (Optional - Top Crypto VCs)
-- ============================================

insert into public.vcs (name, twitter_handle, description, category) values
  ('a16z Crypto', 'a16zcrypto', 'Andreessen Horowitz crypto fund', 'tier1'),
  ('Paradigm', 'paradigm', 'Crypto-focused investment firm', 'tier1'),
  ('Polychain Capital', 'polychain', 'Hedge fund investing in protocols', 'tier1'),
  ('Sequoia Capital', 'sequoia', 'Legendary VC with crypto investments', 'tier1'),
  ('Coinbase Ventures', 'cbventures', 'Investment arm of Coinbase', 'tier1'),
  ('Binance Labs', 'BinanceLabs', 'Venture capital arm of Binance', 'tier1'),
  ('Dragonfly', 'dragonfly_xyz', 'Global crypto VC firm', 'tier2'),
  ('Multicoin Capital', 'multicoincap', 'Thesis-driven crypto fund', 'tier2'),
  ('Pantera Capital', 'PanteraCapital', 'First institutional Bitcoin investor', 'tier2'),
  ('Framework Ventures', 'hiframework', 'DeFi-focused venture fund', 'tier2'),
  ('Electric Capital', 'ElectricCapital', 'Venture firm for programmable money', 'tier2'),
  ('Variant Fund', 'variantfund', 'Ownership economy thesis fund', 'tier2'),
  ('Hack VC', 'hack_vc', 'Crypto native venture capital', 'tier2'),
  ('Delphi Ventures', 'Delphi_Ventures', 'Research-driven crypto investments', 'tier3'),
  ('Alliance DAO', 'AllianceDAO', 'Web3 accelerator and fund', 'tier3'),
  ('Balaji Srinivasan', 'balajis', 'Angel investor, former CTO of Coinbase', 'angel'),
  ('Vitalik Buterin', 'VitalikButerin', 'Ethereum co-founder', 'angel'),
  ('Chris Dixon', 'cdixon', 'General Partner at a16z crypto', 'angel')
on conflict (twitter_handle) do nothing;

-- ============================================
-- SAMPLE FUNDRAISES (Optional)
-- ============================================

insert into public.fundraises (project_name, project_description, amount_raised, round_type, announced_date, lead_investors) values
  ('Monad', 'High-performance EVM-compatible L1', 225000000, 'series-a', '2024-04-09', '{"paradigm"}'),
  ('Berachain', 'Proof of Liquidity L1 blockchain', 100000000, 'series-b', '2024-04-12', '{"hiframework", "BinanceLabs"}'),
  ('EigenLayer', 'Ethereum restaking protocol', 100000000, 'series-b', '2024-02-22', '{"a16zcrypto"}'),
  ('Farcaster', 'Decentralized social network', 150000000, 'series-a', '2024-05-21', '{"paradigm"}'),
  ('Story Protocol', 'IP infrastructure for the internet', 80000000, 'series-b', '2024-08-21', '{"a16zcrypto"}')
on conflict do nothing;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables exist
select table_name from information_schema.tables where table_schema = 'public';

-- Check VCs were inserted
select count(*) as vc_count from public.vcs;

-- Check policies
select * from pg_policies where schemaname = 'public';
