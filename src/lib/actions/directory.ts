"use server";

import { getCurrentUser, isAdmin } from "../auth";
import { getDirectoryPackage } from "../directories";
import { createDirectoryCheckout } from "../dodo";
import { supabaseAdmin } from "../supabase/server";

export type DirectoryOrderInput = {
  package: string;
  productName: string;
  website: string;
  tagline: string;
  description: string;
  notes: string;
};

// Saves the order and returns the Dodo checkout page to pay on
export async function createDirectoryOrder(
  input: DirectoryOrderInput,
): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in first." };

  const pkg = getDirectoryPackage(input.package);
  const dodoProductId = pkg && process.env[pkg.env];
  if (!pkg) return { ok: false, error: "Pick a package." };
  if (!dodoProductId || !process.env.DODO_PAYMENTS_API_KEY)
    return { ok: false, error: "Payments for this package aren't set up yet." };

  const productName = input.productName.trim();
  const website = input.website.trim();
  const tagline = input.tagline.trim();
  const description = input.description.trim();
  if (!productName || productName.length > 60)
    return { ok: false, error: "Add your product name." };
  if (!/^https?:\/\/\S+\.\S+/.test(website) || website.length > 200)
    return {
      ok: false,
      error: "Add a full link, like https://yourproduct.com",
    };
  if (tagline.length < 10 || tagline.length > 120)
    return { ok: false, error: "Write a tagline of 10 to 120 characters." };
  if (description.length < 40 || description.length > 1000)
    return {
      ok: false,
      error: "Write a description of 40 to 1000 characters.",
    };

  const { data: order, error } = await supabaseAdmin()
    .from("directory_orders")
    .insert({
      user_id: user.id,
      package: pkg.id,
      product_name: productName,
      website,
      tagline,
      description,
      notes: input.notes.trim().slice(0, 500),
      contact_email: user.email,
      amount_cents: pkg.price * 100,
    })
    .select("id")
    .single();
  if (error || !order)
    return { ok: false, error: "Couldn't save your order. Please try again." };

  try {
    const checkoutUrl = await createDirectoryCheckout({
      orderId: order.id,
      dodoProductId,
      user: { email: user.email, name: user.profile.name },
    });
    return { ok: true, checkoutUrl };
  } catch {
    return {
      ok: false,
      error: "The payment page didn't open. Please try again.",
    };
  }
}

// Admins move paid orders along as they work on them
export async function setDirectoryOrderStatus(
  orderId: string,
  status: "in_progress" | "done",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email))
    return { ok: false, error: "Admins only." };
  const { error } = await supabaseAdmin()
    .from("directory_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .in(
      "status",
      status === "in_progress" ? ["paid"] : ["paid", "in_progress"],
    );
  return error
    ? { ok: false, error: "Couldn't update the order." }
    : { ok: true };
}
