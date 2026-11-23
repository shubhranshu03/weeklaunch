-- Free launches add the WeekLaunch badge to their site; we check it and note when.
-- Until it's found, a free launch's website link is nofollow. Run once in
-- Supabase → SQL Editor.
alter table public.products
  add column if not exists badge_verified_at timestamptz;
