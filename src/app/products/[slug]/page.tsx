import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  MessageSquare,
  Star,
  Triangle,
} from "lucide-react";
import { Comments } from "@/components/Comments";
import { BadgePreview, CopyCode } from "@/components/LaunchBadge";
import { badgeCode } from "@/lib/badge";
import { ProductLogo, ProductRow, UpvoteButton } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { allProducts, getProduct, launchInfo, weeks } from "@/lib/data";

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.tagline} | WeekLaunch`,
    description: product.tagline,
  };
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  // The frame shows instantly; the product streams in
  return (
    <SiteShell>
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        All products
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </SiteShell>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden className="mt-4 space-y-4">
      <div className="h-56 animate-pulse rounded-3xl bg-slate-200/60" />
      <div className="h-48 animate-pulse rounded-3xl bg-slate-200/60" />
    </div>
  );
}

async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const info = launchInfo(product);
  const week = weeks.find((w) => w.number === info.week);
  const related = allProducts
    .filter((p) => p.slug !== product.slug && p.tags[0] === product.tags[0])
    .slice(0, 3);

  const stats = [
    { icon: Triangle, label: "Upvotes", value: product.upvotes },
    { icon: MessageSquare, label: "Comments", value: product.comments },
    {
      icon: Star,
      label: "Rating",
      value: product.rating ? product.rating.score.toFixed(1) : "New",
    },
    { icon: CalendarDays, label: "Launched", value: `Week ${info.week}` },
  ];

  return (
    <>
      {/* Header */}
      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ProductLogo logo={product.logo} name={product.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              {product.name}
              {product.verified && (
                <BadgeCheck
                  className="size-5 fill-brand-500 text-white"
                  aria-label="Verified"
                />
              )}
              {product.premium && (
                <span className="badge-pop rounded-md bg-amber-300 px-1.5 py-px text-[11px] font-bold uppercase text-slate-900">
                  Featured
                </span>
              )}
            </h1>
            <p className="mt-1 text-slate-500">{product.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  #{t.toLowerCase().replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <a
              href={info.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop flex h-11 items-center gap-1.5 rounded-xl bg-amber-300 px-4 text-sm font-bold text-slate-900 hover:bg-amber-200"
            >
              Visit website <ArrowUpRight className="size-4" />
            </a>
            <UpvoteButton count={product.upvotes} />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                <s.icon className="size-3" />
                {s.label}
              </dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Screenshots (placeholders until makers upload real ones) */}
      <div
        aria-hidden
        className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex aspect-[16/10] w-[85%] shrink-0 snap-start items-center justify-center rounded-3xl border border-slate-200 sm:w-[60%]"
            style={{
              backgroundImage: `linear-gradient(${135 + i * 40}deg, ${product.logo.from}22, ${product.logo.to}44)`,
            }}
          >
            <span
              className="text-6xl font-bold opacity-30"
              style={{ color: product.logo.to }}
            >
              {product.logo.glyph}
            </span>
          </div>
        ))}
      </div>

      {/* About + maker */}
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">About {product.name}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              {product.name} —{" "}
              {product.tagline[0].toLowerCase() + product.tagline.slice(1)}. It
              was built for makers and teams who want to save time and skip the
              busywork.
            </p>
            <p>
              It launched on WeekLaunch in Week {info.week}
              {week ? ` (${week.label}, ${week.year})` : ""} and is listed under{" "}
              {product.tags.join(", ")}.
            </p>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Maker</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 font-bold text-slate-900">
              {info.maker[0]}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {info.maker}
              </p>
              <p className="text-xs text-slate-500">Maker of {product.name}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Badge */}
      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Launch badge</h2>
            <p className="mt-1 text-sm text-slate-500">
              Maker? Add this to your website to show off your launch.
            </p>
          </div>
          <BadgePreview week={info.week} />
        </div>
        <div className="mt-4">
          <CopyCode code={badgeCode(product.slug, "light")} />
        </div>
      </section>

      <div className="mt-4">
        <Comments maker={info.maker} />
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            More in {product.tags[0]}
          </h2>
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {related.map((p, i) => (
              <ProductRow key={p.slug} product={p} rank={i + 4} />
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
