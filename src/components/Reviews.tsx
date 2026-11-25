import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { ReviewItem } from "@/lib/products";

const stars = (n: number, size = "size-3.5") =>
  [1, 2, 3, 4, 5].map((i) => (
    <Star
      key={i}
      aria-hidden
      className={`${size} ${i <= n ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
    />
  ));

// Star reviews on a product page: the average, how the stars split, and each review
export function Reviews({
  reviews,
  rating,
}: {
  reviews: ReviewItem[];
  rating?: { score: number; count: number };
}) {
  const split = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  return (
    <section
      id="reviews"
      className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="font-semibold text-slate-900">
        Reviews <span className="text-slate-400">({reviews.length})</span>
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No reviews yet. Tried it? Use Rate above to leave the first one.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
            <div>
              <p className="text-4xl font-bold tabular-nums text-slate-900">
                {(rating?.score ?? 0).toFixed(1)}
              </p>
              <p className="mt-1 flex">
                {stars(Math.round(rating?.score ?? 0), "size-4")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                From {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="space-y-1">
              {split.map((s) => (
                <li
                  key={s.n}
                  className="flex items-center gap-2 text-xs text-slate-500"
                >
                  <span className="w-3 tabular-nums">{s.n}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${(s.count / reviews.length) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-right tabular-nums">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-5 divide-y divide-slate-100">
            {reviews.map((r) => (
              <li key={r.user_id} className="py-3">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex">{stars(r.rating)}</span>
                  {r.author.handle ? (
                    <Link
                      href={`/makers/${r.author.handle}`}
                      className="font-semibold text-slate-900 hover:text-brand-700"
                    >
                      {r.author.name || r.author.handle}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900">
                      {r.author.name}
                    </span>
                  )}
                  {r.author.verified && (
                    <BadgeCheck
                      className="size-4 fill-sky-500 text-white"
                      aria-label="Verified"
                    />
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(r.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                </p>
                {r.body && (
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-700">
                    {r.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
