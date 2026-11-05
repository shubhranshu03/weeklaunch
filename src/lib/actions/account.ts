"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser, isAdmin } from "../auth";
import { mediaPrefix } from "../supabase/env";
import { supabaseAdmin } from "../supabase/server";

export type ProfileInput = {
  name: string;
  handle: string;
  bio: string;
  website: string;
  x_handle: string;
  location: string;
  avatar_url: string | null;
  notify: { launch: boolean; comments: boolean; newsletter: boolean };
};

type Result = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const handle = input.handle.trim().toLowerCase().replace(/^@/, "");
  if (!/^[a-z0-9_]{3,20}$/.test(handle))
    return {
      ok: false,
      error: "Usernames are 3–20 letters, numbers or underscores.",
    };
  const website = input.website.trim();
  if (website && !/^https?:\/\/\S+\.\S+/.test(website))
    return {
      ok: false,
      error: "Add a full website link, like https://you.com",
    };

  const avatar =
    input.avatar_url === user.profile.avatar_url ||
    input.avatar_url?.startsWith(`${mediaPrefix}${user.id}/`)
      ? input.avatar_url
      : user.profile.avatar_url;

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({
      name: input.name.trim().slice(0, 50),
      handle,
      bio: input.bio.trim().slice(0, 160),
      website: website.slice(0, 200),
      x_handle: input.x_handle.trim().replace(/^@/, "").slice(0, 30),
      location: input.location.trim().slice(0, 50),
      avatar_url: avatar,
      notify: {
        launch: !!input.notify.launch,
        comments: !!input.notify.comments,
        newsletter: !!input.notify.newsletter,
      },
    })
    .eq("id", user.id);

  if (error)
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That username is taken. Try another one."
          : "Couldn't save your changes.",
    };

  // Maker names show on product pages and comments
  revalidateTag("products", "max");
  return { ok: true };
}

// Removes the account, profile, launches, upvotes and comments
export async function deleteAccount(): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: "Couldn't delete your account." };
  revalidateTag("products", "max");
  return { ok: true };
}

// Admins approve or reject launches waiting for review
export async function reviewLaunch(
  productId: string,
  decision: "approved" | "rejected",
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email))
    return { ok: false, error: "Admins only." };

  const { data, error } = await supabaseAdmin()
    .from("products")
    .update({ status: decision })
    .eq("id", productId)
    .eq("status", "pending_review")
    .select("slug")
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Already reviewed." };

  revalidateTag("products", "max");
  revalidateTag(`product:${data.slug}`, "max");
  return { ok: true };
}
