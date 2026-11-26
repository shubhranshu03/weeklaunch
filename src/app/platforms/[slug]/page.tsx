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
import { getHomeFeed } from "@/lib/feed";
import {
  onPlatform,
  platformBySlug,
  platformHref,
  platformPages,
} from "@/lib/platformPages";
import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return platformPages.map((p) => ({ slug: p.slug }));
}

const introFor = (noun: string) =>
  `Discover new ${noun} launched by indie makers and startups. Compare them, read what the community says, and find the best ones, ranked by upvotes on IndieShip.`;

export async function generateMetadata({
  params,
}: PageProps<"/platforms/[slug]">): Promise<Metadata> {
  const p = platformBySlug((await params).slug);
  if (!p) return {};
  return {
    title: `Best new ${p.noun} from indie makers`,
    description: introFor(p.noun),
    alternates: { canonical: platformHref(p) },
  };
}

export default function PlatformPage({
  params,
}: PageProps<"/platforms/[slug]">) {
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
}: Pick<PageProps<"/platforms/[slug]">, "params">) {
  const p = platformBySlug((await params).slug);
  if (!p) notFound();
  const [all, feed] = await Promise.all([getAllProducts(), getHomeFeed()]);
  const products = onPlatform(all, p.id);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${SITE_URL}${platformHref(p)}`,
          name: `${p.name} on IndieShip`,
          description: introFor(p.noun),
        }}
      />
      <BrowseShell>
        <CategoryView
          name={p.name}
          intro={introFor(p.noun)}
          noun={p.noun}
          parent={{ label: "Platforms", href: "/platforms" }}
          products={products}
          awards={feed.awards}
          today={feed.today}
          signals={{
            launches: products.length,
            newThisMonth: products.filter((x) => feed.today - x.day < 30)
              .length,
            upvotes: products.reduce((n, x) => n + x.upvotes, 0),
            reviews: products.reduce((n, x) => n + (x.rating?.count ?? 0), 0),
            deals: products.filter((x) => x.deal).length,
          }}
        />
      </BrowseShell>
    </>
  );
}
