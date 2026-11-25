import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  FREE_QUEUE_DAYS,
  PREMIUM_CAPACITY,
  DAY_CAPACITY,
  type LaunchStatus,
  type Product,
} from "./data";
import type { GetFrom, Platform, PriceModel } from "./platforms";
import { supabaseConfigured } from "./supabase/env";
import { supabaseAdmin, supabasePublic } from "./supabase/server";
import {
  currentDay,
  dayKey,
  dayNumber,
  daysAround,
  type Day,
} from "./days";

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
  highlights: string[] | null;
  share_links?: string[] | null;
  faqs: { q: string; a: string }[] | null;
  plan: "free" | "premium";
  boosted: boolean;
  status: LaunchStatus;
  launch_year: number;
  launch_day: number;
  verified: boolean;
  upvotes_count: number;
  comments_count: number;
  // Missing until migration 011 has run
  followers_count?: number | null;
  rating_score: number | null;
  rating_count: number;
  created_at: string;
  // Missing until migration 007 has run
  platform?: Platform | null;
  price_model?: PriceModel | null;
  get_from?: GetFrom[] | null;
  apple_silicon?: boolean | null;
  // Missing until migration 008 has run
  badge_verified_at?: string | null;
  // Missing until migration 010 has run
  is_sample?: boolean | null;
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
    followers: r.followers_count ?? 0,
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
    // Only shown while the launch is Premium
    highlights: r.plan === "premium" ? (r.highlights ?? []) : [],
    faqs: r.plan === "premium" ? (r.faqs ?? []) : [],
    day: r.launch_day,
    year: r.launch_year,
    maker: r.maker
      ? {
          name: r.maker.name || r.maker.handle,
          handle: r.maker.handle,
          avatar: r.maker.avatar_url ?? undefined,
          verified: r.maker.verified,
        }
      : { name: r.maker_name || "A maker" },
    app: {
      platform: r.platform ?? "web",
      priceModel: r.price_model ?? null,
      getFrom: r.get_from ?? [],
      appleSilicon: r.apple_silicon ?? null,
    },
    badgeVerified: !!r.badge_verified_at,
    sample: !!r.is_sample,
  };
}

// Premium launches are pinned first, then the most upvoted
const byRank = (a: Product, b: Product) =>
  Number(b.premium) - Number(a.premium) || b.upvotes - a.upvotes;

// ─── Public, cached reads ───────────────────────────────────


// The current week; cached like the tabs so pages stay fast
export async function getCurrentDay() {
  "use cache";
  cacheLife("hours");
  return currentDay(new Date());
}

export async function getBoard(weeks: Day[]) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const board: Record<string, Product[]> = {};
  for (const w of weeks) board[dayKey(w)] = [];
  if (!supabaseConfigured) return board;

  const years = [...new Set(weeks.map((w) => w.year))];
  const { data } = await supabasePublic()
    .from("products")
    .select(select)
    .eq("status", "approved")
    .in("launch_year", years)
    .in(
      "launch_day",
      weeks.map((w) => w.number),
    )
    .limit(1000);

  for (const r of (data ?? []) as ProductRowDb[]) {
    const key = `${r.launch_year}-${r.launch_day}`;
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
    // Launches stay hidden until their launch day
    .lte("launch_day", dayNumber(new Date()))
    .order("upvotes_count", { ascending: false })
    .limit(1000);
  return ((data ?? []) as ProductRowDb[]).map(toProduct);
}

export async function getMacApps(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  return (await getAllProducts()).filter((p) => p.app.platform === "mac");
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
    .lte("launch_day", dayNumber(new Date()))
    .maybeSingle<ProductRowDb>();
  return data ? toProduct(data) : null;
}

// A launch that isn't live yet (in review, or approved for a later week), so its
// shared link can show a "coming soon" page and share card. Only what makers
// would share anyway: name, tagline, logo, week and maker.
export async function getUpcomingLaunch(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product:${slug}`);
  if (!supabaseConfigured) return null;
  const { data } = await supabaseAdmin()
    .from("products")
    .select(select)
    .eq("slug", slug)
    .in("status", ["pending_review", "approved"])
    .maybeSingle<ProductRowDb>();
  if (!data) return null;
  const p = toProduct(data);
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    logo: p.logo,
    day: p.day,
    premium: p.premium,
    maker: p.maker,
    live: data.status === "approved" && p.day <= dayNumber(new Date()),
  };
}

export type PublicMaker = {
  id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  location: string;
  website: string;
  x_handle: string;
  verified: boolean;
  created_at: string;
};

// A maker's public profile and their live launches (nothing private like email)
export async function getMaker(handle: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `maker:${handle}`);
  if (!supabaseConfigured) return null;
  const db = supabasePublic();
  const { data: maker } = await db
    .from("profiles")
    .select(
      "id, handle, name, avatar_url, bio, location, website, x_handle, verified, created_at",
    )
    .eq("handle", handle.toLowerCase())
    .maybeSingle<PublicMaker>();
  if (!maker) return null;

  const { data } = await db
    .from("products")
    .select(select)
    .eq("maker_id", maker.id)
    .eq("status", "approved")
    .lte("launch_day", dayNumber(new Date()))
    .order("launch_day", { ascending: false });
  return {
    maker,
    launches: ((data ?? []) as ProductRowDb[]).map(toProduct),
  };
}

// Makers with at least one live launch, for the sitemap
export async function getMakerHandles(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const products = await getAllProducts();
  return [
    ...new Set(
      products.map((p) => p.maker.handle).filter((h): h is string => !!h),
    ),
  ];
}

// Yesterday's top 3, for the side column
export async function getLastWeekBest() {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  const recent = daysAround(new Date(), 1, 0);
  // On Day 1 there's no yesterday yet
  if (recent.length < 2) return { day: recent[0], products: [] };
  const last = recent[0];
  const board = await getBoard([last]);
  // Winners are decided by votes alone: being pinned doesn't make a winner
  const products = board[dayKey(last)]
    .filter((p) => p.upvotes > 0)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3);
  return { day: last, products };
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

export type ReviewItem = {
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: {
    name: string;
    handle: string;
    avatar_url: string | null;
    verified?: boolean;
  };
};

// Star reviews of one launch, newest first (missing until migration 011 runs)
export async function getReviews(productId: string): Promise<ReviewItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`reviews:${productId}`);
  if (!supabaseConfigured) return [];
  const { data } = await supabasePublic()
    .from("reviews")
    .select(
      "rating, body, created_at, updated_at, user_id, author:profiles(name, handle, avatar_url, verified)",
    )
    .eq("product_id", productId)
    .order("updated_at", { ascending: false })
    .limit(200);
  return (data ?? []) as unknown as ReviewItem[];
}

// ─── Server-only reads (not cached) ─────────────────────────

export type DayLoad = { premium: number; total: number; boosted: boolean };

// Launches booked per week, free and Premium, and whether its one Boost is
// taken. Rejected launches don't count, and an unpaid checkout only holds its
// spot for an hour. `exceptId` leaves out one launch (the one being paid for).
export async function dayLoad(weeks: Day[], exceptId?: string) {
  const load: Record<string, DayLoad> = {};
  for (const w of weeks)
    load[dayKey(w)] = { premium: 0, total: 0, boosted: false };
  if (!supabaseConfigured || weeks.length === 0) return load;

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const years = [...new Set(weeks.map((w) => w.year))];
  const numbers = weeks.map((w) => w.number);
  const admin = supabaseAdmin();
  const [{ data: products }, { data: boosts }] = await Promise.all([
    admin
      .from("products")
      .select("id, launch_year, launch_day, plan, boosted, status, created_at")
      .in("launch_year", years)
      .in("launch_day", numbers)
      .neq("status", "rejected")
      // Sample launches never take a real maker's spot
      .eq("is_sample", false),
    // A Boost checkout in progress holds the week's sponsor spot too
    admin
      .from("payments")
      .select("product_id, product:products!inner(launch_year, launch_day)")
      .eq("boost", true)
      .eq("status", "pending")
      .gte("created_at", hourAgo)
      .in("product.launch_year", years)
      .in("product.launch_day", numbers),
  ]);

  for (const r of products ?? []) {
    if (r.id === exceptId) continue;
    const l = load[`${r.launch_year}-${r.launch_day}`];
    if (!l) continue;
    if (r.boosted) l.boosted = true;
    if (r.status === "pending_payment" && r.created_at < hourAgo) continue;
    l.total++;
    if (r.plan === "premium") l.premium++;
  }
  for (const b of (boosts ?? []) as unknown as {
    product_id: string;
    product: { launch_year: number; launch_day: number };
  }[]) {
    if (b.product_id === exceptId) continue;
    const l = load[`${b.product.launch_year}-${b.product.launch_day}`];
    if (l) l.boosted = true;
  }
  return load;
}

// Premium spots still open in a day: limited by both caps
export const premiumLeft = (l: DayLoad) =>
  Math.max(0, Math.min(PREMIUM_CAPACITY - l.premium, DAY_CAPACITY - l.total));


// Free launches queue 3 weeks out, or the first later week with room
export async function nextFreeDay(): Promise<Day | null> {
  const weeks = daysAround(new Date(), 0, FREE_QUEUE_DAYS + 12).slice(
    FREE_QUEUE_DAYS,
  );
  const load = await dayLoad(weeks);
  return weeks.find((w) => load[dayKey(w)].total < DAY_CAPACITY) ?? null;
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
    shareLinks: r.share_links ?? [],
  }));
}
