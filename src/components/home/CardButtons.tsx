"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, BellRing, Bookmark } from "lucide-react";
import { toggleFollow, toggleSave } from "@/lib/actions/community";
import { setFollowed, setSaved, useAuth } from "@/lib/useAuth";

function useNeedUser() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  return () => {
    if (user) return false;
    router.push(`/signin?next=${encodeURIComponent(pathname)}`);
    return true;
  };
}

// The bell on a launch card: follow for updates, with the follower count
export function FollowBell({
  productId,
  count,
}: {
  productId: string;
  count: number;
}) {
  const { ready, follows } = useAuth();
  const needUser = useNeedUser();
  const [, start] = useTransition();
  // The saved count already includes this visitor; adjust it as they click
  const [initial, setInitial] = useState<boolean | null>(null);
  if (ready && initial === null) setInitial(follows.has(productId));
  const on = follows.has(productId);
  const shown = Math.max(0, count - (initial ? 1 : 0) + (on ? 1 : 0));

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Stop following" : "Follow for updates"}
      title={on ? "Following" : "Follow for updates"}
      onClick={() => {
        if (needUser()) return;
        setFollowed(productId, !on);
        start(async () => {
          const res = await toggleFollow(productId, !on);
          if (!res.ok) setFollowed(productId, on);
        });
      }}
      className={`group flex shrink-0 flex-col items-center rounded-lg px-3 py-2 transition ${
        on
          ? "bg-sky-50 text-sky-600"
          : "bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-600"
      }`}
    >
      {on ? <BellRing className="size-4" /> : <Bell className="size-4" />}
      <span className="text-sm font-medium tabular-nums">{shown}</span>
    </button>
  );
}

// The bookmark chip on a launch card
export function SaveChip({ productId }: { productId: string }) {
  const { saves } = useAuth();
  const needUser = useNeedUser();
  const [, start] = useTransition();
  const on = saves.has(productId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from saved" : "Save for later"}
      title={on ? "Saved" : "Save for later"}
      onClick={() => {
        if (needUser()) return;
        setSaved(productId, !on);
        start(async () => {
          const res = await toggleSave(productId, !on);
          if (!res.ok) setSaved(productId, on);
        });
      }}
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
        on
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
      }`}
    >
      <Bookmark className={`size-3.5 ${on ? "fill-current" : ""}`} />
    </button>
  );
}
