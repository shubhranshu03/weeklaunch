import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { ProductsDirectory } from "@/components/ProductsDirectory";
import { SiteShell } from "@/components/SiteShell";
import { getMacApps } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "New Mac apps from indie makers",
  description:
    "Discover new Mac apps launched by indie makers every day on IndieShip: free and paid, from the Mac App Store, direct download and Homebrew, with Apple Silicon support noted.",
  alternates: { canonical: "/products/mac" },
};

export default function MacAppsPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <MacApps />
      </Suspense>
    </SiteShell>
  );
}

async function MacApps() {
  const apps = await getMacApps();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "New Mac apps on IndieShip",
          url: `${SITE_URL}/products/mac`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: apps.length,
            itemListElement: apps.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/products/${p.slug}`,
              name: p.name,
            })),
          },
        }}
      />
      <ProductsDirectory products={apps} view="mac" />
    </>
  );
}
