-- Optional discount a maker offers IndieShip visitors: percent off, coupon code
-- and a short line about the offer. Shown on launch cards and the product page.
-- Run once in Supabase → SQL Editor.
alter table public.products
  add column if not exists deal_percent smallint,
  add column if not exists deal_code text,
  add column if not exists deal_text text;

alter table public.products drop constraint if exists products_deal_percent_check;
alter table public.products add constraint products_deal_percent_check
  check (deal_percent is null or deal_percent between 1 and 100);

alter table public.products drop constraint if exists products_deal_code_check;
alter table public.products add constraint products_deal_code_check
  check (deal_code is null or (char_length(deal_code) <= 30 and deal_code ~ '^[A-Z0-9_-]+$'));

alter table public.products drop constraint if exists products_deal_text_check;
alter table public.products add constraint products_deal_text_check
  check (deal_text is null or char_length(deal_text) <= 80);
