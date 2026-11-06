"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser } from "../auth";
import { WEEK_CAPACITY } from "../data";
import { weekLoad } from "../products";
import { platformOf, SHARES_NEEDED } from "../share";
import { supabaseAdmin } from "../supabase/server";
import { weekKey, weekNumber, weekStart } from "../weeks";

type Result =
  { ok: true; week: number; moved: boolean } | { ok: false; error: string };

// A maker shows they shared their launch on 3 platforms. The launch is then
// reviewed first, and a free launch moves up to the next week with room.
export async function claimShareBoost(
  productId: string,
  links: string[],
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const admin = supabaseAdmin();
  const { data: product } = await admin
    .from("products")
    .select("id, slug, plan, status, launch_week, shared_at")
    .eq("id", productId)
    .eq("maker_id", user.id)
    .maybeSingle();
  if (!product || !["pending_review", "approved"].includes(product.status))
    return { ok: false, error: "This launch can't be boosted." };

  const now = weekNumber(new Date());
  if (product.launch_week <= now)
    return { ok: false, error: "This launch is already live." };

  // One post per platform, each a real post link
  const clean = [...new Set(links.map((l) => l.trim()).filter(Boolean))].slice(
    0,
    6,
  );
  const platforms = new Set<string>();
  for (const link of clean) {
    const p = platformOf(link);
    if (!p)
      return {
        ok: false,
        error: `"${link.slice(0, 60)}" isn't a link to a post on a platform we know.`,
      };
    platforms.add(p.id);
  }
  if (platforms.size < SHARES_NEEDED)
    return {
      ok: false,
      error: `Add posts from ${SHARES_NEEDED} different platforms (you have ${platforms.size}).`,
    };

  // Free launches move to the earliest week from next week that still has room.
  // Premium makers chose their week, so they only get the faster review.
  let week = product.launch_week;
  if (product.plan === "free") {
    const candidates = [];
    for (let n = now + 1; n < product.launch_week; n++) {
      const start = weekStart(n);
      candidates.push({ number: n, year: start.getUTCFullYear(), label: "" });
    }
    const load = await weekLoad(candidates, product.id);
    const open = candidates.find((w) => load[weekKey(w)].total < WEEK_CAPACITY);
    if (open) week = open.number;
  }

  const { error } = await admin
    .from("products")
    .update({
      share_links: clean,
      shared_at: product.shared_at ?? new Date().toISOString(),
      launch_week: week,
      launch_year: weekStart(week).getUTCFullYear(),
    })
    .eq("id", product.id);
  if (error)
    return { ok: false, error: "Couldn't save your links. Please try again." };

  revalidateTag("products", "max");
  revalidateTag(`product:${product.slug}`, "max");
  return { ok: true, week, moved: week !== product.launch_week };
}
