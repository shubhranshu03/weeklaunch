import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Shuffle } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { bestAward, LaunchRow } from "@/components/home/LaunchRow";
import { JsonLd } from "@/components/JsonLd";
import { ProductLogo } from "@/components/ProductRow";
import { alternativesHref, alternativesTo } from "@/lib/alternatives";
import { categoryHref } from "@/lib/categories";
import { getHomeFeed } from "@/lib/feed";
import { getAllProducts, getProduct } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getAllProducts();
  // Cache Components needs at least one; unknown products show the 404 page
  return products.length
    ? products.map((p) => ({ slug: p.slug }))
    : [{ slug: "tidylane" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/alternatives/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `Best ${product.name} alternatives`,
    description: `Looking for an alternative to ${product.name}? Compare similar ${product.tags[0] ?? ""} products launched by indie makers, ranked by the IndieShip community.`,
    alternates: { canonical: alternativesHref(product.slug) },
    ...(product.sample && { robots: { index: false } }),
  };
}

export default function AlternativesPage({
  params,
}: PageProps<"/alternatives/[slug]">) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BrowseShellFallback />}>
        <Page params={params} />
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

// Reads the address inside Suspense, so the frame can show instantly
async function Page({
  params,
}: Pick<PageProps<"/alternatives/[slug]">, "params">) {
  const [product, all, feed] = await Promise.all([
    params.then((p) => getProduct(p.slug)),
    getAllProducts(),
    getHomeFeed(),
  ]);
  if (!product) notFound();
  const alternatives = alternativesTo(product, all);
  const main = product.tags[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${product.name} alternatives`,
          url: `${SITE_URL}${alternativesHref(product.slug)}`,
          itemListElement: alternatives.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/products/${p.slug}`,
            name: p.name,
          })),
        }}
      />
      <BrowseShell>
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-7 sm:px-10">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/alternatives" className="hover:text-slate-900">
              Alternatives
            </Link>{" "}
            / <span className="text-slate-700">{product.name}</span>
          </nav>
          <div className="mt-5 flex flex-col items-center text-center">
            <span className="[&>*]:!size-14 [&>*]:!rounded-2xl">
              <ProductLogo logo={product.logo} name={product.name} size="sm" />
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Best {product.name} alternatives
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-slate-600">
              {product.name} is {product.tagline.charAt(0).toLowerCase()}
              {product.tagline.slice(1).replace(/\.$/, "")}. Looking for
              something similar? Here are{" "}
              {alternatives.length === 1
                ? "one alternative"
                : `${alternatives.length} alternatives`}{" "}
              launched on IndieShip
              {main ? ` in ${main} and related categories` : ""}, ranked by the
              community.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
              >
                See {product.name} <ArrowRight className="size-4" />
              </Link>
              {main && (
                <Link
                  href={categoryHref(main)}
                  className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  All {main}
                </Link>
              )}
            </div>
          </div>
        </section>

        {alternatives.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Shuffle className="size-6 text-brand-600" />
            <p className="mt-3 font-semibold text-slate-900">
              No alternatives yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Nothing similar has launched on IndieShip yet.
            </p>
          </div>
        ) : (
          <section className="mt-8">
            <h2 className="border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-900">
              {product.name} alternatives
            </h2>
            <ol className="mt-4 space-y-3">
              {alternatives.map((p, i) => (
                <LaunchRow
                  key={p.slug}
                  product={p}
                  rank={i + 1}
                  award={bestAward(feed.awards[p.slug])}
                  showDay
                />
              ))}
            </ol>
          </section>
        )}
      </BrowseShell>
    </>
  );
}
