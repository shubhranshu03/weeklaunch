import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  MessageSquare,
  Star,
  Triangle,
} from "lucide-react";
import { AskAI } from "@/components/AskAI";
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
import {
  getAllProducts,
  getComments,
  getProduct,
  getUpcomingLaunch,
} from "@/lib/products";
import { weekLabel, weekStart } from "@/lib/weeks";

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
  if (!product) {
    // Not live yet: a "coming soon" page that shows the maker's share card
    const upcoming = await getUpcomingLaunch(slug);
    if (!upcoming) return {};
    const title = `${upcoming.name} is launching on WeekLaunch`;
    const card = `/share/${upcoming.slug}`;
    return {
      title,
      description: upcoming.tagline,
      robots: { index: false, follow: true },
      openGraph: { title, description: upcoming.tagline, images: [card] },
      twitter: { card: "summary_large_image", title, images: [card] },
    };
  }
  const url = `/products/${product.slug}`;
  // Under ~160 characters: the tagline, then the start of the maker's own description
  const lead = `${product.name}: ${product.tagline}.`;
  const more = product.description.replace(/\s+/g, " ").trim();
  const description =
    more && lead.length < 120
      ? `${lead} ${more.slice(0, 157 - lead.length).replace(/\s+\S*$/, "")}…`
      : `${lead} Launched on WeekLaunch in ${product.tags.join(", ")}.`;
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
      publishedTime: weekStart(product.week).toISOString(),
    },
    keywords: [product.name, ...product.tags, `${product.name} alternatives`],
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
  if (!product) {
    const upcoming = await getUpcomingLaunch(slug);
    if (!upcoming) notFound();
    return <ComingSoon launch={upcoming} />;
  }

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
  const launched = weekStart(product.week);
  const launchedOn = launched.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const host = product.website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": pageUrl,
              url: pageUrl,
              name: `${product.name} on WeekLaunch`,
              description: product.tagline,
              datePublished: launched.toISOString(),
              isPartOf: { "@id": `${SITE_URL}/#website` },
              about: { "@id": `${pageUrl}#product` },
              breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
            },
            {
              "@type": "SoftwareApplication",
              "@id": `${pageUrl}#product`,
              name: product.name,
              headline: product.tagline,
              description: product.description || product.tagline,
              url: product.website,
              image: product.logo.url ?? `${pageUrl}/opengraph-image`,
              ...(product.screenshots.length > 0 && {
                screenshot: product.screenshots,
              }),
              applicationCategory: "BusinessApplication",
              applicationSubCategory: product.tags[0],
              operatingSystem: "Web",
              keywords: product.tags.join(", "),
              datePublished: launched.toISOString(),
              creator: { "@type": "Person", name: product.maker.name },
              ...(product.highlights.length > 0 && {
                featureList: product.highlights,
              }),
              ...(product.rating &&
                product.rating.count > 0 && {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.rating.score,
                    ratingCount: product.rating.count,
                  },
                }),
              mainEntityOfPage: pageUrl,
            },
            ...(product.faqs.length > 0
              ? [
                  {
                    "@type": "FAQPage",
                    "@id": `${pageUrl}#faq`,
                    mainEntity: product.faqs.map((f) => ({
                      "@type": "Question",
                      name: f.q,
                      acceptedAnswer: { "@type": "Answer", text: f.a },
                    })),
                  },
                ]
              : []),
            {
              "@type": "BreadcrumbList",
              "@id": `${pageUrl}#breadcrumb`,
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
            <UpvoteButton
              productId={product.id}
              count={product.upvotes}
              week={product.week}
            />
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
              {weekLabel(product.week)}, {product.year}) and is listed under{" "}
              {product.tags.join(", ")}.
            </p>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Maker</h2>
          {/* Opens the maker's public profile when they have an account */}
          <MakerLink
            handle={product.maker.handle}
            className="group mt-3 flex items-center gap-3 rounded-2xl"
          >
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
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                {product.maker.name}
                {product.maker.verified && (
                  <BadgeCheck
                    className="size-4 fill-sky-500 text-white"
                    aria-label="Verified maker"
                  />
                )}
              </p>
              <p className="text-xs text-slate-500">
                {product.maker.handle
                  ? `@${product.maker.handle} · View profile`
                  : `Maker of ${product.name}`}
              </p>
            </div>
          </MakerLink>
        </section>
      </div>

      {/* Short, plain facts: easy for people to skim and for AI search to quote */}
      <section
        aria-labelledby="facts-title"
        className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <h2 id="facts-title" className="font-semibold text-slate-900">
          {product.name} at a glance
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["What it is", product.tagline],
            ["Category", product.tags.join(", ")],
            ["Made by", product.maker.name],
            ["Website", host],
            ["Launched on WeekLaunch", `Week ${product.week}, ${launchedOn}`],
            [
              "Community",
              `${product.upvotes} upvotes · ${product.comments} comments`,
            ],
          ].map(([term, detail]) => (
            <div key={term} className="min-w-0">
              <dt className="text-xs font-medium text-slate-400">{term}</dt>
              <dd className="mt-0.5 break-words text-slate-700">
                {term === "Website" ? (
                  <a
                    href={product.website}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {detail}
                  </a>
                ) : term === "Made by" && product.maker.handle ? (
                  <Link
                    href={`/makers/${product.maker.handle}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {detail}
                  </Link>
                ) : (
                  detail
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {product.highlights.length > 0 && (
        <section
          aria-labelledby="why-title"
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <h2 id="why-title" className="font-semibold text-slate-900">
            Why choose {product.name}?
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-2.5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.faqs.length > 0 && (
        <section
          aria-labelledby="faq-title"
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <h2 id="faq-title" className="font-semibold text-slate-900">
            {product.name} FAQ
          </h2>
          <div className="mt-2 divide-y divide-slate-100">
            {product.faqs.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="mt-4">
        <AskAI
          subject={product.name}
          prompt={`What is ${product.name} (${product.website})? It's described as: "${product.tagline}". Who is it for, what are its main features, and what are good alternatives? It launched on WeekLaunch: ${pageUrl}`}
        />
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

function MakerLink({
  handle,
  className,
  children,
}: {
  handle?: string;
  className: string;
  children: React.ReactNode;
}) {
  return handle ? (
    <Link href={`/makers/${handle}`} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

// Shown at a launch's link before its week starts, so shared links never 404
function ComingSoon({
  launch,
}: {
  launch: NonNullable<Awaited<ReturnType<typeof getUpcomingLaunch>>>;
}) {
  const date = weekStart(launch.week).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="bg-gradient-to-br from-brand-500 to-indigo-600 px-6 py-10 text-center text-white sm:py-14">
        <div className="mx-auto w-fit">
          <ProductLogo logo={launch.logo} name={launch.name} size="lg" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {launch.name}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-white/80">{launch.tagline}</p>
        <span className="badge-pop mt-6 inline-flex items-center gap-1.5 rounded-md bg-amber-300 px-3 py-1 text-sm font-bold text-slate-900">
          <CalendarDays className="size-4" />
          Launching {date} · Week {launch.week}
        </span>
      </div>
      <div className="p-6 text-center">
        <p className="text-sm text-slate-600">
          {launch.maker.name} is launching {launch.name} on WeekLaunch. Come
          back on launch day to upvote it and leave a comment.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="btn-pop flex h-11 items-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
          >
            See this week&apos;s launches
          </Link>
          {launch.maker.handle && (
            <Link
              href={`/makers/${launch.maker.handle}`}
              className="btn-pop flex h-11 items-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-900"
            >
              About the maker
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
