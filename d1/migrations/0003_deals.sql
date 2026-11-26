-- Optional discount a maker offers IndieShip visitors: percent off, coupon code
-- and a short line about the offer (same as Supabase migration 012).
-- Run with: npx wrangler d1 execute weeklaunch --remote --file=d1/migrations/0003_deals.sql
alter table products add column deal_percent integer
  check (deal_percent is null or deal_percent between 1 and 100);
alter table products add column deal_code text
  check (deal_code is null or (length(deal_code) <= 30 and deal_code not glob '*[^A-Z0-9_-]*'));
alter table products add column deal_text text
  check (deal_text is null or length(deal_text) <= 80);
