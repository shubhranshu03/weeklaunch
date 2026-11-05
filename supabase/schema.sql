-- WeekLaunch database schema.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run again; it only creates what is missing.

-- ─────────────────────────────────────────────────────────────
-- Profiles: one per signed-in user, created automatically
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,20}$'),
  name text not null default '' check (char_length(name) <= 50),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 160),
  location text not null default '' check (char_length(location) <= 50),
  website text not null default '' check (char_length(website) <= 200),
  x_handle text not null default '' check (char_length(x_handle) <= 30),
  notify jsonb not null default '{"launch": true, "comments": true, "newsletter": false}',
  -- Blue tick: set when the maker pays for a Premium launch
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
-- For projects created before the blue tick existed
alter table public.profiles add column if not exists verified boolean not null default false;

-- Builds a unique handle from the Google name or email when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(
    coalesce(split_part(new.email, '@', 1), 'maker'), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(base) < 3 then base := base || 'maker'; end if;
  base := left(base, 16);
  candidate := base;
  while exists (select 1 from public.profiles where handle = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, handle, name, avatar_url)
  values (
    new.id,
    candidate,
    left(coalesce(new.raw_user_meta_data ->> 'full_name',
                  new.raw_user_meta_data ->> 'name', base), 50),
    coalesce(new.raw_user_meta_data ->> 'avatar_url',
             new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Products (launches)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  maker_id uuid references public.profiles (id) on delete cascade,
  -- Shown when there is no maker account (the sample products)
  maker_name text not null default '',
  name text not null check (char_length(name) between 1 and 40),
  tagline text not null check (char_length(tagline) between 10 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  website text not null,
  tags text[] not null default '{}',
  logo_glyph text not null default '',
  logo_from text not null default '#7c5cff',
  logo_to text not null default '#5a32db',
  logo_fg text,
  logo_url text,
  screenshots text[] not null default '{}',
  -- Premium only: up to 5 "Why choose us" points and 5 FAQs ({"q", "a"})
  highlights text[] not null default '{}' check (cardinality(highlights) <= 5),
  faqs jsonb not null default '[]'
    check (jsonb_typeof(faqs) = 'array' and jsonb_array_length(faqs) <= 5),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  boosted boolean not null default false,
  status text not null default 'pending_review'
    check (status in ('pending_payment', 'pending_review', 'approved', 'rejected')),
  launch_year int not null,
  -- Week 1 is the first week of WeekLaunch (Nov 2 – 8, 2026)
  launch_week int not null check (launch_week >= 1),
  verified boolean not null default false,
  upvotes_count int not null default 0,
  comments_count int not null default 0,
  rating_score numeric(2, 1),
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists products_week_idx
  on public.products (launch_year, launch_week) where status = 'approved';
create index if not exists products_maker_idx on public.products (maker_id);

-- ─────────────────────────────────────────────────────────────
-- Upvotes and comments
-- ─────────────────────────────────────────────────────────────
create table if not exists public.upvotes (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);
create index if not exists upvotes_user_idx on public.upvotes (user_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_product_idx
  on public.comments (product_id, created_at desc);

-- Keep the counts on products in step (counted up and down, so the
-- starting numbers on the sample products are kept)
create or replace function public.sync_product_counts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
begin
  if tg_table_name = 'upvotes' then
    update public.products
      set upvotes_count = greatest(0, upvotes_count + delta)
      where id = pid;
  else
    update public.products
      set comments_count = greatest(0, comments_count + delta)
      where id = pid;
  end if;
  return null;
end;
$$;

drop trigger if exists upvotes_count on public.upvotes;
create trigger upvotes_count after insert or delete on public.upvotes
  for each row execute function public.sync_product_counts();

drop trigger if exists comments_count on public.comments;
create trigger comments_count after insert or delete on public.comments
  for each row execute function public.sync_product_counts();

-- ─────────────────────────────────────────────────────────────
-- Payments (Dodo Payments checkouts)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  premium boolean not null default false,
  boost boolean not null default false,
  amount_cents int not null,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  checkout_session_id text unique,
  provider_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payments_product_idx on public.payments (product_id);

-- ─────────────────────────────────────────────────────────────
-- Row level security
-- Writes to products and payments happen on the server only (service role),
-- after the server has checked who is signed in.
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.upvotes enable row level security;
alter table public.comments enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles
  for select using (true);

drop policy if exists "Approved products are public" on public.products;
create policy "Approved products are public" on public.products
  for select using (status = 'approved' or maker_id = auth.uid());

drop policy if exists "Upvotes are public" on public.upvotes;
create policy "Upvotes are public" on public.upvotes
  for select using (true);
-- Upvotes only count during a launch's own week (Week 1 = Nov 2 – 8, 2026)
create or replace function public.current_launch_week()
returns int
language sql
stable
as $$
  select greatest(1, floor(extract(epoch from (now() - timestamptz '2026-11-02 00:00:00+00')) / 604800)::int + 1)
$$;

drop policy if exists "Users upvote as themselves" on public.upvotes;
create policy "Users upvote as themselves" on public.upvotes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.products p
                where p.id = product_id and p.status = 'approved'
                  and p.launch_week = public.current_launch_week())
  );

drop policy if exists "Users remove their own upvotes" on public.upvotes;
create policy "Users remove their own upvotes" on public.upvotes
  for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from public.products p
                where p.id = product_id
                  and p.launch_week = public.current_launch_week())
  );

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public" on public.comments
  for select using (true);
drop policy if exists "Users comment as themselves" on public.comments;
create policy "Users comment as themselves" on public.comments
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.products p
                where p.id = product_id and p.status = 'approved')
  );
drop policy if exists "Users delete their own comments" on public.comments;
create policy "Users delete their own comments" on public.comments
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Users see their own payments" on public.payments;
create policy "Users see their own payments" on public.payments
  for select to authenticated using (user_id = auth.uid());

-- Table access for the Data API (row level security still decides which rows)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles, public.products, public.upvotes, public.comments
  to anon, authenticated;
grant select on public.payments to authenticated;
grant insert, delete on public.upvotes, public.comments to authenticated;
grant all on all tables in schema public to service_role;

-- ─────────────────────────────────────────────────────────────
-- Storage: logos, screenshots and profile photos
-- Files go in a folder named after the user's id: <user id>/<file>
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "Media is public" on storage.objects;
create policy "Media is public" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "Users upload to their own folder" on storage.objects;
create policy "Users upload to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete their own files" on storage.objects;
create policy "Users delete their own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media'
         and (storage.foldername(name))[1] = auth.uid()::text);
-- Done-for-you directory submissions ($49 / $99 / $149).
-- Run once in Supabase → SQL Editor (project: weeklaunch).
create table if not exists public.directory_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  package text not null check (package in ('30', '50', '100')),
  product_name text not null check (char_length(product_name) between 1 and 60),
  website text not null check (char_length(website) <= 200),
  tagline text not null default '' check (char_length(tagline) <= 120),
  description text not null default '' check (char_length(description) <= 1000),
  contact_email text not null default '',
  notes text not null default '' check (char_length(notes) <= 500),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'in_progress', 'done', 'refunded')),
  amount_cents int not null,
  currency text not null default 'USD',
  checkout_session_id text unique,
  provider_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists directory_orders_user_idx on public.directory_orders (user_id);

-- Makers can see their own orders; all changes go through the server
alter table public.directory_orders enable row level security;
drop policy if exists "Users see their own directory orders" on public.directory_orders;
create policy "Users see their own directory orders" on public.directory_orders
  for select to authenticated using (user_id = auth.uid());
grant select on public.directory_orders to authenticated;
grant all on public.directory_orders to service_role;
