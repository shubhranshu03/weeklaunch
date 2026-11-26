import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Shuffle } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { ProductLogo } from "@/components/ProductRow";
import { alternativesHref, alternativesTo } from "@/lib/alternatives";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Alternatives to popular tools, from indie makers",
  description:
    "Find indie alternatives to the products you use. Every launch on IndieShip has a page of similar products, ranked by the community.",
  alternates: { canonical: "/alternatives" },
};

export default function AlternativesIndex() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>
          <List />
        </BrowseShell>
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

async function List() {
  const all = await getAllProducts();
  const products = [...all]
    .filter((p) => alternativesTo(p, all, 1).length > 0)
    .sort((a, b) => b.upvotes - a.upvotes);
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-9 text-center sm:px-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <Shuffle className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Alternatives
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
          Looking for something like a tool you know? Pick a product to see
          similar launches from indie makers.
        </p>
      </section>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              href={alternativesHref(p.slug)}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-lg"
            >
              <ProductLogo logo={p.logo} name={p.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                  {p.name} alternatives
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {p.tags[0]}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
