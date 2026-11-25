import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Product } from "./data";
import {
  dayLabel,
  dayNumber,
  monthRange,
  periodRange,
  weekRange,
  type Period,
  type Range,
} from "./days";
import { getAllProducts } from "./products";

// ─── Awards ─────────────────────────────────────────────────
// #1–#3 of each finished day, week and month, among launches of that period,
// by votes (a launch needs at least one vote to place). Today's, this week's
// and this month's places aren't final, so they show as live ranks instead.

export type Award = {
  period: Period;
  rank: 1 | 2 | 3;
  from: number;
  label: string;
};

const periodName = { day: "Day", week: "Week", month: "Month" } as const;
export const awardTitle = (a: Award) =>
  `#${a.rank} Product of the ${periodName[a.period]}`;

// Most votes first; on a tie the earlier submission places higher
const byVotes = (a: Product, b: Product) => b.upvotes - a.upvotes;

function podium(products: Product[]) {
  return products
    .filter((p) => p.upvotes > 0)
    .sort(byVotes)
    .slice(0, 3);
}

function inRange(products: Product[], r: Range) {
  return products.filter((p) => p.day >= r.from && p.day <= r.to);
}

export function computeAwards(products: Product[], today: number) {
  const awards = new Map<string, Award[]>();
  const add = (p: Product, a: Award) =>
    awards.set(p.slug, [...(awards.get(p.slug) ?? []), a]);

  const seen = new Set<string>();
  for (const period of ["day", "week", "month"] as const) {
    for (const p of products) {
      const r = periodRange(period, p.day);
      const key = `${period}-${r.from}`;
      // Only finished periods, and each one once
      if (r.to >= today || seen.has(key)) continue;
      seen.add(key);
      podium(inRange(products, r)).forEach((w, i) =>
        add(w, {
          period,
          rank: (i + 1) as 1 | 2 | 3,
          from: r.from,
          label: r.label,
        }),
      );
    }
  }
  return awards;
}

// ─── Home feed ──────────────────────────────────────────────

// A paid launch is featured (pinned, marked "Featured") for its first 7 days
export const FEATURE_DAYS = 7;
export const isFeatured = (p: Product, today: number) =>
  !!p.premium && today - p.day < FEATURE_DAYS && p.day <= today;

export type FeedSection = { title: string; hint: string; products: Product[] };

export type HomeFeed = {
  today: number;
  todayLabel: string;
  // Live launches of today: featured first, then by votes
  launches: Product[];
  top: FeedSection[];
  recent: Product[];
  trending: Product[];
  featured: Product[];
  // Today's Boost: the sponsor card in the feed
  boosted: Product | null;
  // Final awards by product slug
  awards: Record<string, Award[]>;
  stats: { launches: number; makers: number; votes: number };
};

export async function getHomeFeed(): Promise<HomeFeed> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const all = await getAllProducts();
  const today = dayNumber(new Date());

  const day = (n: number) => all.filter((p) => p.day === n);
  const week = weekRange(today);
  const month = monthRange(today);
  const top = (list: Product[], n: number) =>
    [...list].sort(byVotes).slice(0, n);

  const launches = day(today).sort(
    (a, b) =>
      Number(isFeatured(b, today)) - Number(isFeatured(a, today)) ||
      byVotes(a, b),
  );

  const sections: FeedSection[] = [
    { title: "Today", hint: dayLabel(today), products: top(day(today), 4) },
    {
      title: "Yesterday",
      hint: dayLabel(today - 1),
      products: top(day(today - 1), 3),
    },
    {
      title: "This week",
      hint: week.label,
      products: top(inRange(all, week), 3),
    },
    {
      title: "This month",
      hint: month.label,
      products: top(inRange(all, month), 3),
    },
  ].filter((s) => s.products.length > 0);

  // Most votes among launches of the last 7 days
  const trending = top(
    all.filter((p) => today - p.day < 7),
    8,
  );
  const recent = [...all]
    .sort((a, b) => b.day - a.day || byVotes(a, b))
    .slice(0, 30);

  return {
    today,
    todayLabel: dayLabel(today),
    launches,
    top: sections,
    recent,
    trending,
    featured: all.filter((p) => isFeatured(p, today)),
    boosted: day(today).find((p) => p.boosted) ?? null,
    awards: Object.fromEntries(computeAwards(all, today)),
    // Real numbers only: sample launches (made-up demo data) are left out
    stats: (() => {
      const real = all.filter((p) => !p.sample);
      return {
        launches: real.length,
        makers: new Set(real.map((p) => p.maker.handle ?? p.maker.name)).size,
        votes: real.reduce((n, p) => n + p.upvotes, 0),
      };
    })(),
  };
}

// Final awards of one launch, for its page
export async function getAwardsFor(slug: string): Promise<Award[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const all = await getAllProducts();
  return computeAwards(all, dayNumber(new Date())).get(slug) ?? [];
}

// ─── Hall of Fame ───────────────────────────────────────────

export type FameEntry = { award: Award; product: Product };

// Every #1–#3 of every finished month, week and day, newest first
export async function getHallOfFame() {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const all = await getAllProducts();
  const awards = computeAwards(all, dayNumber(new Date()));
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const entries: FameEntry[] = [];
  for (const [slug, list] of awards)
    for (const award of list)
      entries.push({ award, product: bySlug.get(slug)! });
  const sorted = (period: Period) =>
    entries
      .filter((e) => e.award.period === period)
      .sort(
        (a, b) => b.award.from - a.award.from || a.award.rank - b.award.rank,
      );
  return { month: sorted("month"), week: sorted("week"), day: sorted("day") };
}
