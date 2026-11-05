-- Blue tick for makers who paid for a Premium launch.
-- Run once in Supabase → SQL Editor on projects set up before this change.
alter table public.profiles add column if not exists verified boolean not null default false;

-- Makers who already paid for Premium get the tick now
update public.profiles p
  set verified = true
  where exists (select 1 from public.payments pay
                where pay.user_id = p.id and pay.premium and pay.status = 'succeeded');
