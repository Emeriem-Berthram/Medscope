-- ==============================================================================
-- MEDSCOPE ENTERPRISE POSTGRESQL SCHEMA (SUPABASE)
-- Target Scale: 2,000 to 5,000 active concurrent users
-- Modules: Profiles, Personalization, Spaced Repetition, 1v1 Challenge, 20-User Battle Room with Chat
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. USER PROFILES (Personalized per candidate)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  college text default 'NPMCN',             -- 'NPMCN' | 'WACP' | 'WACS' | 'Primaries'
  faculty text default 'Internal Medicine',  -- Selected medical faculty
  target_exam text default 'Part I',        -- Target examination level
  target_date date,                         -- Candidate exam date
  streak int default 1,                     -- Daily study streak
  last_study_date date default current_date,
  readiness_score int default 0,            -- Calculated 0-100% readiness score
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for high-throughput profile lookups
create index if not exists idx_profiles_college_faculty on public.profiles(college, faculty);

-- 3. EXAM RECALL QUESTION BANK
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  college text not null,                    -- 'NPMCN' | 'WACP' | 'WACS' | 'Primaries'
  faculty text not null,
  subject text not null,
  topic text not null,
  question_text text not null,
  options jsonb not null,                   -- Array of options: [{"id": "A", "text": "..."}]
  correct_answer text not null,             -- "A" | "B" | "C" | "D" | "E"
  explanation text not null,                -- Comprehensive clinical rationale
  difficulty text default 'medium',         -- 'easy' | 'medium' | 'hard'
  year_asked int,
  created_at timestamptz default now()
);

-- Composite indexes for instant filtering at scale (sub-10ms queries)
create index if not exists idx_questions_lookup on public.questions(college, faculty, subject);
create index if not exists idx_questions_topic on public.questions(topic);

-- 4. ATTEMPTS & PERSONALIZATION ENGINE (Identifies Weak Spots & Spaced Repetition)
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  chosen_option text not null,
  is_correct boolean not null,
  time_spent_seconds int default 0,
  mode text default 'practice',             -- 'practice' | 'mock' | 'challenge' | 'battle'
  created_at timestamptz default now()
);

-- Critical indexes for user analytics and weak spot aggregation
create index if not exists idx_attempts_user_created on public.attempts(user_id, created_at desc);
create index if not exists idx_attempts_user_correct on public.attempts(user_id, is_correct);
create index if not exists idx_attempts_user_question on public.attempts(user_id, question_id);

-- 5. CANDIDATE BOOKMARKS & SAVED QUESTIONS
create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  primary key (user_id, question_id)
);

-- 6. MULTIPLAYER ROOMS (Challenge 1v1 and Battle Room up to 20 users)
-- Drop demo tables if they exist to upgrade columns cleanly
drop table if exists public.room_players cascade;
drop table if exists public.rooms cascade;

create table public.rooms (
  code text primary key,
  kind text not null,                       -- 'challenge' (2 players) | 'battle' (up to 20 players)
  title text not null,
  topic text not null,
  college text default '',
  faculty text default '',
  question_count int default 20,
  seconds_per_question int default 40,
  host_id uuid references auth.users(id) on delete set null,
  host_name text not null,
  max_players int default 20,               -- 2 for challenge, 20 for battle
  visibility text default 'public',         -- 'public' | 'private'
  status text default 'waiting',            -- 'waiting' | 'live' | 'finished'
  current_question int default 0,
  question_ids jsonb default '[]'::jsonb,   -- Array of question UUIDs selected for this room
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_rooms_status_kind on public.rooms(status, kind);

-- 7. ROOM PLAYERS (Live leaderboard state)
create table public.room_players (
  room_code text not null references public.rooms(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  score numeric default 0,
  answered int default 0,
  correct int default 0,
  is_host boolean default false,
  joined_at timestamptz default now(),
  primary key (room_code, user_id)
);

create index if not exists idx_room_players_leaderboard on public.room_players(room_code, score desc);

-- 8. LIVE BATTLE ROOM CHAT (Real-time in-room messaging up to 20 users)
create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(code) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_room_messages_room on public.room_messages(room_code, created_at asc);

-- 9. CANDIDATE SUBSCRIPTIONS (Paystack integration)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,                       -- 'free' | 'monthly' | 'annual'
  status text default 'active',             -- 'active' | 'expired' | 'canceled'
  college text not null,
  faculty text not null,
  paystack_reference text unique,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ==============================================================================
-- AUTOMATED ONBOARDING TRIGGER (Executes on user sign up)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    name,
    email,
    avatar_url,
    college,
    faculty,
    target_exam,
    onboarding_completed
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'college', 'NPMCN'),
    coalesce(new.raw_user_meta_data->>'faculty', 'Internal Medicine'),
    coalesce(new.raw_user_meta_data->>'target_exam', 'Part I'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger firing on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_messages enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: Users can view all public doctor profiles, but edit only their own
create policy "Users can view profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Questions: Any authenticated user can read questions
create policy "Authenticated users can read questions" on public.questions for select using (true);

-- Attempts: Candidates can only see and insert their own attempts
create policy "Users can read own attempts" on public.attempts for select using (auth.uid() = user_id);
create policy "Users can record attempts" on public.attempts for insert with check (auth.uid() = user_id);

-- Bookmarks: Personal to each candidate
create policy "Users can read own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- Rooms: Public rooms visible to all, private rooms via code
create policy "Anyone can read rooms" on public.rooms for select using (true);
create policy "Authenticated can create rooms" on public.rooms for insert with check (auth.role() = 'authenticated');
create policy "Host can update room" on public.rooms for update using (auth.uid() = host_id or host_id is null);

-- Room Players: Anyone in room can view participants, players can join
create policy "Anyone can read room players" on public.room_players for select using (true);
create policy "Players can join room" on public.room_players for insert with check (auth.role() = 'authenticated' or true);
create policy "Players can update own score" on public.room_players for update using (true);

-- Room Messages: All players can read and send messages in their room
create policy "Read messages in room" on public.room_messages for select using (true);
create policy "Send message in room" on public.room_messages for insert with check (auth.role() = 'authenticated' or true);

-- Subscriptions: Private per candidate
create policy "Users can read own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS (Safe idempotent addition)
-- ==============================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'room_players'
  ) then
    alter publication supabase_realtime add table public.room_players;
  end if;
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'room_messages'
  ) then
    alter publication supabase_realtime add table public.room_messages;
  end if;
end $$;

