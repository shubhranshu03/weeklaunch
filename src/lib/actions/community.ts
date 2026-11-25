"use server";

import { revalidateTag, updateTag } from "next/cache";
import { getCurrentUser } from "../auth";
import { supabaseServer } from "../supabase/server";
import { dayNumber } from "../days";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const signedOut = { ok: false, error: "signin" } as const;

export async function toggleUpvote(
  productId: string,
  on: boolean,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();

  // Voting is open on any live launch. The day, week and month awards are
  // decided when those periods end.
  const { data: product } = await supabase
    .from("products")
    .select("launch_day, status")
    .eq("id", productId)
    .maybeSingle();
  if (
    !product ||
    product.status !== "approved" ||
    product.launch_day > dayNumber(new Date())
  )
    return { ok: false, error: "This launch isn't live yet." };

  const { error } = on
    ? await supabase
        .from("upvotes")
        .upsert(
          { product_id: productId, user_id: user.id },
          { ignoreDuplicates: true },
        )
    : await supabase
        .from("upvotes")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);
  if (error) return { ok: false, error: "Couldn't save your upvote." };

  // The board refreshes in the background; the button already shows the vote
  revalidateTag("products", "max");
  return { ok: true };
}

export async function addComment(
  productId: string,
  body: string,
): Promise<Result<{ id: string; created_at: string }>> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const text = body.trim().slice(0, 1000);
  if (!text) return { ok: false, error: "Write something first." };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("comments")
    .insert({ product_id: productId, user_id: user.id, body: text })
    .select("id, created_at")
    .single();
  if (error || !data)
    return { ok: false, error: "Couldn't post your comment." };

  updateTag(`comments:${productId}`);
  revalidateTag("products", "max");
  return { ok: true, ...data };
}

export async function deleteComment(
  productId: string,
  commentId: string,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Couldn't delete the comment." };

  updateTag(`comments:${productId}`);
  revalidateTag("products", "max");
  return { ok: true };
}

// Follow a launch for its updates (or stop)
export async function toggleFollow(
  productId: string,
  on: boolean,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();
  const { error } = on
    ? await supabase
        .from("follows")
        .upsert(
          { product_id: productId, user_id: user.id },
          { ignoreDuplicates: true },
        )
    : await supabase
        .from("follows")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);
  if (error) return { ok: false, error: "Couldn't save that." };
  revalidateTag("products", "max");
  return { ok: true };
}

// Save a launch to your private list (or remove it)
export async function toggleSave(
  productId: string,
  on: boolean,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();
  const { error } = on
    ? await supabase
        .from("saves")
        .upsert(
          { product_id: productId, user_id: user.id },
          { ignoreDuplicates: true },
        )
    : await supabase
        .from("saves")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);
  if (error) return { ok: false, error: "Couldn't save that." };
  return { ok: true };
}

// Rate a live launch 1–5 stars with an optional short review. One per person,
// changed by rating again; makers can't rate their own launch.
export async function rateProduct(
  productId: string,
  rating: number,
  body: string,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const stars = Math.round(rating);
  if (!(stars >= 1 && stars <= 5))
    return { ok: false, error: "Pick 1 to 5 stars." };
  const text = body.trim().slice(0, 1000);
  const supabase = await supabaseServer();
  const { data: product } = await supabase
    .from("products")
    .select("slug, status, maker_id")
    .eq("id", productId)
    .maybeSingle();
  if (!product || product.status !== "approved")
    return { ok: false, error: "This launch isn't live." };
  if (product.maker_id === user.id)
    return { ok: false, error: "You can't rate your own launch." };
  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating: stars,
      body: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,user_id" },
  );
  if (error) return { ok: false, error: "Couldn't save your rating." };
  updateTag(`reviews:${productId}`);
  revalidateTag("products", "max");
  revalidateTag(`product:${product.slug}`, "max");
  return { ok: true };
}

export async function deleteReview(productId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Couldn't remove your rating." };
  updateTag(`reviews:${productId}`);
  revalidateTag("products", "max");
  return { ok: true };
}
