import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProductsDirectory } from "@/components/ProductsDirectory";
import { SiteShell } from "@/components/SiteShell";
import { allProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All products by category — AI, SaaS, dev tools",
  description:
    "Browse every product launched on WeekLaunch, grouped by category: AI, productivity, developer tools, design, marketing, analytics, finance and social media.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All products on WeekLaunch",
          url: `${SITE_URL}/products`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: allProducts.length,
            itemListElement: allProducts.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/products/${p.slug}`,
              name: p.name,
            })),
          },
        }}
      />
      <ProductsDirectory />
    </SiteShell>
  );
}
