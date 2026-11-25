import Link from "next/link";
import { Medal, MessageSquare, Sparkles, Star, Users } from "lucide-react";
import type { Product } from "@/lib/data";
import { dayLabel } from "@/lib/days";
import type { Award } from "@/lib/feed";
import { MacBadge, ProductLogo, SampleTag, UpvoteButton } from "../ProductRow";

const periodShort = { day: "Day", week: "Week", month: "Month" } as const;
const medal = {
  1: "bg-amber-100 text-amber-800 ring-amber-300",
  2: "bg-slate-100 text-slate-700 ring-slate-300",
  3: "bg-orange-100 text-orange-800 ring-orange-300",
} as const;

// "#1 of the Week" and friends, the best award first
export function AwardBadge({ award }: { award: Award }) {
  return (
    <span
      title={`#${award.rank} Product of the ${periodShort[award.period]} · ${award.label}`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${medal[award.rank]}`}
    >
      <Medal className="size-3" />#{award.rank} of the{" "}
      {periodShort[award.period]}
    </span>
  );
}

const awardOrder = { month: 0, week: 1, day: 2 } as const;
export const bestAward = (awards?: Award[]) =>
  [...(awards ?? [])].sort(
    (a, b) => a.rank - b.rank || awardOrder[a.period] - awardOrder[b.period],
  )[0];

export function FeaturedTag() {
  return (
    <span
      title="Featured launch"
      className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white"
    >
      <Sparkles className="size-3" />
      Featured
    </span>
  );
}

// One launch in a feed: logo, name with badges, tagline, details and the vote
export function LaunchRow({
  product: p,
  rank,
  award,
  featured = false,
  showDay = false,
  compact = false,
}: {
  product: Product;
  rank?: number | null;
  award?: Award;
  featured?: boolean;
  showDay?: boolean;
  compact?: boolean;
}) {
  return (
    <li
      className={`group relative flex items-center gap-3 rounded-2xl border bg-white transition hover:-translate-y-px hover:shadow-[0_6px_20px_-12px_rgb(0_0_0/0.35)] sm:gap-4 ${
        featured ? "border-brand-300 ring-1 ring-brand-200" : "border-slate-200"
      } ${compact ? "p-3" : "p-3 sm:p-4"}`}
    >
      {rank != null && (
        <span className="w-5 shrink-0 text-center text-sm font-bold tabular-nums text-slate-400">
          {rank}
        </span>
      )}
      <ProductLogo logo={p.logo} name={p.name} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/products/${p.slug}`}
            className="truncate font-semibold text-slate-900 after:absolute after:inset-0 after:rounded-2xl group-hover:text-brand-700"
          >
            {p.name}
          </Link>
          {featured && <FeaturedTag />}
          {award && <AwardBadge award={award} />}
          {p.app.platform === "mac" && <MacBadge />}
          {p.sample && <SampleTag />}
        </p>
        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
          {p.tagline}
        </p>
        {!compact && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {p.tags[0] && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                {p.tags[0]}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {p.comments}
            </span>
            {p.rating && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {p.rating.score.toFixed(1)}
              </span>
            )}
            {!!p.followers && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {p.followers}
              </span>
            )}
            {showDay && <span>{dayLabel(p.day)}</span>}
          </p>
        )}
      </div>
      {/* Above the card link, so voting doesn't open the product */}
      <div className="relative z-10">
        <UpvoteButton productId={p.id} count={p.upvotes} day={p.day} />
      </div>
    </li>
  );
}
