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
  // Products this visitor has upvoted
  votes: Set<string>;
};

let state: State = { ready: !supabaseConfigured, user: null, votes: new Set() };
const listeners = new Set<() => void>();
let started = false;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  for (const l of listeners) l();
}

async function load(userId: string | undefined) {
  if (!userId) return set({ ready: true, user: null, votes: new Set() });
  const supabase = supabaseBrowser();
  const [{ data: profile }, { data: votes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, handle, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("upvotes").select("product_id").eq("user_id", userId),
  ]);
  set({
    ready: true,
    user: {
      id: userId,
      name: profile?.name || profile?.handle || "You",
      handle: profile?.handle ?? "",
      avatar: profile?.avatar_url ?? null,
    },
    votes: new Set((votes ?? []).map((v) => v.product_id as string)),
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

const serverState: State = { ready: false, user: null, votes: new Set() };

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

export function setSessionUser(patch: Partial<SessionUser>) {
  if (state.user) set({ user: { ...state.user, ...patch } });
}
