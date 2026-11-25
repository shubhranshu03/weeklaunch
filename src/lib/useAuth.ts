"use client";

import { useSyncExternalStore } from "react";
import { supabaseBrowser } from "./supabase/client";
import { supabaseConfigured } from "./supabase/env";

export type SessionUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
};

type State = {
  ready: boolean;
  user: SessionUser | null;
  // Products this visitor has upvoted, follows and saved
  votes: Set<string>;
  follows: Set<string>;
  saves: Set<string>;
};

const empty = () => ({
  votes: new Set<string>(),
  follows: new Set<string>(),
  saves: new Set<string>(),
});

let state: State = { ready: !supabaseConfigured, user: null, ...empty() };
const listeners = new Set<() => void>();
let started = false;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const l of listeners) l();
}

async function load(userId: string | undefined) {
  if (!userId) return set({ ready: true, user: null, ...empty() });
  const supabase = supabaseBrowser();
  const ids = (rows: { product_id: unknown }[] | null) =>
    new Set((rows ?? []).map((r) => r.product_id as string));
  const [
    { data: profile },
    { data: votes },
    { data: follows },
    { data: saves },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, handle, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("upvotes").select("product_id").eq("user_id", userId),
    supabase.from("follows").select("product_id").eq("user_id", userId),
    supabase.from("saves").select("product_id").eq("user_id", userId),
  ]);
  set({
    ready: true,
    user: {
      id: userId,
      name: profile?.name || profile?.handle || "You",
      handle: profile?.handle ?? "",
      avatar: profile?.avatar_url ?? null,
    },
    votes: ids(votes),
    follows: ids(follows),
    saves: ids(saves),
  });
}

function start() {
  if (started || !supabaseConfigured) return;
  started = true;
  const supabase = supabaseBrowser();
  supabase.auth.getUser().then(({ data }) => load(data.user?.id));
  supabase.auth.onAuthStateChange((event, session) => {
    if (
      event === "SIGNED_IN" ||
      event === "SIGNED_OUT" ||
      event === "USER_UPDATED"
    )
      load(session?.user.id);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverState: State = { ready: false, user: null, ...empty() };

// The signed-in visitor in Client Components (null while loading or signed out)
export function useAuth() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}

export function setVoted(productId: string, voted: boolean) {
  const votes = new Set(state.votes);
  if (voted) votes.add(productId);
  else votes.delete(productId);
  set({ votes });
}

export function setFollowed(productId: string, on: boolean) {
  const follows = new Set(state.follows);
  if (on) follows.add(productId);
  else follows.delete(productId);
  set({ follows });
}

export function setSaved(productId: string, on: boolean) {
  const saves = new Set(state.saves);
  if (on) saves.add(productId);
  else saves.delete(productId);
  set({ saves });
}

export function setSessionUser(patch: Partial<SessionUser>) {
  if (state.user) set({ user: { ...state.user, ...patch } });
}
