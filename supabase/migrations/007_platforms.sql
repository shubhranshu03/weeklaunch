-- What a launch runs on, plus details for Mac apps.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- It is safe to run again.
alter table public.products
  add column if not exists platform text not null default 'web',
  add column if not exists price_model text,
  add column if not exists get_from text[] not null default '{}',
  add column if not exists apple_silicon boolean;

alter table public.products drop constraint if exists products_platform_check;
alter table public.products add constraint products_platform_check
  check (platform in ('web', 'mac', 'ios', 'android', 'chrome', 'windows', 'other'));

alter table public.products drop constraint if exists products_price_model_check;
alter table public.products add constraint products_price_model_check
  check (price_model is null or price_model in ('free', 'paid', 'freemium'));

alter table public.products drop constraint if exists products_get_from_check;
alter table public.products add constraint products_get_from_check
  check (get_from <@ array['app_store', 'download', 'homebrew']::text[]);

-- The Mac apps page lists live Mac launches
create index if not exists products_platform_idx
  on public.products (platform) where status = 'approved';
