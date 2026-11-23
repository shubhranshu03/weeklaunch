"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser } from "../auth";
import { findBadge } from "../badgeCheck";
import { supabaseAdmin } from "../supabase/server";

type Result = { ok: true } | { ok: false; error: string };

// A maker asks us to look for the WeekLaunch badge on their website
export async function verifyBadge(productId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const admin = supabaseAdmin();
  const { data: product } = await admin
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("maker_id", user.id)
    .maybeSingle();
  if (!product || product.status === "rejected")
    return { ok: false, error: "Launch not found." };
  if (product.badge_verified_at) return { ok: true };

  const check = await findBadge(product.website, product.slug);
  if (check === "unreachable")
    return {
      ok: false,
      error: `We couldn't open ${product.website}. Make sure the site is public and loads, then try again.`,
    };
  if (check === "missing")
    return {
      ok: false,
      error:
        "We opened your site but didn't find the badge yet. Check it's published (not just saved), that the link wasn't changed, and that it's in the page's HTML, not only added by JavaScript. Then try again.",
    };

  const { error } = await admin
    .from("products")
    .update({ badge_verified_at: new Date().toISOString() })
    .eq("id", product.id);
  if (error)
    return {
      ok: false,
      error: "We found the badge but couldn't save it. Please try again.",
    };

  revalidateTag("products", "max");
  revalidateTag(`product:${product.slug}`, "max");
  return { ok: true };
}
