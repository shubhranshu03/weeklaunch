import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dodo } from "@/lib/dodo";
import { applyDodoPayment } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase/server";

// Dodo sends buyers here after checkout (?payment_id=…&status=…).
// We ask Dodo for the payment ourselves rather than trusting the address,
// mark the launch paid if it succeeded, then show My launches.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const paymentId = searchParams.get("payment_id");
  const back = new URL("/dashboard", origin);

  const user = await getCurrentUser();
  if (!paymentId || !user) return NextResponse.redirect(back);

  let status = "processing";
  try {
    const payment = await dodo().payments.retrieve(paymentId);
    const orderId = payment.metadata?.order_id;

    // Only the buyer's own order
    const { data: order } = orderId
      ? await supabaseAdmin()
          .from("payments")
          .select("product_id, user_id")
          .eq("id", orderId)
          .maybeSingle()
      : { data: null };

    if (order && order.user_id === user.id) {
      await applyDodoPayment(payment);
      status = payment.status ?? "processing";
      if (order.product_id) back.searchParams.set("paid", order.product_id);
    }
  } catch {
    // Dodo unreachable: the webhook will still mark it paid shortly
  }

  if (!back.searchParams.has("paid")) back.searchParams.set("paid", "1");
  back.searchParams.set("status", status);
  return NextResponse.redirect(back);
}
