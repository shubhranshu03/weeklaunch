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
import { JsonLd } from "@/components/JsonLd";
import { BadgePreview, CopyCode } from "@/components/LaunchBadge";
import { badgeCode } from "@/lib/badge";
import { SITE_URL } from "@/lib/site";
import {
  PremiumBadge,
  ProductLogo,
  ProductRow,
  UpvoteButton,
} from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { getAllProducts, getComments, getProduct } from "@/lib/products";
import { weekLabel } from "@/lib/weeks";

export async function generateStaticParams() {
  const products = await getAllProducts();
  // Cache Components needs at least one; unknown slugs show the 404 page
  return products.length
    ? products.map((p) => ({ slug: p.slug }))
    : [{ slug: "studyflow" }];
}

// Keeps "Name — tagline | WeekLaunch" within the ~60 characters Google shows
function shortTitle(name: string, tagline: string) {
  const room = 60 - " | WeekLaunch".length - name.length - " — ".length;
  if (tagline.length <= room) return `${name} — ${tagline}`;
  const cut = tagline.slice(0, room - 1);
  return `${name} — ${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const url = `/products/${product.slug}`;
  const description = `${product.name}: ${product.tagline}. Launched on WeekLaunch in ${product.tags.join(", ")}. See upvotes, comments and more.`;
  return {
    title: shortTitle(product.name, product.tagline),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: product.name,
      description,
      siteName: "WeekLaunch",
      locale: "en_US",
    },
    twitter: { title: product.name, description },
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
  const product = await getProduct(slug);
  if (!product) notFound();

  const [all, comments] = await Promise.all([
    getAllProducts(),
    getComments(product.id),
  ]);
  const related = all
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
    { icon: CalendarDays, label: "Launched", value: `Week ${product.week}` },
  ];

  const pageUrl = `${SITE_URL}/products/${product.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: product.name,
              description: product.tagline,
              url: product.website,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              keywords: product.tags.join(", "),
              mainEntityOfPage: pageUrl,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Products",
                  item: `${SITE_URL}/products`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.name,
                  item: pageUrl,
                },
              ],
            },
          ],
        }}
      />
      {/* Header */}
      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ProductLogo logo={product.logo} name={product.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              {product.name}
              {product.verified && (
                <BadgeCheck
                  className="size-5 fill-sky-500 text-white"
                  aria-label="Verified maker"
                />
              )}
              {product.premium && <PremiumBadge size="md" />}
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
              href={product.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pop flex h-11 items-center gap-1.5 rounded-xl bg-amber-300 px-4 text-sm font-bold text-slate-900 hover:bg-amber-200"
            >
              Visit website <ArrowUpRight className="size-4" />
            </a>
            <UpvoteButton productId={product.id} count={product.upvotes} />
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

      {/* Screenshots (soft placeholders when the maker added none) */}
      {product.screenshots.length > 0 ? (
        <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto">
          {product.screenshots.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- maker-uploaded screenshot from storage
            <img
              key={src}
              src={src}
              alt={`${product.name} screenshot ${i + 1}`}
              className="aspect-[16/10] w-[85%] shrink-0 snap-start rounded-3xl border border-slate-200 bg-white object-cover sm:w-[60%]"
            />
          ))}
        </div>
      ) : (
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
      )}

      {/* About + maker */}
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">About {product.name}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            {product.description
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            <p>
              It launched on WeekLaunch in Week {product.week} (
              {weekLabel(product.week)}, {product.year}) and is
              listed under {product.tags.join(", ")}.
            </p>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Maker</h2>
          <div className="mt-3 flex items-center gap-3">
            {product.maker.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- Google or uploaded profile photo
              <img
                src={product.maker.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 font-bold text-slate-900">
                {product.maker.name[0]}
              </span>
            )}
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                {product.maker.name}
                {product.maker.verified && (
                  <BadgeCheck
                    className="size-4 fill-sky-500 text-white"
                    aria-label="Verified maker"
                  />
                )}
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
          <BadgePreview week={product.week} />
        </div>
        <div className="mt-4">
          <CopyCode code={badgeCode(product.slug, "light")} />
        </div>
      </section>

      <div className="mt-4">
        <Comments
          productId={product.id}
          maker={product.maker.name}
          initial={comments}
          total={product.comments}
        />
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
