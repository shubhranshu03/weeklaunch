"use server";

import { headers } from "next/headers";
import { getCurrentUser, isAdmin } from "../auth";
import { contactTopics } from "../contact";
import { supabaseAdmin } from "../supabase/server";

type Result = { ok: true } | { ok: false; error: string };

// A few messages per visitor every 10 minutes (per server instance)
const recent = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const sent = (recent.get(key) ?? []).filter((t) => now - t < 600_000);
  if (sent.length >= 5) return true;
  recent.set(key, [...sent, now]);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
  // Hidden field people never see; bots fill it in
  company?: string;
}): Promise<Result> {
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();
  const message = String(input.message ?? "").trim();
  const topic = contactTopics.includes(input.topic)
    ? input.topic
    : contactTopics[0];

  // Pretend it worked, so bots don't learn to skip the trap
  if (input.company) return { ok: true };

  if (!name || name.length > 80) return { ok: false, error: "Add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
    return { ok: false, error: "Add an email we can reply to." };
  if (message.length < 10)
    return { ok: false, error: "Write a message of at least 10 characters." };
  if (message.length > 4000)
    return { ok: false, error: "Keep your message under 4,000 characters." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip))
    return {
      ok: false,
      error: "You've sent a few messages already. Please wait a few minutes.",
    };

  const user = await getCurrentUser();
  const { error } = await supabaseAdmin()
    .from("contact_messages")
    .insert({ name, email, topic, message, user_id: user?.id ?? null });
  if (error)
    return {
      ok: false,
      error: "Your message didn't send. Please try again in a minute.",
    };
  return { ok: true };
}

// Admin: mark a message as dealt with (or not)
export async function setMessageHandled(
  id: string,
  handled: boolean,
): Promise<Result> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email))
    return { ok: false, error: "Admins only." };
  const { error } = await supabaseAdmin()
    .from("contact_messages")
    .update({ handled })
    .eq("id", id);
  return error ? { ok: false, error: "Couldn't update it." } : { ok: true };
}
