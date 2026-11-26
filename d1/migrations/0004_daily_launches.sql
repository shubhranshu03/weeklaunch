-- Daily launches on D1 (same as Supabase migration 011): products launch on a
-- day, not a week. Also follows, saves and star reviews.
-- Run with: npx wrangler d1 execute weeklaunch --remote --file=d1/migrations/0004_daily_launches.sql
--
-- launch_week stays for older code; triggers keep launch_day and launch_week
-- in step whichever one is written. Day 1 is Mon, Nov 2, 2026 (UTC).

-- ─── Launch day ───────────────────────────────────────────────
alter table products add column launch_day integer
  check (launch_day is null or launch_day >= 1);
update products set launch_day = (launch_week - 1) * 7 + 1 where launch_day is null;

-- A new launch with only a week gets that week's Monday; one with a day gets its week
create trigger products_day_from_week after insert on products
  when new.launch_day is null
begin
  update products set launch_day = (new.launch_week - 1) * 7 + 1 where id = new.id;
end;
create trigger products_week_from_day after insert on products
  when new.launch_day is not null
    and new.launch_week != (new.launch_day - 1) / 7 + 1
begin
  update products set launch_week = (new.launch_day - 1) / 7 + 1 where id = new.id;
end;
-- Changing the day moves the week with it
create trigger products_day_changed after update of launch_day on products
  when new.launch_day is not null
    and new.launch_week != (new.launch_day - 1) / 7 + 1
begin
  update products set launch_week = (new.launch_day - 1) / 7 + 1 where id = new.id;
end;
-- Changing only the week (older code) moves the day to that week's Monday
create trigger products_week_changed after update of launch_week on products
  when new.launch_week != old.launch_week
    and new.launch_day is old.launch_day
    and (new.launch_day is null or new.launch_week != (new.launch_day - 1) / 7 + 1)
begin
  update products set launch_day = (new.launch_week - 1) * 7 + 1 where id = new.id;
end;

create index products_day_idx on products (launch_day) where status = 'approved';
create index upvotes_time_idx on upvotes (created_at);

-- ─── Follows, saves and reviews ───────────────────────────────
alter table products add column followers_count integer not null default 0;

create table follows (
  product_id text not null references products (id) on delete cascade,
  user_id text not null references profiles (id) on delete cascade,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (product_id, user_id)
);
create index follows_user_idx on follows (user_id);

-- Private bookmarks: only their owner sees them (checked in the app)
create table saves (
  product_id text not null references products (id) on delete cascade,
  user_id text not null references profiles (id) on delete cascade,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (product_id, user_id)
);
create index saves_user_idx on saves (user_id, created_at desc);

create table reviews (
  product_id text not null references products (id) on delete cascade,
  user_id text not null references profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text not null default '' check (length(body) <= 1000),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (product_id, user_id)
);

-- Followers counted up and down
create trigger followers_count_up after insert on follows begin
  update products set followers_count = followers_count + 1 where id = new.product_id;
end;
create trigger followers_count_down after delete on follows begin
  update products set followers_count = max(0, followers_count - 1) where id = old.product_id;
end;

-- Star average and count recomputed from the reviews
create trigger reviews_rating_insert after insert on reviews begin
  update products set
    rating_count = (select count(*) from reviews where product_id = new.product_id),
    rating_score = (select round(avg(rating), 1) from reviews where product_id = new.product_id)
  where id = new.product_id;
end;
create trigger reviews_rating_update after update on reviews begin
  update products set
    rating_count = (select count(*) from reviews where product_id = new.product_id),
    rating_score = (select round(avg(rating), 1) from reviews where product_id = new.product_id)
  where id = new.product_id;
end;
create trigger reviews_rating_delete after delete on reviews begin
  update products set
    rating_count = (select count(*) from reviews where product_id = old.product_id),
    rating_score = (select round(avg(rating), 1) from reviews where product_id = old.product_id)
  where id = old.product_id;
end;
