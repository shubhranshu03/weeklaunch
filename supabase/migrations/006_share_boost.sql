-- Makers who share their launch on 3 platforms are reviewed first and, for free
-- launches, moved up to the next open week. Run once in Supabase → SQL Editor.
alter table public.products
  add column if not exists share_links text[] not null default '{}',
  add column if not exists shared_at timestamptz;

alter table public.products drop constraint if exists products_share_links_check;
alter table public.products add constraint products_share_links_check
  check (cardinality(share_links) <= 6);
