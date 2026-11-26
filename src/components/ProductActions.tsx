"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Bell,
  BellRing,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Star,
} from "lucide-react";
import {
  deleteReview,
  rateProduct,
  toggleFollow,
  toggleSave,
} from "@/lib/actions/community";
import { setFollowed, setSaved, useAuth } from "@/lib/useAuth";

const btn =
  "btn-pop inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition";

// Follow, Save and Rate on a product page
export function ProductActions({
  productId,
  followers,
  rating,
  makerHandle,
  ratings,
}: {
  productId: string;
  followers: number;
  rating?: { score: number; count: number };
  // Makers can't rate their own launch
  makerHandle?: string;
  // Stars by user id, so a visitor sees their own rating
  ratings: Record<string, number>;
}) {
  const { ready, user, follows, saves } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();
  const [initialFollow, setInitialFollow] = useState<boolean | null>(null);
  if (ready && initialFollow === null) setInitialFollow(follows.has(productId));
  const following = follows.has(productId);
  const saved = saves.has(productId);
  const shownFollowers =
    followers - (initialFollow ? 1 : 0) + (following ? 1 : 0);
  const [rateOpen, setRateOpen] = useState(false);
  const myRating = user ? ratings[user.id] : undefined;

  const needUser = () => {
    if (user) return false;
    router.push(`/signin?next=${encodeURIComponent(pathname)}`);
    return true;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={following}
        onClick={() => {
          if (needUser()) return;
          const next = !following;
          setFollowed(productId, next);
          start(async () => {
            const res = await toggleFollow(productId, next);
            if (!res.ok) setFollowed(productId, !next);
          });
        }}
        className={`${btn} ${following ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
      >
        {following ? (
          <BellRing className="size-4" />
        ) : (
          <Bell className="size-4" />
        )}
        {following ? "Following" : "Follow"}
        <span className="tabular-nums opacity-70">
          {Math.max(0, shownFollowers)}
        </span>
      </button>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => {
          if (needUser()) return;
          const next = !saved;
          setSaved(productId, next);
          start(async () => {
            const res = await toggleSave(productId, next);
            if (!res.ok) setSaved(productId, !next);
          });
        }}
        className={`${btn} ${saved ? "bg-amber-300 text-slate-900" : "bg-white text-slate-900"}`}
      >
        {saved ? (
          <BookmarkCheck className="size-4" />
        ) : (
          <Bookmark className="size-4" />
        )}
        {saved ? "Saved" : "Save"}
      </button>
      {!(user && makerHandle && user.handle === makerHandle) && (
        <button
          type="button"
          aria-expanded={rateOpen}
          onClick={() => {
            if (needUser()) return;
            setRateOpen((o) => !o);
          }}
          className={`${btn} bg-white text-slate-900`}
        >
          <Star className="size-4 fill-amber-400 text-amber-400" />
          {myRating ? `Your rating: ${myRating}` : "Rate"}
          {rating && (
            <span className="tabular-nums opacity-70">
              {rating.score.toFixed(1)} · {rating.count}
            </span>
          )}
        </button>
      )}
      {rateOpen && (
        <RateForm
          productId={productId}
          initial={myRating ?? 0}
          onDone={() => {
            setRateOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function RateForm({
  productId,
  initial,
  onDone,
}: {
  productId: string;
  initial: number;
  onDone: () => void;
}) {
  const [stars, setStars] = useState(initial);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const shown = hover || stars;

  return (
    <form
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!stars) return setError("Pick 1 to 5 stars.");
        setError("");
        start(async () => {
          const res = await rateProduct(productId, stars, body);
          if (res.ok) onDone();
          else setError(res.error);
        });
      }}
    >
      <p className="text-sm font-semibold text-slate-900">Your rating</p>
      <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={stars === n}
            onMouseEnter={() => setHover(n)}
            onClick={() => setStars(n)}
            className="p-0.5"
          >
            <Star
              className={`size-7 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
            />
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="text-sm font-medium text-slate-700">
          A short review{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="What do you like? What could be better?"
          className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-pop mt-3 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save rating
      </button>
      {initial > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteReview(productId);
              if (res.ok) onDone();
              else setError(res.error);
            })
          }
          className="ml-3 text-sm font-semibold text-slate-500 hover:text-rose-600"
        >
          Remove my rating
        </button>
      )}
    </form>
  );
}
