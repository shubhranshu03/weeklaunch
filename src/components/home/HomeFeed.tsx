"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Flame, Rocket, Trophy } from "lucide-react";
import type { HomeFeed as Feed } from "@/lib/feed";
import { voteRanks } from "@/lib/ranks";
import { ProductLogo } from "../ProductRow";
import { bestAward, LaunchRow } from "./LaunchRow";

const tabs = [
  { id: "top", label: "Top", icon: Trophy },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "trending", label: "Trending", icon: Flame },
] as const;
type Tab = (typeof tabs)[number]["id"];

const featuredDays = 7;

export function HomeFeed({ feed }: { feed: Feed }) {
  const [tab, setTab] = useState<Tab>("top");
  const isFeatured = (p: Feed["launches"][number]) =>
    !!p.premium && feed.today - p.day < featuredDays && p.day <= feed.today;
  const award = (slug: string) => bestAward(feed.awards[slug]);
  const todayRanks = voteRanks(feed.launches);
  const hot = new Set(feed.trending.slice(0, 3).map((p) => p.slug));

  return (
    <div className="min-w-0">
      <div className="sticky top-16 z-20 -mx-1 flex justify-end px-1 py-2">
        <div
          role="tablist"
          aria-label="Launch feeds"
          className="inline-flex gap-1 rounded-xl bg-slate-100/95 p-1 shadow-sm backdrop-blur"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.id !== "top" && <t.icon className="size-4" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "top" && (
        <div className="mt-4 space-y-8">
          {feed.top.length === 0 && <NoLaunches />}
          {feed.top.map((s, i) => (
            <section key={s.title} className="space-y-8">
              <div>
                <SectionHeading
                  title={`${s.title} top ${s.products.length}`}
                  hint={s.hint}
                />
                <ol className="mt-4 space-y-3">
                  {s.products.map((p, i) => (
                    <LaunchRow
                      key={p.slug}
                      product={p}
                      rank={p.upvotes > 0 ? i + 1 : null}
                      award={award(p.slug)}
                      featured={isFeatured(p)}
                      trending={hot.has(p.slug)}
                    />
                  ))}
                </ol>
              </div>
              {/* The one center ad, after the first list */}
              {i === 0 && <CenterAd product={feed.boosted} />}
            </section>
          ))}
          {feed.top.length === 0 && <CenterAd product={feed.boosted} />}

          <section id="today">
            <SectionHeading
              title="Today's launches"
              hint={`${feed.todayLabel} · ${feed.launches.length} launched`}
            />
            {feed.launches.length === 0 ? (
              <NoLaunches />
            ) : (
              <ol className="mt-4 space-y-3">
                {feed.launches.map((p) => (
                  <LaunchRow
                    key={p.slug}
                    product={p}
                    rank={todayRanks.get(p.slug) ?? null}
                    featured={isFeatured(p)}
                      trending={hot.has(p.slug)}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      {tab === "recent" && (
        <section className="mt-6">
          <SectionHeading title="Recently launched" hint="Newest first" />
          <ol className="mt-4 space-y-3">
            {feed.recent.map((p) => (
              <LaunchRow
                key={p.slug}
                product={p}
                award={award(p.slug)}
                featured={isFeatured(p)}
                      trending={hot.has(p.slug)}
                showDay
              />
            ))}
          </ol>
        </section>
      )}

      {tab === "trending" && (
        <section className="mt-6">
          <SectionHeading
            title="Trending"
            hint="Most upvoted launches of the last 7 days"
          />
          {feed.trending.length === 0 ? (
            <NoLaunches />
          ) : (
            <ol className="mt-4 space-y-3">
              {feed.trending.map((p, i) => (
                <LaunchRow
                  key={p.slug}
                  product={p}
                  rank={i + 1}
                  award={award(p.slug)}
                  featured={isFeatured(p)}
                      trending={hot.has(p.slug)}
                  showDay
                />
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

// Today's Boost (a launch's sponsor card), or the spot for sale
function CenterAd({ product }: { product: Feed["boosted"] }) {
  return (
    <aside aria-label="Advertisement">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        Advertisement
      </p>
      {product ? (
        <Link
          href={`/products/${product.slug}`}
          className="ad-glow group mt-1.5 flex items-center gap-4 rounded-2xl bg-white px-4 py-4 sm:px-6"
        >
          <ProductLogo logo={product.logo} name={product.name} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
              Sponsored · {product.name}
            </span>
            <span className="mt-0.5 block text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-700 sm:text-xl">
              {product.tagline}
            </span>
          </span>
          <span className="hidden h-10 shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white sm:flex">
            Take a look <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : (
        <Link
          href="/pricing#ads"
          className="ad-glow ad-glow-soft group mt-1.5 flex flex-col items-center gap-3 rounded-2xl px-4 py-5 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left"
        >
          <span>
            <span className="block text-lg font-bold text-slate-900 group-hover:text-brand-700 sm:text-xl">
              Your ad here, near the top of the feed
            </span>
            <span className="block text-sm text-slate-500">
              Seen by everyone who opens IndieShip for 7 days. $19 per week.
            </span>
          </span>
          <span className="flex h-10 shrink-0 items-center gap-1 rounded-xl bg-brand-500 px-4 text-sm font-bold text-white">
            Book this spot <ArrowRight className="size-4" />
          </span>
        </Link>
      )}
    </aside>
  );
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <span className="truncate text-xs font-medium text-slate-500">
        {hint}
      </span>
    </div>
  );
}

function NoLaunches() {
  return (
    <div className="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <Rocket className="size-6 text-brand-600" />
      <p className="mt-3 font-semibold text-slate-900">
        Nothing launched yet today
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Be the first: paid launches go live right away.
      </p>
      <Link
        href="/submit"
        className="btn-pop mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600"
      >
        Launch your product <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
