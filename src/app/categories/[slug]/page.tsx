import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryView } from "@/components/CategoryView";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { JsonLd } from "@/components/JsonLd";
import {
  categoryBySlug,
  categoryHref,
  categoryNoun,
  categorySlug,
  inCategory,
} from "@/lib/categories";
import { productCategories } from "@/lib/data";
import { getHomeFeed } from "@/lib/feed";
import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return productCategories.map((c) => ({ slug: categorySlug(c.name) }));
}

const introFor = (name: string) =>
  `Explore the top ${categoryNoun(name)} launched by indie makers and startups. Compare them, read what the community says, and find the best ones, ranked by upvotes on IndieShip.`;

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const c = categoryBySlug((await params).slug);
  if (!c) return {};
  return {
    title: `Best ${categoryNoun(c.name)} from indie makers`,
    description: introFor(c.name),
    alternates: { canonical: categoryHref(c.name) },
  };
}

export default function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
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
}: Pick<PageProps<"/categories/[slug]">, "params">) {
  const c = categoryBySlug((await params).slug);
  if (!c) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${SITE_URL}${categoryHref(c.name)}`,
          name: `${c.name} on IndieShip`,
          description: introFor(c.name),
          breadcrumb: {
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
                name: "Categories",
                item: `${SITE_URL}/categories`,
              },
              { "@type": "ListItem", position: 3, name: c.name },
            ],
          },
        }}
      />
      <BrowseShell>
        <Category name={c.name} />
      </BrowseShell>
    </>
  );
}

async function Category({ name }: { name: string }) {
  const [all, feed] = await Promise.all([getAllProducts(), getHomeFeed()]);
  const products = inCategory(all, name);
  const today = feed.today;
  return (
    <CategoryView
      name={name}
      intro={introFor(name)}
      noun={categoryNoun(name)}
      products={products}
      awards={feed.awards}
      today={feed.today}
      signals={{
        launches: products.length,
        newThisMonth: products.filter((p) => today - p.day < 30).length,
        upvotes: products.reduce((n, p) => n + p.upvotes, 0),
        reviews: products.reduce((n, p) => n + (p.rating?.count ?? 0), 0),
        deals: products.filter((p) => p.deal).length,
      }}
    />
  );
}
