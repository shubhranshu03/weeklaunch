-- Daily launches: products launch on a day, not a week. Also follows, saves and
-- star reviews. Run once in Supabase → SQL Editor.
--
-- Safe while the old weekly site is still live: launch_week stays, and a trigger
-- keeps launch_week and launch_day in step whichever one the code writes.

-- ─── Launch day ─────────────────────────────────────────────
-- Day 1 is Mon, Nov 2, 2026 (UTC), the first day of WeekLaunch
alter table public.products add column if not exists launch_day int;
update public.products set launch_day = (launch_week - 1) * 7 + 1 where launch_day is null;

create or replace function public.sync_launch_day()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.launch_day is distinct from old.launch_day then
    new.launch_week := (new.launch_day - 1) / 7 + 1;
  elsif tg_op = 'UPDATE' and new.launch_week is distinct from old.launch_week then
    new.launch_day := (new.launch_week - 1) * 7 + 1;
  elsif new.launch_day is null then
    new.launch_day := (new.launch_week - 1) * 7 + 1;
  else
    new.launch_week := (new.launch_day - 1) / 7 + 1;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_launch_day on public.products;
create trigger sync_launch_day before insert or update on public.products
  for each row execute function public.sync_launch_day();

alter table public.products alter column launch_day set not null;
alter table public.products drop constraint if exists products_launch_day_check;
alter table public.products add constraint products_launch_day_check check (launch_day >= 1);
create index if not exists products_day_idx
  on public.products (launch_day) where status = 'approved';

create or replace function public.current_launch_day()
returns int
language sql
stable
as $$
  select greatest(1, floor(extract(epoch from (now() - timestamptz '2026-11-02 00:00:00+00')) / 86400)::int + 1)
$$;

-- Voting stays open on any live launch; the day, week and month awards only
-- count votes cast inside that period
drop policy if exists "Users upvote as themselves" on public.upvotes;
create policy "Users upvote as themselves" on public.upvotes
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.products p
                where p.id = product_id and p.status = 'approved'
                  and p.launch_day <= public.current_launch_day())
  );

drop policy if exists "Users remove their own upvotes" on public.upvotes;
create policy "Users remove their own upvotes" on public.upvotes
  for delete to authenticated
  using (user_id = auth.uid());

create index if not exists upvotes_time_idx on public.upvotes (created_at);

-- ─── Follows, saves and reviews ─────────────────────────────
alter table public.products
  add column if not exists followers_count int not null default 0;

create table if not exists public.follows (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);
create index if not exists follows_user_idx on public.follows (user_id);

-- Private bookmarks: only their owner sees them
create table if not exists public.saves (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, user_id)
);
create index if not exists saves_user_idx on public.saves (user_id, created_at desc);

create table if not exists public.reviews (
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

-- Followers counted up and down
create or replace function public.sync_followers()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.products
    set followers_count = greatest(0, followers_count + case when tg_op = 'INSERT' then 1 else -1 end)
    where id = coalesce(new.product_id, old.product_id);
  return null;
end;
$$;
drop trigger if exists followers_count on public.follows;
create trigger followers_count after insert or delete on public.follows
  for each row execute function public.sync_followers();

-- Star average and count recomputed from the reviews
create or replace function public.sync_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
    set rating_count = r.n,
        rating_score = case when r.n = 0 then null else round(r.avg, 1) end
    from (select count(*)::int n, avg(rating)::numeric avg
          from public.reviews where product_id = pid) r
    where p.id = pid;
  return null;
end;
$$;
drop trigger if exists reviews_rating on public.reviews;
create trigger reviews_rating after insert or update or delete on public.reviews
  for each row execute function public.sync_rating();

alter table public.follows enable row level security;
alter table public.saves enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Follows are public" on public.follows;
create policy "Follows are public" on public.follows for select using (true);
drop policy if exists "Users follow as themselves" on public.follows;
create policy "Users follow as themselves" on public.follows
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users unfollow themselves" on public.follows;
create policy "Users unfollow themselves" on public.follows
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Users see their own saves" on public.saves;
create policy "Users see their own saves" on public.saves
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users save as themselves" on public.saves;
create policy "Users save as themselves" on public.saves
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Users remove their own saves" on public.saves;
create policy "Users remove their own saves" on public.saves
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select using (true);
drop policy if exists "Users review live launches as themselves" on public.reviews;
create policy "Users review live launches as themselves" on public.reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.products p
                where p.id = product_id and p.status = 'approved'
                  and p.maker_id is distinct from auth.uid())
  );
drop policy if exists "Users edit their own reviews" on public.reviews;
create policy "Users edit their own reviews" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Users delete their own reviews" on public.reviews;
create policy "Users delete their own reviews" on public.reviews
  for delete to authenticated using (user_id = auth.uid());

grant select on public.follows, public.reviews to anon, authenticated;
grant select, insert, delete on public.saves to authenticated;
grant insert, delete on public.follows to authenticated;
grant insert, update, delete on public.reviews to authenticated;
