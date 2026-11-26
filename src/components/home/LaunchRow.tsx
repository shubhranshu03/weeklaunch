import Link from "next/link";
import {
  Apple,
  BadgeCheck,
  Flame,
  Globe,
  Laptop,
  Medal,
  MessageSquare,
  Puzzle,
  Smartphone,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import type { Product } from "@/lib/data";
import { dayLabel } from "@/lib/days";
import { dealLabel } from "@/lib/deals";
import type { Award } from "@/lib/feed";
import { ProductLogo, SampleTag, UpvoteButton } from "../ProductRow";
import { FollowBell, SaveChip } from "./CardButtons";

const periodShort = { day: "Day", week: "Week", month: "Month" } as const;
const medal = {
  1: "bg-amber-50 text-amber-800 ring-amber-200",
  2: "bg-slate-50 text-slate-700 ring-slate-200",
  3: "bg-orange-50 text-orange-800 ring-orange-200",
} as const;

const platformIcon = {
  web: Globe,
  mac: Laptop,
  ios: Apple,
  android: Smartphone,
  chrome: Puzzle,
} as const;

const chip =
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset";

// "#1 of the Week" and friends, the best award first
export function AwardBadge({ award }: { award: Award }) {
  return (
    <span
      title={`#${award.rank} Product of the ${periodShort[award.period]} · ${award.label}`}
      className={`${chip} ${medal[award.rank]}`}
    >
      <Medal className="size-3.5" />#{award.rank} of the{" "}
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
      className={`${chip} bg-brand-50 text-brand-700 ring-brand-200`}
    >
      <Sparkles className="size-3.5" />
      Featured
    </span>
  );
}

// One launch in a feed: logo, name, tagline, followers and the vote on top;
// categories, comments and badges underneath
export function LaunchRow({
  product: p,
  rank,
  award,
  featured = false,
  trending = false,
  showDay = false,
  compact = false,
}: {
  product: Product;
  rank?: number | null;
  award?: Award;
  featured?: boolean;
  trending?: boolean;
  showDay?: boolean;
  compact?: boolean;
}) {
  const PlatformIcon =
    platformIcon[p.app.platform as keyof typeof platformIcon] ?? null;

  if (compact)
    return (
      <li className="group relative flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
        <ProductLogo logo={p.logo} name={p.name} size="sm" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${p.slug}`}
            className="block truncate text-sm font-semibold text-slate-900 after:absolute after:inset-0 group-hover:text-brand-700"
          >
            {p.name}
          </Link>
          <p className="truncate text-xs text-slate-500">{p.tagline}</p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-500">
          ▲ {p.upvotes}
        </span>
      </li>
    );

  return (
    <li>
      <article
        className={`group relative flex flex-col rounded-xl border bg-white p-4 transition-shadow hover:shadow-lg ${
          featured ? "border-brand-300" : "border-slate-200"
        }`}
      >
        <div className="mb-3 flex flex-1 items-start justify-between gap-1">
          <div className="flex min-w-0 flex-1 items-center">
            {rank != null && (
              <span className="mr-2 hidden w-4 shrink-0 text-center text-xs font-semibold tabular-nums text-slate-400 sm:block">
                {rank}
              </span>
            )}
            <span className="[&>*]:!size-10 [&>*]:!rounded-lg [&>*]:!text-sm">
              <ProductLogo logo={p.logo} name={p.name} size="sm" />
            </span>
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="min-w-0 truncate text-base font-semibold text-slate-900">
                  <Link
                    href={`/products/${p.slug}`}
                    className="inline-flex min-h-6 max-w-full items-center truncate after:absolute after:inset-0 after:rounded-xl group-hover:text-brand-700"
                  >
                    {p.name}
                  </Link>
                </h3>
                <span className="flex shrink-0 items-center gap-1.5 self-center">
                  {(p.verified || p.maker.verified) && (
                    <BadgeCheck
                      className="size-3.5 fill-emerald-500 text-white"
                      aria-label="Verified maker"
                    />
                  )}
                  {PlatformIcon && (
                    <PlatformIcon
                      className="size-3.5 text-slate-400"
                      aria-label={p.app.platform}
                    />
                  )}
                  {p.sample && <SampleTag />}
                </span>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-slate-600">
                {p.tagline}
              </p>
            </div>
          </div>
          {/* Above the card link, so these don't open the product */}
          <div className="relative z-10 flex flex-row items-center gap-2">
            <FollowBell productId={p.id} count={p.followers ?? 0} />
            <UpvoteButton
              productId={p.id}
              count={p.upvotes}
              day={p.day}
              variant="soft"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-row items-end justify-end gap-2">
          <div className="hidden min-w-0 max-w-[60%] shrink flex-row flex-wrap gap-2 md:flex">
            {p.tags.slice(0, 2).map((t, i) => (
              <span
                key={t}
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                  i === 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="relative z-10 min-w-0 flex-1">
            <div className="no-scrollbar flex flex-row-reverse flex-nowrap gap-2 overflow-x-auto">
              {featured && <FeaturedTag />}
              {p.deal && (
                <span
                  title={p.deal.text || "Discount for IndieShip visitors"}
                  className={`${chip} border border-emerald-200 bg-emerald-50 text-emerald-700 ring-0`}
                >
                  <Tag className="size-3.5" />
                  {dealLabel(p.deal)}
                </span>
              )}
              {award && <AwardBadge award={award} />}
              {p.rating && (
                <span
                  className={`${chip} border border-amber-200 bg-amber-50 text-amber-700 ring-0`}
                >
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  Rating {p.rating.score.toFixed(1)}
                </span>
              )}
              {trending && (
                <span
                  className={`${chip} border border-orange-200 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 ring-0`}
                >
                  <Flame className="size-3.5" />
                  Trending
                </span>
              )}
              {showDay && (
                <span className={`${chip} bg-white text-slate-500 ring-0`}>
                  {dayLabel(p.day)}
                </span>
              )}
              <SaveChip productId={p.id} />
              <Link
                href={`/products/${p.slug}#comments`}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:border-slate-400"
              >
                <MessageSquare className="size-3.5" />
                {p.comments}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
