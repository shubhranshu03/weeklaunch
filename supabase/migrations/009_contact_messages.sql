-- Messages sent from the contact page, read by admins in /admin.
-- Only the server (secret key) reads and writes them. Run once in Supabase → SQL Editor.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  topic text not null check (char_length(topic) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  user_id uuid references auth.users (id) on delete set null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
-- No policies on purpose: visitors can't read or write this table directly

create index if not exists contact_messages_inbox_idx
  on public.contact_messages (handled, created_at desc);
