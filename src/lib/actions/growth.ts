"use server";

import { getCurrentUser } from "../auth";
import { createGrowthCheckout, growthProductIds } from "../dodo";
import { growthServices } from "../growth";
import { supabaseAdmin } from "../supabase/server";

type Result = { ok: true; checkoutUrl?: string } | { ok: false; error: string };

// A few requests per account every 10 minutes (per server instance)
const recent = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const sent = (recent.get(key) ?? []).filter((t) => now - t < 600_000);
  if (sent.length >= 5) return true;
  recent.set(key, [...sent, now]);
  if (recent.size > 5000) recent.clear();
  return false;
}

// Sends the chosen promotion services to the admin inbox, where we reply with a payment link
export async function requestGrowthServices(input: {
  services: string[];
  productName: string;
  website: string;
  notes: string;
}): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const picked = growthServices.filter((s) =>
    (input.services ?? []).includes(s.id),
  );
  if (picked.length === 0)
    return { ok: false, error: "Pick at least one option." };

  const productName = String(input.productName ?? "").trim();
  const website = String(input.website ?? "").trim();
  const notes = String(input.notes ?? "").trim();
  if (!productName || productName.length > 60)
    return { ok: false, error: "Add your product name first." };
  if (!/^https?:\/\/\S+\.\S+/.test(website) || website.length > 200)
    return { ok: false, error: "Add your full website link first." };
  if (notes.length > 1000)
    return { ok: false, error: "Keep your notes under 1,000 characters." };
  if (limited(user.id))
    return {
      ok: false,
      error: "You've sent a few requests already. Please wait a few minutes.",
    };

  // Card checkout when every chosen service has a Dodo product; otherwise
  // the request goes to the inbox and we reply with a payment link
  const ids = growthProductIds();
  const payable =
    !!process.env.DODO_PAYMENTS_API_KEY && picked.every((s) => ids[s.id]);
  if (payable) {
    try {
      const checkoutUrl = await createGrowthCheckout({
        productIds: picked.map((s) => ids[s.id]!),
        services: picked.map((s) => s.id),
        productName,
        website,
        notes,
        user: {
          id: user.id,
          email: user.email,
          name: user.profile.name || user.email,
        },
      });
      return { ok: true, checkoutUrl };
    } catch (e) {
      console.error("Promotion checkout failed", e);
      return {
        ok: false,
        error: "Checkout didn't open. Please try again in a minute.",
      };
    }
  }

  const total = picked.reduce((n, s) => n + s.price, 0);
  const message = [
    `Promotion request for ${productName} (${website})`,
    "",
    ...picked.map((s) => `- ${s.name}: $${s.price} ${s.unit}`),
    "",
    `Total: $${total}`,
    notes ? `\nNotes: ${notes}` : "",
  ].join("\n");

  const { error } = await supabaseAdmin()
    .from("contact_messages")
    .insert({
      name: user.profile.name || user.email,
      email: user.email,
      topic: "Advertising",
      message,
      user_id: user.id,
    });
  if (error)
    return {
      ok: false,
      error: "Your request didn't send. Please try again in a minute.",
    };
  return { ok: true };
}
