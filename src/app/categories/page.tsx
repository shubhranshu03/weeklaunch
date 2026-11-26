import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FolderOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { JsonLd } from "@/components/JsonLd";
import { categoryHref, categoryNoun, inCategory } from "@/lib/categories";
import { productCategories } from "@/lib/data";
import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Browse categories: AI, productivity, developer tools and more",
  description:
    "Discover new products from indie makers by category, from AI tools to design and finance. Each category is ranked by the community, so the most useful launches come first.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${SITE_URL}/categories`,
          name: "Browse categories on IndieShip",
          hasPart: productCategories.map((c) => ({
            "@type": "CollectionPage",
            name: c.name,
            url: `${SITE_URL}${categoryHref(c.name)}`,
          })),
        }}
      />
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>
          <Categories />
        </BrowseShell>
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

async function Categories() {
  const products = await getAllProducts();
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-9 text-center sm:px-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <FolderOpen className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Browse categories
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
          Find new products from indie makers, from{" "}
          <strong className="text-slate-900">AI tools</strong> to{" "}
          <strong className="text-slate-900">design</strong> and{" "}
          <strong className="text-slate-900">finance</strong>. Every category is
          ranked by the community, so the most useful launches come first.
        </p>
      </section>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {productCategories.map((c) => {
          const count = inCategory(products, c.name).length;
          return (
            <li key={c.name}>
              <Link
                href={categoryHref(c.name)}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                    {c.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                    {count}
                  </span>
                </span>
                <span className="mt-2 text-sm leading-snug text-slate-500">
                  {c.blurb}. Explore {categoryNoun(c.name)}.
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
