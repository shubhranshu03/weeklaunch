import "server-only";
import DodoPayments from "dodopayments";
import { BOOST_PRICE, PREMIUM_PRICE } from "./data";
import { supabaseAdmin } from "./supabase/server";
import { SITE_URL } from "./site";

// Reads DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_WEBHOOK_KEY from the environment.
// DODO_PAYMENTS_ENVIRONMENT is "test_mode" while testing, "live_mode" for real payments.
export function dodo() {
  return new DodoPayments({
    environment:
      process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
        ? "live_mode"
        : "test_mode",
  });
}

export const paymentsConfigured = Boolean(
  process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PREMIUM_PRODUCT_ID,
);

// Starts a Dodo checkout for a launch and returns the page to send the maker to
export async function createCheckout({
  productId,
  productName,
  user,
  premium,
  boost,
}: {
  productId: string;
  productName: string;
  user: { id: string; email: string; name: string };
  premium: boolean;
  boost: boolean;
}) {
  const cart = [
    premium && process.env.DODO_PREMIUM_PRODUCT_ID,
    boost && process.env.DODO_BOOST_PRODUCT_ID,
  ]
    .filter((id): id is string => Boolean(id))
    .map((product_id) => ({ product_id, quantity: 1 }));
  if (cart.length === 0) throw new Error("Nothing to pay for");

  const admin = supabaseAdmin();
  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      product_id: productId,
      premium,
      boost,
      amount_cents:
        ((premium ? PREMIUM_PRICE : 0) + (boost ? BOOST_PRICE : 0)) * 100,
    })
    .select("id")
    .single();
  if (error || !payment) throw new Error("Could not start the payment");

  const session = await dodo().checkoutSessions.create({
    product_cart: cart,
    customer: { email: user.email, name: user.name || user.email },
    // Checks the payment with Dodo, marks the launch paid, then shows My launches
    return_url: `${SITE_URL}/api/payments/return`,
    metadata: {
      order_id: payment.id,
      product_id: productId,
      product_name: productName.slice(0, 40),
    },
  });

  await admin
    .from("payments")
    .update({ checkout_session_id: session.session_id })
    .eq("id", payment.id);

  if (!session.checkout_url) throw new Error("Checkout page missing");
  return session.checkout_url;
}

// Starts a Dodo checkout for a directory submission order
export async function createDirectoryCheckout({
  orderId,
  dodoProductId,
  user,
}: {
  orderId: string;
  dodoProductId: string;
  user: { email: string; name: string };
}) {
  const session = await dodo().checkoutSessions.create({
    product_cart: [{ product_id: dodoProductId, quantity: 1 }],
    customer: { email: user.email, name: user.name || user.email },
    return_url: `${SITE_URL}/api/payments/return`,
    metadata: { directory_order_id: orderId },
  });
  await supabaseAdmin()
    .from("directory_orders")
    .update({ checkout_session_id: session.session_id })
    .eq("id", orderId);
  if (!session.checkout_url) throw new Error("Checkout page missing");
  return session.checkout_url;
}
