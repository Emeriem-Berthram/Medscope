-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates the tables for battle rooms and challenge rooms,
-- and enables Realtime so players see updates instantly.

create table if not exists public.rooms (
  code text primary key,
  kind text not null,                 -- 'challenge' | 'battle'
  title text not null,
  topic text not null,
  exam text default '',
  faculty text default '',
  question_count int default 40,
  seconds_per_question int default 40,
  host text not null,
  visibility text default 'public',   -- 'public' | 'private'
  status text default 'waiting',      -- 'waiting' | 'live' | 'finished'
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.room_players (
  room_code text references public.rooms(code) on delete cascade,
  player_name text not null,
  score numeric default 0,
  answered int default 0,
  correct int default 0,
  primary key (room_code, player_name)
);

-- Open access for the demo. Tighten with auth policies
-- once Supabase Auth replaces the demo login.
alter table public.rooms enable row level security;
create policy "public access" on public.rooms
  for all to public using (true) with check (true);

alter table public.room_players enable row level security;
create policy "public access" on public.room_players
  for all to public using (true) with check (true);

-- Enable Realtime broadcasts for both tables
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;
