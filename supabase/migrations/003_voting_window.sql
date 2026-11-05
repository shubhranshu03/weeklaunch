-- Upvotes only count during a launch's own week (Week 1 = Nov 2 – 8, 2026).
-- Run once in Supabase → SQL Editor.
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
