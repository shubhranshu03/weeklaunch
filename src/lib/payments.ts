import "server-only";
import { revalidateTag } from "next/cache";
import type { Payment } from "dodopayments/resources/payments";
import { growthServices } from "./growth";
import { applyFullRefund } from "./refunds";
import { supabaseAdmin } from "./supabase/server";

// Records a Dodo payment against our order. Used by both the webhook and the
// page Dodo sends buyers back to, so whichever arrives first marks it paid.
// Returns the order's launch so callers can link to it.
export async function applyDodoPayment(p: Payment) {
  // A refunded payment still says "succeeded", so look at the refund first
  if (p.status === "succeeded" && p.refund_status === "full") {
    await applyFullRefund(p);
    return null;
  }
  if (p.metadata?.directory_order_id) return applyDirectoryPayment(p);
  if (p.metadata?.growth_services) return applyGrowthPayment(p);
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
    // Never "refunded": an old return link or repeated webhook can't undo a refund
    .in("status", ["pending", "failed"])
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
          // Paid launches go live without waiting for review
          ...(product.status === "pending_payment" && {
            status: order.premium ? "approved" : "pending_review",
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

  // A refund that landed while the perks were being granted still wins
  const { data: latest } = await admin
    .from("payments")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();
  if (latest?.status === "refunded") {
    await applyFullRefund(p);
    return null;
  }

  revalidateTag("products", "max");
  return order;
}

// A paid directory package goes to the admin queue as "paid"
async function applyDirectoryPayment(p: Payment) {
  const id = p.metadata.directory_order_id;
  const succeeded = p.status === "succeeded";
  if (!succeeded && p.status !== "failed" && p.status !== "cancelled")
    return null;
  await supabaseAdmin()
    .from("directory_orders")
    .update({
      ...(succeeded && { status: "paid" }),
      provider_payment_id: p.payment_id,
      amount_cents: p.total_amount,
      currency: p.currency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending_payment");
  return null;
}

// A paid promotion order (ads, blog post, directories, founder post) goes to
// the admin inbox. The webhook and the return page can both get here, so the
// payment id in the message keeps it to one.
async function applyGrowthPayment(p: Payment) {
  if (p.status !== "succeeded") return null;
  const admin = supabaseAdmin();
  const { data: seen } = await admin
    .from("contact_messages")
    .select("id")
    .like("message", `%${p.payment_id}%`)
    .limit(1);
  if (seen?.length) return null;

  const m = p.metadata;
  const picked = growthServices.filter((s) =>
    String(m.growth_services).split(",").includes(s.id),
  );
  const message = [
    `PAID promotion order for ${m.growth_product} (${m.growth_website})`,
    "",
    ...picked.map((s) => `- ${s.name}: $${s.price} ${s.unit}`),
    "",
    `Paid: ${(p.total_amount / 100).toFixed(2)} ${p.currency}`,
    `Dodo payment: ${p.payment_id}`,
    m.growth_notes ? `\nNotes: ${m.growth_notes}` : "",
  ].join("\n");
  await admin.from("contact_messages").insert({
    name: p.customer?.name || p.customer?.email || "Customer",
    email: p.customer?.email ?? "",
    topic: "Advertising",
    message: message.slice(0, 4000),
    user_id: m.growth_user || null,
  });
  return null;
}
