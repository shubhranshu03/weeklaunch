-- Sample launches (made-up demo products, shown with a "Sample" tag) and the
-- advertisers on the two TV ad spots. Run once in Supabase → SQL Editor.
--
-- Remove every sample later with:
--   delete from public.products where is_sample;
--   delete from public.sidebar_ads where is_sample;

alter table public.products
  add column if not exists is_sample boolean not null default false;

-- One advertiser per TV spot (1 or 2). An empty spot shows "Advertise here".
create table if not exists public.sidebar_ads (
  spot smallint primary key check (spot in (1, 2)),
  brand text not null check (char_length(brand) between 1 and 40),
  tagline text not null check (char_length(tagline) between 1 and 80),
  details text not null default '' check (char_length(details) <= 200),
  link text not null check (link ~ '^https?://'),
  logo_url text,
  -- Accent color for the screen, like #3b82f6
  color text not null default '#f2c14e' check (color ~ '^#[0-9a-fA-F]{6}$'),
  active boolean not null default true,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.sidebar_ads enable row level security;
drop policy if exists "Anyone can see live ads" on public.sidebar_ads;
create policy "Anyone can see live ads" on public.sidebar_ads
  for select using (active);
