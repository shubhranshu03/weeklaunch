import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Rocket, Search, Trophy } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/Footer";
import { HomeFeed } from "@/components/home/HomeFeed";
import { LaunchRow } from "@/components/home/LaunchRow";
import { Masthead } from "@/components/paper/Masthead";
import { TvAd } from "@/components/paper/TvAd";
import { directoryPackages } from "@/lib/directories";
import { getHomeFeed } from "@/lib/feed";
import { getSidebarAds } from "@/lib/sidebarAds";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const fmt = (n: number) => n.toLocaleString("en-US");

// Today's launches, the top of each day, week and month, and what's trending
export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-paper">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/#home`,
          url: SITE_URL,
          name: "Today's product launches on WeekLaunch",
          description: SITE_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-20 sm:px-6">
        <Masthead compact />
        <Suspense
          fallback={
            <div className="mt-8 h-[600px] animate-pulse rounded-3xl bg-paper-dark/60" />
          }
        >
          <Front />
        </Suspense>
      </div>
      <Footer cta={false} />
    </div>
  );
}

async function Front() {
  const [feed, ads] = await Promise.all([getHomeFeed(), getSidebarAds()]);
  const top = directoryPackages[directoryPackages.length - 1];
  const from = Math.min(...directoryPackages.map((p) => p.price));

  return (
    <>
      {/* Hero */}
      <section className="mt-8 text-center">
        {feed.stats.launches > 0 && (
          <p className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600">
            <span>
              <strong className="text-slate-900">
                {fmt(feed.stats.launches)}
              </strong>{" "}
              launches
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong className="text-slate-900">
                {fmt(feed.stats.makers)}
              </strong>{" "}
              makers
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong className="text-slate-900">
                {fmt(feed.stats.votes)}
              </strong>{" "}
              upvotes
            </span>
          </p>
        )}
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
          Launch any day. Get found every day.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          New products from indie makers, ranked by the community. Win Product
          of the Day, Week or Month, and keep a page that Google and AI
          assistants can find.
        </p>
        <form
          action="/products"
          role="search"
          className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-2xl border-[1.5px] border-slate-300 bg-white p-1.5 focus-within:border-slate-900"
        >
          <Search className="ml-2 size-5 shrink-0 text-slate-400" />
          <label htmlFor="home-search" className="sr-only">
            Search products
          </label>
          <input
            id="home-search"
            name="q"
            placeholder="Find a tool: invoices, notes, screenshots…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/submit"
            className="btn-pop inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
          >
            <Rocket className="size-4" />
            Launch your product
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center gap-1 rounded-xl px-4 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            See plans <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Feed and side column */}
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <HomeFeed feed={feed} />

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-5">
            <TvAd channel={1} total={2} ad={ads[1]} />
            <TvAd channel={2} total={2} ad={ads[2]} />
          </div>

          {feed.featured.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Featured launches
              </h2>
              <ol className="mt-3 space-y-2">
                {feed.featured.slice(0, 4).map((p) => (
                  <LaunchRow key={p.slug} product={p} compact />
                ))}
              </ol>
            </section>
          )}

          <Link
            href="/hall-of-fame"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Trophy className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-900 group-hover:text-brand-700">
                Hall of Fame
              </span>
              <span className="block text-xs text-slate-500">
                Every Product of the Day, Week and Month
              </span>
            </span>
            <ArrowRight className="size-4 text-slate-400" />
          </Link>

          <section className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Done for you
            </p>
            <p className="mt-2 text-xl font-bold leading-tight">
              We launch your product on {top.count} directories
            </p>
            <p className="mt-1 text-sm text-white/70">
              Product Hunt, G2, Capterra, BetaList and more, strongest sites
              first. A report with every live link. From ${from}.
            </p>
            <Link
              href="/directory-submission"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
            >
              See the packages <ArrowRight className="size-4" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
