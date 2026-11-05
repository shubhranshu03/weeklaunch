import { dodo } from "@/lib/dodo";
import { applyDodoPayment } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase/server";

// Dodo Payments calls this after a payment succeeds, fails or is refunded.
// Add it in Dodo: Developer → Webhooks → https://<your site>/api/webhooks/dodo
export async function POST(request: Request) {
  const body = await request.text();

  let event;
  try {
    // Checks the signature, so only Dodo can mark a launch as paid
    event = dodo().webhooks.unwrap(body, {
      headers: Object.fromEntries(request.headers),
    });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  const admin = supabaseAdmin();

  if (event.type === "payment.succeeded" || event.type === "payment.failed") {
    // The event says what happened; the payment's own status is the source of truth
    await applyDodoPayment({
      ...event.data,
      status: event.type === "payment.succeeded" ? "succeeded" : "failed",
    });
    return Response.json({ ok: true });
  }

  if (event.type === "refund.succeeded") {
    await admin
      .from("payments")
      .update({ status: "refunded", updated_at: new Date().toISOString() })
      .eq("provider_payment_id", event.data.payment_id);
    return Response.json({ ok: true });
  }

  return Response.json({ ignored: true });
}
