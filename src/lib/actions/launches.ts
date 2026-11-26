"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "../auth";
import { PREMIUM_DAYS_AHEAD, DAY_CAPACITY, productCategories } from "../data";
import { createCheckout, paymentsConfigured } from "../dodo";
import { launchBlock } from "../limits";
import {
  cleanPlatform,
  platformColumns,
  type PlatformInfo,
} from "../platforms";
import { boostTakenFor, dayLoad, nextFreeDay, premiumLeft } from "../products";
import { cleanDeal, dealColumns, type Deal } from "../deals";
import { mediaPrefix } from "../supabase/env";
import { supabaseAdmin } from "../supabase/server";
import { dayLabel, dayKey, dayNumber, daysAround } from "../days";

export type LaunchInput = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  shots: string[];
  plan: "free" | "premium";
  day: { year: number; number: number };
  boost: boolean;
  // Premium only
  highlights: string[];
  faqs: { q: string; a: string }[];
  app: PlatformInfo;
  deal?: Deal;
};

// Trims the Premium extras and drops empty or oversized entries
function cleanExtras(input: LaunchInput) {
  const highlights = input.highlights
    .map((h) => h.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 5);
  const faqs = input.faqs
    .map((f) => ({ q: f.q.trim().slice(0, 120), a: f.a.trim().slice(0, 500) }))
    .filter((f) => f.q && f.a)
    .slice(0, 5);
  return { highlights, faqs };
}

// PostgREST says a column is unknown (code PGRST204) until its migration runs
const missingDealColumns = (e: { code?: string; message?: string }) =>
  e.code === "PGRST204" || /deal_(code|percent|text)/.test(e.message ?? "");
// Spread over a row to leave the deal columns out entirely
const dealColumnsOff = {
  deal_code: undefined,
  deal_percent: undefined,
  deal_text: undefined,
};

type Result =
  | { ok: true; slug: string; id: string; day: number; checkoutUrl?: string }
  | { ok: false; error: string };

const palette = [
  ["#6366f1", "#a855f7"],
  ["#0ea5e9", "#2563eb"],
  ["#10b981", "#059669"],
  ["#f43f5e", "#fb923c"],
  ["#f59e0b", "#eab308"],
  ["#8b5cf6", "#ec4899"],
  ["#06b6d4", "#3b82f6"],
];

// Addresses already used by pages under /products
const reservedSlugs = new Set(["mac"]);

function slugify(name: string) {
  const slug =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "product";
  return reservedSlugs.has(slug) ? `${slug}-app` : slug;
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  const { data } = await supabaseAdmin()
    .from("products")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// Only files this maker uploaded to our storage
const ownFile = (url: string | null, userId: string) =>
  !!url && url.startsWith(`${mediaPrefix}${userId}/`);

export async function createLaunch(input: LaunchInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to launch." };

  const name = input.name.trim();
  const website = input.website.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  const tags = input.categories.filter((c) =>
    productCategories.some((p) => p.name === c),
  );

  if (!name || name.length > 40)
    return { ok: false, error: "Add your product name." };
  if (!/^https?:\/\/\S+\.\S+/.test(website))
    return {
      ok: false,
      error: "Add a full link, like https://yourproduct.com",
    };
  if (tagline.length < 10 || tagline.length > 60)
    return { ok: false, error: "Write a tagline of 10 to 60 characters." };
  if (description.length < 40 || description.length > 1000)
    return {
      ok: false,
      error: "Write a description of 40 to 1000 characters.",
    };
  if (tags.length === 0 || tags.length > 3)
    return { ok: false, error: "Pick one to three categories." };
  const app = cleanPlatform(input.app);
  if (!app.ok) return app;
  const deal = cleanDeal(input.deal);
  if (!deal.ok) return deal;

  const premium = input.plan === "premium";
  const paid = premium || input.boost;
  if (paid && !paymentsConfigured)
    return {
      ok: false,
      error: "Payments aren't set up yet. Choose the free launch for now.",
    };

  const limits = { free: !premium, unpaid: paid };
  const blocked = await launchBlock(user.id, limits);
  if (blocked) return { ok: false, error: blocked };

  // Premium launches today or picks a day up to 30 ahead; free launches join
  // the queue. Every day holds a few launches, some of them Premium.
  const open = daysAround(new Date(), 0, PREMIUM_DAYS_AHEAD);
  const week = premium
    ? open.find(
        (d) => d.year === input.day.year && d.number === input.day.number,
      )
    : await nextFreeDay();
  if (!week)
    return {
      ok: false,
      error: premium
        ? "Pick today or one of the next 30 days."
        : "Every day in the queue is full right now. Please try again soon.",
    };
  const load = (await dayLoad([week]))[dayKey(week)];
  if (premium && premiumLeft(load) === 0)
    return {
      ok: false,
      error: `${dayLabel(week.number)} is full. Pick another day.`,
    };
  // One Boost (sponsor card) at a time; each runs for a week
  if (input.boost && (await boostTakenFor([week]))[week.number])
    return {
      ok: false,
      error: `The in-feed ad is booked for part of the week from ${dayLabel(week.number)}. Untick it or pick another day.`,
    };

  const [from, to] = palette[Math.floor(Math.random() * palette.length)];
  const slug = await uniqueSlug(name);
  const row = {
    slug,
    maker_id: user.id,
    name,
    tagline,
    description,
    website,
    tags,
    logo_glyph: name.slice(0, 2).replace(/\s/g, "").toUpperCase() || "W",
    logo_from: from,
    logo_to: to,
    logo_url: ownFile(input.logo, user.id) ? input.logo : null,
    screenshots: input.shots.filter((s) => ownFile(s, user.id)).slice(0, 5),
    ...(premium ? cleanExtras(input) : { highlights: [], faqs: [] }),
    // Web is the default, so web launches still save before migration 007 runs
    ...(app.value.platform !== "web" && platformColumns(app.value)),
    // Sent only with a deal, so launches still save before migration 012 runs
    ...(deal.value && dealColumns(deal.value)),
    // A premium launch holds its spot while the maker pays; it stays hidden until paid
    plan: premium ? "premium" : "free",
    status: paid ? "pending_payment" : "pending_review",
    launch_year: week.year,
    launch_day: week.number,
  };
  const insert = (r: typeof row) =>
    supabaseAdmin().from("products").insert(r).select("id").single();
  let { data: product, error } = await insert(row);
  // Before migration 012 the deal columns don't exist: save the launch without its deal
  if (error && deal.value && missingDealColumns(error))
    ({ data: product, error } = await insert({
      ...row,
      ...dealColumnsOff,
    }));
  if (error || !product)
    return { ok: false, error: "Couldn't save your launch. Please try again." };

  // Check again now it's saved, so requests sent at the same moment can't both
  // get through. If this check fails, the launch mustn't stay either.
  const clash = await launchBlock(user.id, limits, product.id).catch(
    () => "Couldn't check your launches. Please try again.",
  );
  if (clash) {
    await supabaseAdmin().from("products").delete().eq("id", product.id);
    return {
      ok: false,
      error:
        "Another submission from your account came in at the same moment. Check My launches, then try again.",
    };
  }

  revalidateTag("products", "max");
  if (!paid) return { ok: true, slug, id: product.id, day: week.number };

  try {
    const checkoutUrl = await createCheckout({
      productId: product.id,
      productName: name,
      user: { id: user.id, email: user.email, name: user.profile.name },
      premium,
      boost: input.boost,
    });
    return { ok: true, slug, id: product.id, day: week.number, checkoutUrl };
  } catch {
    return {
      ok: false,
      error:
        "Your launch is saved, but the payment page didn't open. Finish paying from My launches.",
    };
  }
}

// Pay for a saved launch, or upgrade a free one to Premium
export async function payForLaunch(
  productId: string,
  options: { premium: boolean; boost: boolean },
): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (!paymentsConfigured)
    return { ok: false, error: "Payments aren't set up yet." };

  const { data: product } = await supabaseAdmin()
    .from("products")
    .select(
      "id, name, plan, boosted, status, launch_year, launch_day, created_at",
    )
    .eq("id", productId)
    .eq("maker_id", user.id)
    .maybeSingle();
  if (!product || product.status === "rejected")
    return { ok: false, error: "Launch not found." };

  let premium = options.premium && product.plan !== "premium";
  let boost = options.boost && !product.boosted;
  if (product.status === "pending_payment") {
    // Finish the checkout that was started when the launch was submitted
    const { data: last } = await supabaseAdmin()
      .from("payments")
      .select("premium, boost")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    premium = last?.premium ?? product.plan === "premium";
    boost = last?.boost ?? false;
  }
  if (!premium && !boost) return { ok: false, error: "Already paid." };

  const week = {
    year: product.launch_year,
    number: product.launch_day,
    label: "",
  };
  if (week.number <= dayNumber(new Date()))
    return {
      ok: false,
      error: `${dayLabel(week.number)} has already started, so it can't be paid for now.`,
    };

  // Check the week again: an unpaid spot is only held for an hour, so it may
  // have been taken since. This launch itself is left out of the count.
  const load = (await dayLoad([week], product.id))[dayKey(week)];
  if (premium && premiumLeft(load) === 0)
    return {
      ok: false,
      error: `Premium spots for ${dayLabel(week.number)} are sold out.`,
    };
  if (boost && (await boostTakenFor([week], product.id))[week.number])
    return {
      ok: false,
      error: `The in-feed ad is already booked for part of the week from ${dayLabel(week.number)}.`,
    };

  // Hold the spot again while the maker pays
  if (product.status === "pending_payment") {
    const limits = { free: product.plan !== "premium", unpaid: true };
    const blocked = await launchBlock(user.id, limits, product.id);
    if (blocked) return { ok: false, error: blocked };

    const hold = (created_at: string) =>
      supabaseAdmin()
        .from("products")
        .update({ created_at })
        .eq("id", product.id);
    await hold(new Date().toISOString());
    const clash = await launchBlock(user.id, limits, product.id);
    if (clash) {
      await hold(product.created_at);
      return { ok: false, error: clash };
    }
  }

  try {
    const checkoutUrl = await createCheckout({
      productId: product.id,
      productName: product.name,
      user: { id: user.id, email: user.email, name: user.profile.name },
      premium,
      boost,
    });
    return { ok: true, checkoutUrl };
  } catch {
    return {
      ok: false,
      error: "The payment page didn't open. Please try again.",
    };
  }
}

// Someone who backed out of paying for a Boost can still use their free product
export async function submitWithoutBoost(
  productId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const admin = supabaseAdmin();
  const { data: product } = await admin
    .from("products")
    .select("id, launch_year, launch_day")
    .eq("id", productId)
    .eq("maker_id", user.id)
    .eq("plan", "free")
    .eq("status", "pending_payment")
    .maybeSingle();
  if (!product) return { ok: false, error: "Launch not found." };

  const blocked = await launchBlock(
    user.id,
    { free: true, unpaid: false },
    product.id,
  );
  if (blocked) return { ok: false, error: blocked };

  // Its week may have filled up or started since
  let week = {
    year: product.launch_year,
    number: product.launch_day,
    label: "",
  };
  const open =
    week.number > dayNumber(new Date()) &&
    (await dayLoad([week], product.id))[dayKey(week)].total < DAY_CAPACITY;
  if (!open) {
    const next = await nextFreeDay();
    if (!next)
      return { ok: false, error: "Every upcoming week is full right now." };
    week = next;
  }

  const { error } = await admin
    .from("products")
    .update({
      status: "pending_review",
      launch_year: week.year,
      launch_day: week.number,
    })
    .eq("id", product.id)
    .eq("status", "pending_payment");
  if (error)
    return { ok: false, error: "Couldn't submit it. Please try again." };

  revalidateTag("products", "max");
  revalidatePath("/dashboard");
  return { ok: true };
}

export type LaunchEdit = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  shots: string[];
  highlights: string[];
  faqs: { q: string; a: string }[];
  app: PlatformInfo;
  deal?: Deal;
};

// A maker updates their own launch. The address (slug), plan and week stay the
// same. A new website on an approved launch goes back to review, so a launch
// can't be approved and then pointed somewhere else.
export async function updateLaunch(
  productId: string,
  input: LaunchEdit,
): Promise<
  { ok: true; slug: string; inReview: boolean } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const admin = supabaseAdmin();
  const { data: current } = await admin
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("maker_id", user.id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Launch not found." };
  if (current.status === "rejected")
    return {
      ok: false,
      error: "This launch wasn't approved, so it can't be edited.",
    };

  const name = input.name.trim();
  const website = input.website.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  const tags = input.categories.filter((c) =>
    productCategories.some((p) => p.name === c),
  );
  if (!name || name.length > 40)
    return { ok: false, error: "Add your product name." };
  if (!/^https?:\/\/\S+\.\S+/.test(website))
    return {
      ok: false,
      error: "Add a full link, like https://yourproduct.com",
    };
  if (tagline.length < 10 || tagline.length > 60)
    return { ok: false, error: "Write a tagline of 10 to 60 characters." };
  if (description.length < 40 || description.length > 1000)
    return {
      ok: false,
      error: "Write a description of 40 to 1000 characters.",
    };
  if (tags.length === 0 || tags.length > 3)
    return { ok: false, error: "Pick one to three categories." };
  const app = cleanPlatform(input.app);
  if (!app.ok) return app;
  const deal = cleanDeal(input.deal);
  if (!deal.ok) return deal;

  // Keep the old logo, or take one this maker uploaded
  const logo =
    input.logo === current.logo_url || ownFile(input.logo, user.id)
      ? input.logo
      : current.logo_url;
  const websiteChanged = website !== current.website;
  const backToReview = current.status === "approved" && websiteChanged;

  const extras =
    current.plan === "premium"
      ? cleanExtras({
          ...input,
          plan: "premium",
          day: { year: 0, number: 0 },
          boost: false,
        })
      : {};

  const patch = {
    name,
    website,
    tagline,
    description,
    tags,
    logo_url: logo,
    logo_glyph: name.slice(0, 2).replace(/\s/g, "").toUpperCase() || "W",
    screenshots: input.shots.filter((s) => ownFile(s, user.id)).slice(0, 5),
    ...extras,
    // Once migration 007 has run the columns exist; before that only web is kept
    ...(("platform" in current || app.value.platform !== "web") &&
      platformColumns(app.value)),
    ...(("deal_code" in current || deal.value) && dealColumns(deal.value)),
    ...(backToReview && { status: "pending_review" }),
    // The badge was checked on the old site
    ...(websiteChanged &&
      "badge_verified_at" in current && { badge_verified_at: null }),
  };
  const save = (p: typeof patch) =>
    admin.from("products").update(p).eq("id", current.id);
  let { error } = await save(patch);
  // Before migration 012 the deal columns don't exist: save everything else
  if (error && missingDealColumns(error))
    ({ error } = await save({ ...patch, ...dealColumnsOff }));
  if (error)
    return {
      ok: false,
      error: "Couldn't save your changes. Please try again.",
    };

  revalidateTag("products", "max");
  revalidateTag(`product:${current.slug}`, "max");
  return {
    ok: true,
    slug: current.slug,
    inReview: backToReview || current.status === "pending_review",
  };
}
