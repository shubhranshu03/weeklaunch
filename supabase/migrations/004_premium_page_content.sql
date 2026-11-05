-- Premium launches can add "Why choose us" highlights and their own FAQ.
-- Run once in Supabase → SQL Editor (project: weeklaunch).
alter table public.products
  add column if not exists highlights text[] not null default '{}',
  add column if not exists faqs jsonb not null default '[]';

alter table public.products drop constraint if exists products_highlights_check;
alter table public.products add constraint products_highlights_check
  check (cardinality(highlights) <= 5);

alter table public.products drop constraint if exists products_faqs_check;
alter table public.products add constraint products_faqs_check
  check (jsonb_typeof(faqs) = 'array' and jsonb_array_length(faqs) <= 5);
