import "server-only";
import { revalidateTag } from "next/cache";
import type { Payment } from "dodopayments/resources/payments";
import { supabaseAdmin } from "./supabase/server";

// Records a Dodo payment against our order. Used by both the webhook and the
// page Dodo sends buyers back to, so whichever arrives first marks it paid.
// Returns the order's launch so callers can link to it.
export async function applyDodoPayment(p: Payment) {
  const orderId = p.metadata?.order_id;
  if (!orderId) return null;
  const admin = supabaseAdmin();
  const now = new Date().toISOString();

  if (p.status !== "succeeded") {
    if (p.status === "failed" || p.status === "cancelled")
      await admin
        .from("payments")
        .update({
          status: "failed",
          provider_payment_id: p.payment_id,
          updated_at: now,
        })
        .eq("id", orderId)
        .eq("status", "pending");
    return null;
  }

  // Only the first caller flips the order to paid, so it's applied once
  const { data: order } = await admin
    .from("payments")
    .update({
      status: "succeeded",
      provider_payment_id: p.payment_id,
      amount_cents: p.total_amount,
      currency: p.currency,
      updated_at: now,
    })
    .eq("id", orderId)
    .neq("status", "succeeded")
    .select("user_id, product_id, premium, boost")
    .maybeSingle();
  if (!order) return null;

  if (order.product_id) {
    const { data: product } = await admin
      .from("products")
      .select("status, slug")
      .eq("id", order.product_id)
      .maybeSingle();
    if (product) {
      await admin
        .from("products")
        .update({
          ...(order.premium && { plan: "premium", verified: true }),
          ...(order.boost && { boosted: true }),
          ...(product.status === "pending_payment" && {
            status: "pending_review",
          }),
        })
        .eq("id", order.product_id);
      revalidateTag(`product:${product.slug}`, "max");
    }
  }

  // Premium makers get the blue tick on their profile and every launch
  if (order.premium && order.user_id)
    await admin
      .from("profiles")
      .update({ verified: true })
      .eq("id", order.user_id);

  revalidateTag("products", "max");
  return order;
}
