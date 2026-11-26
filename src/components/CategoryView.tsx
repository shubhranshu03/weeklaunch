"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Clock,
  Megaphone,
  Rocket,
  Search,
  Star,
  Trophy,
} from "lucide-react";
import type { Product } from "@/lib/data";
import type { Award } from "@/lib/feed";
import { voteRanks } from "@/lib/ranks";
import { bestAward, LaunchRow } from "./home/LaunchRow";

const tabs = [
  { id: "recent", label: "Recent", icon: Clock },
  { id: "best", label: "Best", icon: Trophy },
  { id: "rated", label: "Top rated", icon: Star },
] as const;
type Tab = (typeof tabs)[number]["id"];

export type CategorySignals = {
  launches: number;
  newThisMonth: number;
  upvotes: number;
  reviews: number;
  deals: number;
};

const FEATURE_DAYS = 7;

// One category: heading with search, numbers, a sponsor spot, then its launches
export function CategoryView({
  name,
  intro,
  noun,
  parent = { label: "Categories", href: "/categories" },
  products,
  awards,
  today,
  signals,
}: {
  name: string;
  intro: string;
  noun: string;
  // The breadcrumb level above this page
  parent?: { label: string; href: string };
  products: Product[];
  awards: Record<string, Award[]>;
  today: number;
  signals: CategorySignals;
}) {
  const [tab, setTab] = useState<Tab>("recent");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q),
    );
    const sorted = [...found];
    if (tab === "recent")
      sorted.sort((a, b) => b.day - a.day || b.upvotes - a.upvotes);
    if (tab === "best") sorted.sort((a, b) => b.upvotes - a.upvotes);
    if (tab === "rated")
      sorted.sort(
        (a, b) =>
          (b.rating?.score ?? 0) - (a.rating?.score ?? 0) ||
          (b.rating?.count ?? 0) - (a.rating?.count ?? 0) ||
          b.upvotes - a.upvotes,
      );
    return sorted;
  }, [products, query, tab]);

  const ranks = voteRanks(products);
  const isFeatured = (p: Product) =>
    !!p.premium && today - p.day < FEATURE_DAYS && p.day <= today;

  // Recent: grouped by launch day, newest first
  const groups =
    tab === "recent"
      ? list.reduce<{ title: string; items: Product[] }[]>((acc, p) => {
          const title =
            p.day === today
              ? "Published today"
              : p.day === today - 1
                ? "Published yesterday"
                : today - p.day < 7
                  ? "Earlier this week"
                  : "Earlier";
          const last = acc[acc.length - 1];
          if (last?.title === title) last.items.push(p);
          else acc.push({ title, items: [p] });
          return acc;
        }, [])
      : [
          {
            title: tab === "best" ? `Best ${noun}` : `Top rated ${noun}`,
            items: list,
          },
        ];

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-7 sm:px-10">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>{" "}
          /{" "}
          <Link href={parent.href} className="hover:text-slate-900">
            {parent.label}
          </Link>{" "}
          / <span className="text-slate-700">{name}</span>
        </nav>
        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-relaxed text-slate-600">
          {intro}
        </p>
        <label className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3 shadow-[0_2px_8px_-4px_rgb(15_23_42/0.15)] focus-within:border-brand-400">
          <Search className="size-4 shrink-0 text-brand-500" />
          <span className="sr-only">Search within {name}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search within ${name}…`}
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          {query && (
            <span className="shrink-0 pr-2 text-xs text-slate-500">
              {list.length} found
            </span>
          )}
        </label>
      </section>

      {/* Discovery signals */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Discovery signals
        </h2>
        <p className="text-xs text-slate-500">Across {name} on IndieShip</p>
        <dl className="mt-3 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
          {[
            {
              dot: "bg-brand-500",
              label: "Launches",
              big: signals.launches,
              unit: "listed",
              note: `${signals.newThisMonth} new in the last 30 days`,
            },
            {
              dot: "bg-amber-500",
              label: "Community",
              big: signals.upvotes,
              unit: "upvotes",
              note: `and ${signals.reviews} ${signals.reviews === 1 ? "review" : "reviews"}`,
            },
            {
              dot: "bg-emerald-500",
              label: "Deals",
              big: signals.deals,
              unit: "live deals",
              note: "Discounts for IndieShip visitors",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0"
            >
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className={`size-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </dt>
              <dd className="mt-1.5">
                <span className="text-2xl font-bold tabular-nums text-slate-900">
                  {s.big.toLocaleString("en-US")}
                </span>{" "}
                <span className="text-sm text-slate-600">{s.unit}</span>
              </dd>
              <dd className="mt-0.5 text-xs text-slate-500">{s.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Sponsor this category */}
      <Link
        href="/pricing#ads"
        className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-brand-300 bg-brand-500/5 px-4 py-3 transition hover:border-brand-400"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
          <Megaphone className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">
            Sponsor {name}
          </span>
          <span className="block text-xs text-slate-500">
            Feature your product at the top of this page.
          </span>
        </span>
        <span className="shrink-0 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700">
          Sponsor
        </span>
      </Link>

      {/* Tabs */}
      <div className="sticky top-16 z-20 -mx-1 mt-4 flex justify-end px-1 py-2">
        <div
          role="tablist"
          aria-label={`${name} launches`}
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
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-2 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Rocket className="size-6 text-brand-600" />
          <p className="mt-3 font-semibold text-slate-900">
            {query ? "Nothing matches that search" : `No ${noun} yet`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {query
              ? "Try a different word."
              : `Be the first ${name} launch on IndieShip.`}
          </p>
          {!query && (
            <Link
              href="/submit"
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Launch your product <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-900">
                {g.title}
              </h2>
              <ol className="mt-4 space-y-3">
                {g.items.map((p) => (
                  <LaunchRow
                    key={p.slug}
                    product={p}
                    rank={tab === "best" ? (ranks.get(p.slug) ?? null) : null}
                    award={bestAward(awards[p.slug])}
                    featured={isFeatured(p)}
                    showDay={tab !== "recent"}
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
