"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { PREMIUM_PRICE, type Product } from "@/lib/data";
import type { WeekSpace } from "@/lib/products";
import { voteRanks } from "@/lib/ranks";
import { weekKey, weekStart, type Week } from "@/lib/weeks";
import { ProductLogo, UpvoteButton } from "../ProductRow";

// Time left until voting closes (Sunday night, 24:00 UTC)
function VotingClock({ week }: { week: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return <span className="opacity-0">Voting open</span>;
  const left = weekStart(week + 1).getTime() - now;
  if (left <= 0) return <span>Voting closed</span>;
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor((left % 86_400_000) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  return (
    <span>
      Voting closes in{" "}
      <strong className="font-bold text-press tabular-nums">
        {d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`}
      </strong>
    </span>
  );
}

// A red rubber stamp across a full week
function SoldOutStamp({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none border-[3px] border-press bg-paper/70 px-1 py-0.5 text-press ${className}`}
    >
      <div className="border border-press px-4 py-1 text-center font-display font-black uppercase leading-none tracking-[0.08em]">
        Sold out
      </div>
    </div>
  );
}

// Under the edition bar: sold out, or only a few spots left
function SpaceNotice({ week, space }: { week: Week; space?: WeekSpace }) {
  if (!space || space.left > 5) return null;
  const soldOut = space.left === 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-ink bg-paper-dark px-3 py-2 text-center font-sans text-xs sm:text-[13px]">
      <span className="font-bold uppercase tracking-[0.12em] text-press">
        {soldOut
          ? `Week ${week.number} is sold out`
          : `Only ${space.left} launch spot${space.left === 1 ? "" : "s"} left in Week ${week.number}`}
      </span>
      <span className="text-ink-soft">
        {soldOut
          ? "Free launches wait in the queue. Premium lets you pick the next open week."
          : space.premiumLeft > 0
            ? `Premium can still book one, for $${PREMIUM_PRICE}.`
            : "Free launches join the queue."}
      </span>
      <Link
        href="/pricing"
        className="font-semibold text-ink underline underline-offset-4 hover:text-press"
      >
        Get Premium
      </Link>
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-press">
      {children}
    </p>
  );
}

const rankLabel = (rank: number | null) =>
  rank ? `No. ${rank} by votes` : "No votes yet";

function Premium() {
  return (
    <span className="ml-2 rounded-sm border border-ink px-1 py-px align-middle font-sans text-[9px] font-bold uppercase tracking-wider text-ink">
      Premium
    </span>
  );
}

function Byline({ product }: { product: Product }) {
  const tags = product.tags.slice(0, 2).join(", ");
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 font-sans text-xs text-ink-soft">
      <span>
        By{" "}
        {product.maker.handle ? (
          <Link
            href={`/makers/${product.maker.handle}`}
            className="font-semibold text-ink hover:underline"
          >
            {product.maker.name}
          </Link>
        ) : (
          <span className="font-semibold text-ink">{product.maker.name}</span>
        )}
      </span>
      {product.verified && (
        <BadgeCheck
          className="size-3.5 fill-ink text-paper"
          aria-label="Verified maker"
        />
      )}
      {tags && <span>· {tags}</span>}
      <span className="flex items-center gap-1">
        · <MessageSquare className="size-3" /> {product.comments}
      </span>
    </p>
  );
}

// The top of the board (a pinned Premium launch, or else the most upvoted)
function LeadStory({
  product,
  rank,
  current,
  soldOut,
}: {
  product: Product;
  rank: number | null;
  current: boolean;
  soldOut: boolean;
}) {
  const shot = product.screenshots[0];
  const body =
    product.description.length > 560
      ? `${product.description.slice(0, 560).replace(/\s+\S*$/, "")}…`
      : product.description;

  return (
    <article className="flex min-w-0 flex-col gap-4">
      <Kicker>
        {product.premium
          ? `Featured · ${rankLabel(rank)}`
          : rank === 1
            ? current
              ? "Leading this week"
              : "Won this week"
            : rankLabel(rank)}
        {product.premium && <Premium />}
      </Kicker>
      <Link href={`/products/${product.slug}`} className="group">
        <h2 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-ink group-hover:text-press sm:text-6xl">
          {product.name}
        </h2>
        <p className="mt-3 font-serif text-xl italic leading-snug text-ink-soft sm:text-2xl">
          {product.tagline}
        </p>
      </Link>
      <Byline product={product} />

      <figure className="relative border-y border-ink py-3">
        {soldOut && (
          <SoldOutStamp className="absolute right-3 top-6 z-10 -rotate-[9deg] text-3xl sm:right-6 sm:text-5xl" />
        )}
        <Link
          href={`/products/${product.slug}`}
          className="block overflow-hidden bg-paper-dark"
        >
          {shot ? (
            // eslint-disable-next-line @next/next/no-img-element -- maker-uploaded screenshot from storage
            <img
              src={shot}
              alt={`${product.name} screenshot`}
              className="aspect-[16/9] w-full object-cover grayscale-[35%] sepia-[15%] transition duration-500 hover:grayscale-0 hover:sepia-0"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center">
              <ProductLogo logo={product.logo} name={product.name} size="lg" />
            </div>
          )}
        </Link>
        <figcaption className="mt-2 font-sans text-[11px] italic text-ink-soft">
          {product.premium
            ? `${product.name} paid to be featured. Its rank comes only from votes.`
            : `${product.name}, launched this week on WeekLaunch.`}
        </figcaption>
      </figure>

      {body && (
        <p className="drop-cap font-serif text-[17px] leading-relaxed text-ink md:columns-2 md:gap-8">
          {body}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <UpvoteButton
          productId={product.id}
          count={product.upvotes}
          week={product.week}
          variant="paper"
        />
        <a
          href={product.website}
          target="_blank"
          rel="noopener noreferrer"
          className="ink-pop flex h-10 items-center gap-1 rounded-sm bg-ink px-4 font-sans text-sm font-bold text-paper"
        >
          Visit site <ArrowUpRight className="size-4" />
        </a>
        <Link
          href={`/products/${product.slug}`}
          className="flex items-center gap-1 font-sans text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          Read the full story <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

// The next two on the board, each with its real rank by votes
function SideStory({
  product,
  rank,
}: {
  product: Product;
  rank: number | null;
}) {
  return (
    <article className="flex flex-col gap-2.5 py-5 first:pt-0 last:pb-0">
      <Kicker>
        {product.premium && "Featured · "}
        {rankLabel(rank)}
        {product.premium && <Premium />}
      </Kicker>
      <Link
        href={`/products/${product.slug}`}
        className="group flex items-start gap-3"
      >
        <ProductLogo logo={product.logo} name={product.name} />
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-ink group-hover:text-press">
            {product.name}
          </h3>
          <p className="mt-1 font-serif text-[15px] leading-snug text-ink-soft">
            {product.tagline}
          </p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3">
        <Byline product={product} />
        <UpvoteButton
          productId={product.id}
          count={product.upvotes}
          week={product.week}
          variant="paper"
        />
      </div>
    </article>
  );
}

// Everything below the top 3, as a ruled results table
function FullChart({
  products,
  ranks,
}: {
  products: Product[];
  ranks: Map<string, number | null>;
}) {
  return (
    <section aria-label="The rest of this week's launches">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-1.5">
        <h2 className="font-display text-2xl font-black text-ink">
          The full chart
        </h2>
        <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          {products.some((p) => p.premium)
            ? "Premium pinned · numbers are rank by votes"
            : "Numbers are rank by votes"}
        </span>
      </div>
      <ol className="divide-y divide-rule">
        {products.map((p) => (
          <li key={p.slug} className="flex items-center gap-3 py-3.5 sm:gap-4">
            <span className="w-8 shrink-0 font-display text-2xl font-black tabular-nums text-ink/35">
              {ranks.get(p.slug) ?? "–"}
            </span>
            <Link
              href={`/products/${p.slug}`}
              className="group flex min-w-0 flex-1 items-center gap-3"
            >
              <ProductLogo logo={p.logo} name={p.name} size="sm" />
              <div className="min-w-0">
                <h3 className="truncate font-serif text-lg font-semibold leading-tight text-ink group-hover:text-press">
                  {p.name}
                  {p.premium && <Premium />}
                </h3>
                <p className="truncate font-serif text-sm italic text-ink-soft">
                  {p.tagline}
                </p>
              </div>
            </Link>
            <UpvoteButton
              productId={p.id}
              count={p.upvotes}
              week={p.week}
              variant="paper"
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

// Center feed ad, right after the top 3 (sold weekly on /pricing).
// A boosted launch takes it; otherwise it offers the spot.
function CenterAd({ product }: { product?: Product }) {
  return (
    <aside aria-label="Advertisement" className="border-y-[3px] border-double border-ink py-1">
      <p className="text-center font-sans text-[10px] uppercase tracking-[0.24em] text-ink-soft">
        Advertisement
      </p>
      {product ? (
        <Link
          href={`/products/${product.slug}`}
          className="group mt-1 flex items-center gap-4 border border-ink bg-white px-4 py-5 sm:gap-6 sm:px-7"
        >
          <ProductLogo logo={product.logo} name={product.name} />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-press">
              Sponsored · {product.name}
            </p>
            <p className="mt-1 font-display text-2xl font-black leading-tight text-ink group-hover:text-press sm:text-3xl">
              {product.tagline}
            </p>
          </div>
          <span className="ink-pop hidden h-10 shrink-0 items-center gap-1 rounded-sm bg-ink px-4 font-sans text-sm font-bold text-paper sm:flex">
            Take a look <ArrowUpRight className="size-4" />
          </span>
        </Link>
      ) : (
        <Link
          href="/pricing#ads"
          className="group mt-1 flex flex-col items-center gap-3 border border-dashed border-ink/60 px-4 py-6 text-center sm:flex-row sm:justify-between sm:px-7 sm:text-left"
        >
          <div>
            <p className="font-display text-2xl font-black leading-tight text-ink group-hover:text-press sm:text-3xl">
              Your ad here, right after the top 3
            </p>
            <p className="mt-1 font-serif italic text-ink-soft">
              Seen by every reader of this week&apos;s edition. $19 per week.
            </p>
          </div>
          <span className="ink-pop flex h-10 shrink-0 items-center gap-1 rounded-sm bg-press px-4 font-sans text-sm font-bold text-white">
            Book this spot <ArrowRight className="size-4" />
          </span>
        </Link>
      )}
    </aside>
  );
}

// The two right sidebar ad boxes (sold monthly on /pricing)
function SidebarAds() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2].map((spot) => (
        <aside key={spot} aria-label="Advertisement" className="border-2 border-ink p-1">
          <Link
            href="/pricing#ads"
            className="group block border border-ink px-4 py-5 text-center transition hover:bg-white"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-ink-soft">
              Advertisement
            </p>
            <p className="mt-2 font-display text-xl font-black leading-tight text-ink group-hover:text-press">
              Advertise in The WeekLaunch
            </p>
            <p className="mt-1 font-serif text-sm italic text-ink-soft">
              Your logo, one line and a link on every page. Spot {spot} of 2 ·
              $49/month.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-wider text-press">
              Book this spot <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </aside>
      ))}
    </div>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b-2 border-ink pb-1.5 font-display text-xl font-black text-ink">
      {children}
    </h2>
  );
}

function LastWeek({ week, products }: { week?: Week; products: Product[] }) {
  if (!week || products.length === 0) return null;
  const ranks = voteRanks(products);
  return (
    <section>
      <SideHeading>Last week&apos;s winners</SideHeading>
      <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-soft">
        Week {week.number} · {week.label}
      </p>
      <ol className="mt-2 divide-y divide-rule">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/products/${p.slug}`}
              className="group flex items-baseline gap-3 py-2.5"
            >
              <span className="font-display text-xl font-black text-press">
                {ranks.get(p.slug)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif font-semibold text-ink group-hover:text-press">
                  {p.name}
                </span>
                <span className="block truncate font-serif text-sm italic text-ink-soft">
                  {p.tagline}
                </span>
              </span>
              <span className="font-sans text-xs tabular-nums text-ink-soft">
                ▲ {p.upvotes}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Classifieds() {
  const ads = [
    {
      title: "Get 100+ backlinks, done for you",
      body: "We submit your product to launch directories, strongest sites first. From $49.",
      href: "/directory-submission",
    },
    {
      title: "Premium launch, $29",
      body: "Skip the queue, pick your week and get pinned to the top.",
      href: "/pricing",
    },
    {
      title: "Free launch tools",
      body: "Checklists, generators and helpers for launch week.",
      href: "/tools",
    },
  ];
  return (
    <section>
      <SideHeading>Classifieds</SideHeading>
      <ul className="mt-2 divide-y divide-rule">
        {ads.map((a) => (
          <li key={a.title}>
            <Link href={a.href} className="group block py-3">
              <p className="font-sans text-sm font-bold uppercase tracking-wide text-ink group-hover:text-press">
                {a.title}
              </p>
              <p className="mt-0.5 font-serif text-sm leading-snug text-ink-soft">
                {a.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NextEdition() {
  return (
    <section className="bg-ink p-5 text-paper">
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-paper/60">
        Makers wanted
      </p>
      <p className="mt-2 font-display text-2xl font-black leading-tight">
        Be in next Monday&apos;s edition
      </p>
      <p className="mt-1 font-serif text-sm italic text-paper/75">
        Your first product is free. Each launch gets its own page and a week on the chart.
      </p>
      <Link
        href="/submit"
        className="mt-4 inline-flex items-center gap-1 rounded-sm border-[1.5px] border-paper bg-press px-4 py-2 font-sans text-sm font-bold text-white transition hover:bg-[#c92d24]"
      >
        Submit your product <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

// An edition with nothing to show yet (an upcoming or empty week)
function EmptyEdition({
  week,
  future,
  current,
  soldOut,
}: {
  week: Week;
  future: boolean;
  current: boolean;
  soldOut: boolean;
}) {
  if (!future && !current)
    return (
      <div className="border-y border-ink py-16 text-center">
        <Kicker>From the archive</Kicker>
        <h2 className="mx-auto mt-3 max-w-xl font-display text-4xl font-black leading-tight text-ink sm:text-5xl">
          Nothing launched in Week {week.number}
        </h2>
        <p className="mx-auto mt-3 max-w-md font-serif text-lg italic text-ink-soft">
          This edition went to press empty. Flip to a later edition for this
          week&apos;s launches.
        </p>
      </div>
    );

  return (
    <div className="relative border-y border-ink py-16 text-center">
      {soldOut && (
        <SoldOutStamp className="absolute right-2 top-4 -rotate-[9deg] text-3xl sm:right-8 sm:text-5xl" />
      )}
      <Kicker>{future ? "Coming soon" : "Quiet week"}</Kicker>
      <h2 className="mx-auto mt-3 max-w-xl font-display text-4xl font-black leading-tight text-ink sm:text-5xl">
        {future
          ? `The Week ${week.number} edition goes to press ${week.label.split(" – ")[0]}`
          : `No launches in Week ${week.number}, yet`}
      </h2>
      <p className="mx-auto mt-3 max-w-md font-serif text-lg italic text-ink-soft">
        {future
          ? soldOut
            ? "Every spot in this edition is taken. Premium lets you pick the next open week."
            : "Book a slot now and start the week on the front page."
          : "Be the first launch in this edition and take the headline."}
      </p>
      <Link
        href={soldOut ? "/pricing" : "/submit"}
        className="ink-pop mt-6 inline-flex h-11 items-center gap-1 rounded-sm bg-press px-5 font-sans text-sm font-bold text-white"
      >
        {soldOut
          ? "Get Premium"
          : future
            ? "Book a launch slot"
            : "Launch your product"}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function FrontPage({
  weeks,
  board,
  lastWeek,
  space = {},
}: {
  weeks: Week[];
  // Approved launches for each week, keyed "year-week": Premium first, then by votes
  board: Record<string, Product[]>;
  lastWeek: { week?: Week; products: Product[] };
  // Spots still open per week, keyed "year-week"
  space?: Record<string, WeekSpace>;
}) {
  const currentIndex = weeks.findIndex((w) => w.current);
  const [index, setIndex] = useState(currentIndex);
  const selected = weeks[index];
  const isCurrent = index === currentIndex;
  const isFuture = index > currentIndex;
  const products = board[weekKey(selected)] ?? [];
  const boosted = products.find((p) => p.boosted);
  const [lead, ...rest] = products;
  const runnersUp = rest.slice(0, 2);
  // Past weeks are closed anyway, so only this week and later get a stamp
  const weekSpace = isCurrent || isFuture ? space[weekKey(selected)] : undefined;
  const soldOut = weekSpace?.left === 0;
  const chart = rest.slice(2);
  const ranks = voteRanks(products);

  return (
    <div className="text-ink">
      {/* Edition bar: which week, and how long voting has left */}
      <div className="flex items-center justify-between gap-3 border-b border-ink py-2.5 font-sans text-xs sm:text-[13px]">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex shrink-0 items-center gap-1 font-semibold hover:text-press disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Earlier edition</span>
        </button>
        <p className="min-w-0 flex-1 text-center">
          <span className="font-bold uppercase tracking-[0.12em]">
            Week {selected.number} edition
          </span>
          <span className="text-ink-soft">
            {" "}
            · {selected.label}, {selected.year}
            {!isFuture && ` · ${products.length} launches`}
          </span>
          {isCurrent && (
            <span className="text-ink-soft">
              {" "}
              · <VotingClock week={selected.number} />
            </span>
          )}
          {!isCurrent && !isFuture && (
            <span className="text-ink-soft"> · Final results</span>
          )}
        </p>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(weeks.length - 1, i + 1))}
          disabled={index === weeks.length - 1}
          className="flex shrink-0 items-center gap-1 font-semibold hover:text-press disabled:opacity-30"
        >
          <span className="hidden sm:inline">
            {index >= currentIndex ? "Upcoming edition" : "Later edition"}
          </span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      <SpaceNotice week={selected} space={weekSpace} />

      {isFuture || !lead ? (
        <div className="grid-cols-[minmax(0,1fr)] mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <EmptyEdition
            week={selected}
            future={isFuture}
            current={isCurrent}
            soldOut={soldOut}
          />
          <div className="flex flex-col gap-8">
            <SidebarAds />
            <LastWeek {...lastWeek} />
            <NextEdition />
          </div>
        </div>
      ) : (
        <div className="grid-cols-[minmax(0,1fr)] mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid-cols-[minmax(0,1fr)] grid min-w-0 gap-x-10 gap-y-12 xl:grid-cols-[minmax(0,1fr)_280px]">
            <LeadStory
              product={lead}
              rank={ranks.get(lead.slug) ?? null}
              current={isCurrent}
              soldOut={soldOut}
            />
            {runnersUp.length > 0 && (
              <div className="divide-y divide-rule border-t-2 border-ink pt-5 xl:border-l xl:border-t-0 xl:border-ink/40 xl:pl-8 xl:pt-0">
                {runnersUp.map((p) => (
                  <SideStory
                    key={p.slug}
                    product={p}
                    rank={ranks.get(p.slug) ?? null}
                  />
                ))}
              </div>
            )}
            <div className="xl:col-span-2">
              <CenterAd product={boosted} />
            </div>
            {chart.length > 0 && (
              <div className="xl:col-span-2">
                <FullChart products={chart} ranks={ranks} />
              </div>
            )}
          </div>

          <div className="lg:border-l lg:border-ink/40 lg:pl-8">
            <div className="flex flex-col gap-10 lg:sticky lg:top-6">
            <SidebarAds />
            <LastWeek {...lastWeek} />
            <NextEdition />
            <Classifieds />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
