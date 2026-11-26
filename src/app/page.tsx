import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BadgeCheck,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Trophy,
  Wrench,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/Footer";
import { AiLogos } from "@/components/home/AiLogos";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { HomeFeed } from "@/components/home/HomeFeed";
import { getHomeFeed, type HomeFeed as Feed } from "@/lib/feed";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const fmt = (n: number) => n.toLocaleString("en-US");

// Today's launches, the top of each day, week and month, and what's trending
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/#home`,
          url: SITE_URL,
          name: "Today's product launches on IndieShip",
          description: SITE_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <Suspense fallback={<BrowseShellFallback />}>
        <Front />
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

async function Front() {
  const feed = await getHomeFeed();
  return (
    <BrowseShell>
      <Hero feed={feed} />
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500">
        <span className="hidden sm:inline">Explore IndieShip:</span>
        <Link
          href="/hall-of-fame"
          className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
        >
          <Trophy className="size-4" /> Hall of Fame
        </Link>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
        >
          <LayoutGrid className="size-4" /> Categories
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
        >
          <Wrench className="size-4" /> Free tools
        </Link>
        <Link
          href="/badges"
          className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
        >
          <BadgeCheck className="size-4" /> Launch badges
        </Link>
      </p>
      <div className="mt-4">
        <HomeFeed feed={feed} />
      </div>
    </BrowseShell>
  );
}

function Hero({ feed }: { feed: Feed }) {
  const s = feed.stats;
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-4 py-7 text-center sm:px-10 sm:py-8">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <AiLogos />
        <span className="text-sm text-slate-600">
          Get found by{" "}
          <strong className="font-semibold text-slate-900">
            ChatGPT, Claude, Gemini
          </strong>{" "}
          and more
        </span>
      </div>
      <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
        Launch today. Get found{" "}
        <span className="bg-gradient-to-r from-brand-500 to-fuchsia-500 bg-clip-text text-transparent">
          every day
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-slate-600">
        Paste your link once. The community upvotes it, you compete for Product
        of the Day, and your page keeps working on Google and AI assistants.
      </p>
      <form
        action="/products"
        role="search"
        className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3 shadow-[0_2px_8px_-4px_rgb(15_23_42/0.15)] focus-within:border-brand-400"
      >
        <Search className="size-4 shrink-0 text-brand-500" />
        <label htmlFor="home-search" className="sr-only">
          Search products
        </label>
        <input
          id="home-search"
          name="q"
          placeholder="Try: invoices, screenshots, habit tracker…"
          className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        <Link
          href="/products"
          aria-label="Browse with filters"
          className="hidden size-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:flex"
        >
          <SlidersHorizontal className="size-4" />
        </Link>
        <button
          type="submit"
          className="h-9 shrink-0 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Search
        </button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/submit"
          className="inline-flex h-11 items-center rounded-xl bg-slate-900 px-5 text-[15px] font-semibold text-white hover:bg-slate-700"
        >
          Launch your product
        </Link>
        <Link
          href="/about"
          className="inline-flex h-11 items-center gap-1 px-2 text-[15px] text-slate-600 hover:text-slate-900"
        >
          How it works <ArrowRight className="size-4" />
        </Link>
      </div>
      {s.launches > 0 && (
        <p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500">
          <strong className="text-slate-900">{fmt(s.launches)}</strong> launches
          · <strong className="text-slate-900">{fmt(s.makers)}</strong> makers ·{" "}
          <strong className="text-slate-900">{fmt(s.votes)}</strong> upvotes ·
          Product of the Day, every day
        </p>
      )}
    </section>
  );
}
