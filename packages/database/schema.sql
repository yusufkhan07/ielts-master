-- IELTSMaster Database Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Questions table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  test_type text not null check (test_type in ('academic', 'general')),
  task_type text not null check (task_type in ('task1', 'task2')),
  prompt text not null,
  instructions text not null,
  word_count integer not null,
  time_limit integer not null, -- in minutes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.questions enable row level security;

-- Policy for questions (public read)
create policy "Anyone can view questions"
  on public.questions for select
  to authenticated
  using (true);

-- Submissions table
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  content text not null,
  word_count integer not null,
  time_taken integer not null, -- in seconds
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.submissions enable row level security;

-- Policies for submissions
create policy "Users can view own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

create policy "Users can create own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

-- Scores table
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null unique,
  task_achievement numeric(3,1) not null check (task_achievement >= 0 and task_achievement <= 9),
  coherence_cohesion numeric(3,1) not null check (coherence_cohesion >= 0 and coherence_cohesion <= 9),
  lexical_resource numeric(3,1) not null check (lexical_resource >= 0 and lexical_resource <= 9),
  grammatical_range numeric(3,1) not null check (grammatical_range >= 0 and grammatical_range <= 9),
  overall_band numeric(3,1) not null check (overall_band >= 0 and overall_band <= 9),
  feedback text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.scores enable row level security;

-- Policy for scores
create policy "Users can view scores for own submissions"
  on public.scores for select
  using (
    exists (
      select 1 from public.submissions
      where submissions.id = scores.submission_id
      and submissions.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_submissions_user_id on public.submissions(user_id);
create index idx_submissions_question_id on public.submissions(question_id);
create index idx_scores_submission_id on public.scores(submission_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();
