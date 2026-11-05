import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  FREE_QUEUE_WEEKS,
  PREMIUM_CAPACITY,
  WEEK_CAPACITY,
  type LaunchStatus,
  type Product,
} from "./data";
import { supabaseConfigured } from "./supabase/env";
import { supabaseAdmin, supabasePublic } from "./supabase/server";
import { currentWeek, weekKey, weeksAround, type Week } from "./weeks";

export type ProductRowDb = {
  id: string;
  slug: string;
  maker_id: string | null;
  maker_name: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  tags: string[];
  logo_glyph: string;
  logo_from: string;
  logo_to: string;
  logo_fg: string | null;
  logo_url: string | null;
  screenshots: string[];
  plan: "free" | "premium";
  boosted: boolean;
  status: LaunchStatus;
  launch_year: number;
  launch_week: number;
  verified: boolean;
  upvotes_count: number;
  comments_count: number;
  rating_score: number | null;
  rating_count: number;
  created_at: string;
  maker?: {
    name: string;
    handle: string;
    avatar_url: string | null;
    verified: boolean;
  } | null;
};

const select =
  "*, maker:profiles!products_maker_id_fkey(name, handle, avatar_url, verified)";

export function toProduct(r: ProductRowDb): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    website: r.website,
    tags: r.tags,
    upvotes: r.upvotes_count,
    comments: r.comments_count,
    rating:
      r.rating_score != null
        ? { score: Number(r.rating_score), count: r.rating_count }
        : undefined,
    // A verified maker's tick shows on all of their launches
    verified: r.verified || !!r.maker?.verified,
    premium: r.plan === "premium",
    boosted: r.boosted,
    logo: {
      glyph: r.logo_glyph,
      from: r.logo_from,
      to: r.logo_to,
      fg: r.logo_fg ?? undefined,
      url: r.logo_url ?? undefined,
    },
    screenshots: r.screenshots,
    week: r.launch_week,
    year: r.launch_year,
    maker: r.maker
      ? {
          name: r.maker.name || r.maker.handle,
          handle: r.maker.handle,
          avatar: r.maker.avatar_url ?? undefined,
          verified: r.maker.verified,
        }
      : { name: r.maker_name || "A maker" },
  };
}

// Premium launches are pinned first, then the most upvoted
const byRank = (a: Product, b: Product) =>
  Number(b.premium) - Number(a.premium) || b.upvotes - a.upvotes;

// ─── Public, cached reads ───────────────────────────────────

// The week tabs on the home page, worked out fresh every hour
export async function getBoardWeeks(): Promise<Week[]> {
  "use cache";
  cacheLife("hours");
  return weeksAround(new Date(), 4, 3);
}

// The current week; cached like the tabs so pages stay fast
export async function getCurrentWeek() {
  "use cache";
  cacheLife("hours");
  return currentWeek(new Date());
}

export async function getBoard(weeks: Week[]) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const board: Record<string, Product[]> = {};
  for (const w of weeks) board[weekKey(w)] = [];
  if (!supabaseConfigured) return board;

  const years = [...new Set(weeks.map((w) => w.year))];
  const { data } = await supabasePublic()
    .from("products")
    .select(select)
    .eq("status", "approved")
    .in("launch_year", years)
    .in(
      "launch_week",
      weeks.map((w) => w.number),
    )
    .limit(1000);

  for (const r of (data ?? []) as ProductRowDb[]) {
    const key = `${r.launch_year}-${r.launch_week}`;
    board[key]?.push(toProduct(r));
  }
  for (const key in board) board[key].sort(byRank);
  return board;
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  if (!supabaseConfigured) return [];
  const { data } = await supabasePublic()
    .from("products")
    .select(select)
    .eq("status", "approved")
    .order("upvotes_count", { ascending: false })
    .limit(1000);
  return ((data ?? []) as ProductRowDb[]).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product:${slug}`);
  if (!supabaseConfigured) return null;
  const { data } = await supabasePublic()
    .from("products")
    .select(select)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle<ProductRowDb>();
  return data ? toProduct(data) : null;
}

// Last week's top 3, for the right column
export async function getLastWeekBest() {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const recent = weeksAround(new Date(), 1, 0);
  // In Week 1 there's no last week yet
  if (recent.length < 2) return { week: recent[0], products: [] };
  const last = recent[0];
  const board = await getBoard([last]);
  return { week: last, products: board[weekKey(last)].slice(0, 3) };
}

export type CommentItem = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author: {
    name: string;
    handle: string;
    avatar_url: string | null;
    verified?: boolean;
  };
};

export async function getComments(productId: string): Promise<CommentItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`comments:${productId}`);
  if (!supabaseConfigured) return [];
  const { data } = await supabasePublic()
    .from("comments")
    .select(
      "id, body, created_at, user_id, author:profiles(name, handle, avatar_url, verified)",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as unknown as CommentItem[];
}

// ─── Server-only reads (not cached) ─────────────────────────

export type WeekLoad = { premium: number; total: number };

// Launches booked per week, free and Premium. Rejected ones don't count, and an
// unpaid checkout only holds its spot for an hour.
export async function weekLoad(weeks: Week[]) {
  const load: Record<string, WeekLoad> = {};
  for (const w of weeks) load[weekKey(w)] = { premium: 0, total: 0 };
  if (!supabaseConfigured || weeks.length === 0) return load;

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { data } = await supabaseAdmin()
    .from("products")
    .select("launch_year, launch_week, plan, status, created_at")
    .in("launch_year", [...new Set(weeks.map((w) => w.year))])
    .in(
      "launch_week",
      weeks.map((w) => w.number),
    )
    .neq("status", "rejected");

  for (const r of data ?? []) {
    if (r.status === "pending_payment" && r.created_at < hourAgo) continue;
    const l = load[`${r.launch_year}-${r.launch_week}`];
    if (!l) continue;
    l.total++;
    if (r.plan === "premium") l.premium++;
  }
  return load;
}

// Premium spots still open in a week: limited by both caps
export const premiumLeft = (l: WeekLoad) =>
  Math.max(0, Math.min(PREMIUM_CAPACITY - l.premium, WEEK_CAPACITY - l.total));

// Free launches queue 3 weeks out, or the first later week with room
export async function nextFreeWeek(): Promise<Week | null> {
  const weeks = weeksAround(new Date(), 0, FREE_QUEUE_WEEKS + 12).slice(
    FREE_QUEUE_WEEKS,
  );
  const load = await weekLoad(weeks);
  return weeks.find((w) => load[weekKey(w)].total < WEEK_CAPACITY) ?? null;
}

// Every launch of one maker, any status
export async function getMakerLaunches(userId: string) {
  const { data } = await supabaseAdmin()
    .from("products")
    .select(select)
    .eq("maker_id", userId)
    .order("created_at", { ascending: false });
  return ((data ?? []) as ProductRowDb[]).map((r) => ({
    product: toProduct(r),
    status: r.status,
  }));
}
