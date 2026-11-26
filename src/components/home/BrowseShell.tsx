import Link from "next/link";
import {
  ArrowRight,
  Award,
  Newspaper,
  Send,
  Tag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Masthead } from "@/components/paper/Masthead";
import { ProductLogo } from "@/components/ProductRow";
import { directoryPackages } from "@/lib/directories";
import { getHallOfFame, getHomeFeed, type HomeFeed as Feed } from "@/lib/feed";
import { postDate, posts } from "@/lib/blog";
import { dealLabel } from "@/lib/deals";
import type { Product } from "@/lib/data";
import { getAllProducts } from "@/lib/products";
import { getSidebarAds } from "@/lib/sidebarAds";
import { DealCode } from "../DealCode";
import { toolHref, tools } from "@/lib/tools";
import { BrowseNav } from "./BrowseNav";
import { AdvertiseTile, SideTile, SponsorStrip, type Tile } from "./SideTiles";

const fmt = (n: number) => n.toLocaleString("en-US");

// The frame of the home and browse pages: sponsor tiles (or strips on smaller
// screens), the top bar, the Browse column on the left and the widgets on the
// right. The page's own content goes in the middle.
export async function BrowseShell({ children }: { children: React.ReactNode }) {
  const [feed, ads, fame, all] = await Promise.all([
    getHomeFeed(),
    getSidebarAds(),
    getHallOfFame(),
    getAllProducts(),
  ]);
  const deals = all
    .filter((p) => p.deal)
    .sort((a, b) => (b.deal?.percent ?? 0) - (a.deal?.percent ?? 0))
    .slice(0, 3);

  // Side columns on very wide screens: sponsors first, then featured launches
  const seen = new Set<string>();
  const tiles: Tile[] = [
    ...Object.values(ads).map((ad) => ({ kind: "ad" as const, ad })),
    ...[...feed.featured, ...feed.recent.filter((p) => p.premium)]
      .filter((p) => !seen.has(p.slug) && seen.add(p.slug))
      .map((product) => ({ kind: "product" as const, product })),
  ].slice(0, 9);
  const left = tiles.filter((_, i) => i % 2 === 0).slice(0, 5);
  const right = tiles.filter((_, i) => i % 2 === 1).slice(0, 4);

  return (
    <>
      {/* Below 1440px the sponsors scroll in a strip above the bar and along the bottom */}
      <SponsorStrip tiles={tiles} />
      <Masthead />
      <SponsorStrip tiles={[...tiles].reverse()} bottom />

      <div className="min-[1440px]:grid min-[1440px]:grid-cols-[minmax(172px,1fr)_minmax(0,1248px)_minmax(172px,1fr)] min-[1440px]:gap-6">
        <SideRail tiles={left} label="Sponsors" />

        <div className="w-full min-w-0 px-4 min-[1440px]:px-0">
          <div className="pb-6 pt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-4 lg:pt-6 xl:grid-cols-[200px_minmax(0,1fr)_minmax(240px,250px)]">
            <aside className="hidden xl:col-start-1 xl:row-start-1 xl:block">
              <div className="no-scrollbar sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
                <BrowseNav />
              </div>
            </aside>

            <main className="min-w-0 lg:col-start-1 lg:row-start-1 xl:col-start-2">
              <div className="mb-3 lg:hidden">
                <PulseBar feed={feed} />
              </div>
              {children}
            </main>

            <aside className="mt-8 flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:mt-0 xl:col-start-3">
              <div className="hidden lg:block">
                <Pulse feed={feed} />
              </div>
              <DirectoriesCard />
              <BlogCard />
              <DealsCard deals={deals} />
              <ToolsCard />
              <FameCard entries={fame.day.slice(0, 3)} />
            </aside>
          </div>
        </div>

        <SideRail tiles={right} label="Featured launches" advertise />
      </div>
    </>
  );
}

// What shows while the frame's data loads
export function BrowseShellFallback() {
  return (
    <>
      <Masthead />
      <div className="mx-auto mt-6 h-[600px] w-full max-w-[1248px] animate-pulse rounded-2xl bg-slate-100" />
    </>
  );
}

export // Width of the middle column, shared by the bar, the page and the footer strip
const center =
  "mx-auto w-full px-4 min-[1440px]:max-w-[min(1248px,calc(100vw-424px))] min-[1440px]:px-0";

// The sponsor column on each side of wide screens, centered in the window
function SideRail({
  tiles,
  label,
  advertise = false,
}: {
  tiles: Tile[];
  label: string;
  advertise?: boolean;
}) {
  return (
    <aside
      aria-label={label}
      className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-hidden min-[1440px]:flex"
    >
      <div className="mx-auto flex w-full max-w-72 flex-col items-center justify-center gap-2.5 px-2 py-4">
        {tiles.map((t, i) => (
          <SideTile key={i} tile={t} />
        ))}
        {advertise && <AdvertiseTile />}
      </div>
    </aside>
  );
}

const card = "rounded-2xl border border-slate-200 bg-white p-4";
const cardTitle =
  "flex items-center gap-2 text-[15px] font-semibold text-slate-900";
const outlineBtn =
  "mt-3 flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 text-sm font-medium text-slate-800 hover:bg-slate-50";

function sparkPoints(byDay: number[]) {
  const max = Math.max(1, ...byDay);
  return byDay
    .map((n, i) => `${(i / (byDay.length - 1)) * 200},${38 - (n / max) * 34}`)
    .join(" ");
}

// The stats card as one slim bar, above the hero on phones and tablets
function PulseBar({ feed }: { feed: Feed }) {
  const { byDay, launches, votes } = feed.pulse;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <TrendingUp className="size-4 shrink-0 text-brand-500" />
      <p className="shrink-0 text-sm">
        <strong className="font-bold tabular-nums text-slate-900">
          {fmt(launches)}
        </strong>{" "}
        <span className="text-slate-500">launches</span>
      </p>
      <svg
        viewBox="0 0 200 40"
        className="h-6 min-w-0 flex-1"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={sparkPoints(byDay)}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="shrink-0 border-l border-slate-200 pl-3 text-sm">
        <strong className="font-bold tabular-nums text-slate-900">
          {fmt(votes)}
        </strong>{" "}
        <span className="text-slate-500">upvotes</span>
      </p>
    </div>
  );
}

// Real launches per day over the last 30 days
function Pulse({ feed }: { feed: Feed }) {
  const { byDay, launches, votes } = feed.pulse;
  const points = sparkPoints(byDay);
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <TrendingUp className="size-4 text-brand-500" />
        Launches
      </h2>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-slate-900">
          {fmt(launches)}
        </span>
        <span className="text-xs text-slate-500">last 30 days</span>
      </p>
      <svg
        viewBox="0 0 200 40"
        className="mt-2 h-10 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-brand-500)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        {fmt(votes)} upvotes on these launches
      </p>
    </section>
  );
}

function DirectoriesCard() {
  const top = directoryPackages[directoryPackages.length - 1];
  const from = Math.min(...directoryPackages.map((p) => p.price));
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <Send className="size-4 text-brand-500" />
        Submit to {top.count} directories
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Share your product once. We submit it by hand, strongest sites first,
        from ${from}.
      </p>
      <Link href="/directory-submission" className={outlineBtn}>
        Start submission <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

function ToolsCard() {
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <Wrench className="size-4 text-brand-500" />
        Free launch tools
      </h2>
      <ul className="mt-2 space-y-2.5">
        {tools.slice(0, 3).map((t) => (
          <li key={t.slug}>
            <Link href={toolHref(t)} className="group block">
              <span className="block text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                {t.name}
              </span>
              <span className="line-clamp-1 text-xs text-slate-500">
                {t.summary}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/tools" className={outlineBtn}>
        View all <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

function FameCard({
  entries,
}: {
  entries: Awaited<ReturnType<typeof getHallOfFame>>["day"];
}) {
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <Award className="size-4 text-amber-500" />
        Hall of Fame
      </h2>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          The first winners appear when the first launch day ends.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map((e) => (
            <li key={`${e.award.from}-${e.product.slug}`}>
              <Link
                href={`/products/${e.product.slug}`}
                className="group flex items-center gap-3"
              >
                <ProductLogo
                  logo={e.product.logo}
                  name={e.product.name}
                  size="sm"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                    {e.product.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    #{e.award.rank} Product of the Day
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/hall-of-fame" className={outlineBtn}>
        View all <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

// The best deals on launches, or an invite to add one
function DealsCard({ deals }: { deals: Product[] }) {
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <Tag className="size-4 text-emerald-600" />
        Deals
      </h2>
      {deals.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Makers can add a discount for IndieShip visitors when they launch.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {deals.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/products/${p.slug}`}
                className="group flex items-center gap-2.5"
              >
                <ProductLogo logo={p.logo} name={p.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                    {p.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {p.deal!.text || p.tagline}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-emerald-600">
                  {dealLabel(p.deal!).replace(" OFF", "")}
                </span>
              </Link>
              {i === 0 && p.deal!.code && (
                <div className="mt-2">
                  <DealCode code={p.deal!.code} size="sm" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <Link href={deals.length ? "/deals" : "/submit"} className={outlineBtn}>
        {deals.length ? "View all" : "Launch with a deal"}{" "}
        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

// The newest blog post
function BlogCard() {
  const post = posts[0];
  if (!post) return null;
  return (
    <section className={card}>
      <h2 className={cardTitle}>
        <Newspaper className="size-4 text-brand-500" />
        Latest from the blog
      </h2>
      <Link href={`/blog/${post.slug}`} className="group mt-2 block">
        <span className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
          {post.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs text-slate-500">
          {post.description}
        </span>
        <span className="mt-1.5 block text-xs text-slate-400">
          {postDate(post.date)} · {post.readMinutes} min read
        </span>
      </Link>
      <Link href="/blog" className={outlineBtn}>
        View all <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
