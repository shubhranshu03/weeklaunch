import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Medal, Trophy } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { ProductLogo } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { awardTitle, getHallOfFame, type FameEntry } from "@/lib/feed";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hall of Fame: Products of the Day, Week and Month",
  description:
    "Every Product of the Day, Week and Month on IndieShip: the indie launches the community voted to the top.",
  alternates: { canonical: "/hall-of-fame" },
};

const medal = {
  1: "bg-amber-100 text-amber-800",
  2: "bg-slate-100 text-slate-700",
  3: "bg-orange-100 text-orange-800",
} as const;

export default function HallOfFamePage() {
  return (
    <SiteShell sidebars={false}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center sm:p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Trophy className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
          Hall of Fame
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-500">
          The top three launches of every day, week and month, decided by the
          community&apos;s votes once each period ends.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="mt-6 h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Winners />
      </Suspense>
    </SiteShell>
  );
}

async function Winners() {
  const fame = await getHallOfFame();
  const sections = [
    { title: "Products of the Month", entries: fame.month },
    { title: "Products of the Week", entries: fame.week },
    { title: "Products of the Day", entries: fame.day.slice(0, 90) },
  ];
  const all = [...fame.month, ...fame.week, ...fame.day];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "IndieShip Hall of Fame",
          url: `${SITE_URL}/hall-of-fame`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: all.length,
            itemListElement: all.slice(0, 50).map((e, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/products/${e.product.slug}`,
              name: `${e.product.name}: ${awardTitle(e.award)}, ${e.award.label}`,
            })),
          },
        }}
      />
      {all.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
          The first winners appear here when the first launch day ends.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {sections
            .filter((s) => s.entries.length > 0)
            .map((s) => (
              <section
                key={s.title}
                id={s.title.split(" ").pop()?.toLowerCase()}
                className="scroll-mt-20"
              >
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {s.title}
                </h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {groups(s.entries).map((g) => (
                    <div
                      key={g.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {g.label}
                      </p>
                      <ol className="mt-2 space-y-1">
                        {g.entries.map((e) => (
                          <li key={e.product.slug}>
                            <Link
                              href={`/products/${e.product.slug}`}
                              className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50"
                            >
                              <span
                                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${medal[e.award.rank]}`}
                              >
                                <Medal className="sr-only" />#{e.award.rank}
                              </span>
                              <ProductLogo
                                logo={e.product.logo}
                                name={e.product.name}
                                size="sm"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-slate-900">
                                  {e.product.name}
                                </span>
                                <span className="block truncate text-xs text-slate-500">
                                  {e.product.tagline}
                                </span>
                              </span>
                              <span className="text-xs font-semibold tabular-nums text-slate-500">
                                ▲ {e.product.upvotes}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}

// One card per period (a day, week or month), its winners in order
function groups(entries: FameEntry[]) {
  const map = new Map<string, FameEntry[]>();
  for (const e of entries)
    map.set(e.award.label, [...(map.get(e.award.label) ?? []), e]);
  return [...map].map(([label, list]) => ({ label, entries: list }));
}
