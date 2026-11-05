"use server";

import { revalidateTag, updateTag } from "next/cache";
import { getCurrentUser } from "../auth";
import { supabaseServer } from "../supabase/server";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const signedOut = { ok: false, error: "signin" } as const;

export async function toggleUpvote(
  productId: string,
  on: boolean,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return signedOut;
  const supabase = await supabaseServer();

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
