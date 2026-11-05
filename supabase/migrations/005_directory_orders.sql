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
