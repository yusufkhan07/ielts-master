-- Fix RLS policies for questions and scores tables
-- This allows the API to insert questions and scores

-- Allow authenticated users to insert questions
-- (The API runs with the authenticated user's context)
create policy "Authenticated users can create questions"
  on public.questions for insert
  to authenticated
  with check (true);

-- Allow authenticated users to insert scores
-- (The API creates scores after evaluating submissions)
create policy "Authenticated users can create scores"
  on public.scores for insert
  to authenticated
  with check (
    exists (
      select 1 from public.submissions
      where submissions.id = submission_id
      and submissions.user_id = auth.uid()
    )
  );
