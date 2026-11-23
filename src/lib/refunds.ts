import "server-only";
import { revalidateTag } from "next/cache";
import type { Payment } from "dodopayments/resources/payments";
import { FREE_QUEUE_WEEKS, WEEK_CAPACITY } from "./data";
import { weekLoad } from "./products";
import { supabaseAdmin } from "./supabase/server";
import { weekKey, weekNumber, weeksAround } from "./weeks";

// Any database error is thrown, so the webhook fails and Dodo sends it again.
// Every step is safe to repeat.
function check<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new Error(`Refund not applied: ${res.error.message}`);
  return res.data;
}

// A fully refunded payment loses what it bought
export async function applyFullRefund(payment: Payment) {
  const admin = supabaseAdmin();
  const updated_at = new Date().toISOString();

  const directoryId = payment.metadata?.directory_order_id;
  if (directoryId) {
    const order = check(
      await admin
        .from("directory_orders")
        .select("provider_payment_id")
        .eq("id", directoryId)
        .maybeSingle(),
    );
    if (!order) return;
    // A duplicate charge being refunded doesn't cancel the order
    if (
      order.provider_payment_id &&
      order.provider_payment_id !== payment.payment_id
    )
      return;
    check(
      await admin
        .from("directory_orders")
        .update({
          status: "refunded",
          provider_payment_id: payment.payment_id,
          updated_at,
        })
        .eq("id", directoryId),
    );
    return;
  }

  const orderId = payment.metadata?.order_id;
  if (!orderId) return;
  const order = check(
    await admin
      .from("payments")
      .select("user_id, product_id, premium, boost, status, provider_payment_id")
      .eq("id", orderId)
      .maybeSingle(),
  );
  if (!order) return;
  if (
    order.status !== "pending" &&
    order.provider_payment_id &&
    order.provider_payment_id !== payment.payment_id
  )
    return;

  check(
    await admin
      .from("payments")
      .update({
        status: "refunded",
        provider_payment_id: payment.payment_id,
        updated_at,
      })
      .eq("id", orderId),
  );

  if (order.product_id) await removeFromLaunch(order.product_id, order);

  // The blue tick stays only while another Premium payment stands
  if (order.premium && order.user_id) {
    const others = check(
      await admin
        .from("payments")
        .select("id")
        .eq("user_id", order.user_id)
        .eq("premium", true)
        .eq("status", "succeeded"),
    );
    if (!others?.length)
      check(
        await admin
          .from("profiles")
          .update({ verified: false })
          .eq("id", order.user_id),
      );
  }

  // Refunded perks disappear at once, not after one more cached view
  revalidateTag("products", { expire: 0 });
}

async function removeFromLaunch(
  productId: string,
  refunded: { premium: boolean; boost: boolean },
) {
  const admin = supabaseAdmin();
  const product = check(
    await admin
      .from("products")
      .select(
        "slug, maker_id, plan, status, launch_year, launch_week, created_at, shared_at",
      )
      .eq("id", productId)
      .maybeSingle(),
  );
  // Never paid for, so there's nothing to take back
  if (!product || product.status === "pending_payment") return;

  const standing =
    check(
      await admin
        .from("payments")
        .select("premium, boost")
        .eq("product_id", productId)
        .eq("status", "succeeded"),
    ) ?? [];

  const change: Record<string, string | number | boolean> = {};
  if (refunded.boost && !standing.some((p) => p.boost)) change.boosted = false;

  if (
    refunded.premium &&
    product.plan === "premium" &&
    !standing.some((p) => p.premium)
  ) {
    change.plan = "free";
    change.verified = false;

    // It becomes the maker's free product. If they already have one, it comes
    // off the site, or pay-then-refund would be a way to get free launches.
    const free = check(
      await admin
        .from("products")
        .select("id")
        .eq("maker_id", product.maker_id)
        .eq("plan", "free")
        .in("status", ["pending_review", "approved"])
        .neq("id", productId),
    );
    if (free?.length) change.status = "rejected";
    else if (
      !product.shared_at &&
      product.launch_week > weekNumber(new Date())
    ) {
      // Picking the week was part of Premium: back to where the free queue puts it
      const due = weekNumber(new Date(product.created_at)) + FREE_QUEUE_WEEKS;
      if (product.launch_week < due) {
        const weeks = weeksAround(new Date(), 0, FREE_QUEUE_WEEKS + 12).filter(
          (w) => w.number >= due,
        );
        const load = await weekLoad(weeks, productId);
        const open = weeks.find((w) => load[weekKey(w)].total < WEEK_CAPACITY);
        if (open) {
          change.launch_week = open.number;
          change.launch_year = open.year;
        }
      }
    }
  }

  if (Object.keys(change).length)
    check(await admin.from("products").update(change).eq("id", productId));
  revalidateTag(`product:${product.slug}`, { expire: 0 });
}
