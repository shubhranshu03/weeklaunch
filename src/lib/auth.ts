import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseConfigured } from "./supabase/env";
import { supabaseServer } from "./supabase/server";

export type Profile = {
  id: string;
  handle: string;
  name: string;
  avatar_url: string | null;
  bio: string;
  location: string;
  website: string;
  x_handle: string;
  notify: { launch: boolean; comments: boolean; newsletter: boolean };
  verified: boolean;
  created_at: string;
};

export type CurrentUser = { id: string; email: string; profile: Profile };

// The signed-in visitor, or null. The session's signature is checked on our own
// server, so it can't be faked. Runs once per request, however many parts ask.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Always render per visitor: the session check below reads the clock,
  // which Next.js doesn't allow while building a page ahead of time
  await cookies();
  await connection();
  if (!supabaseConfigured) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  // A deleted account has no profile, so its leftover session stops working here
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .single<Profile>();
  if (!profile) return null;

  return { id: claims.sub, email: claims.email ?? "", profile };
});

// For pages and actions that need an account
export async function requireUser(next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}

// Admins are listed by email in ADMIN_EMAILS, separated by commas
export function isAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
