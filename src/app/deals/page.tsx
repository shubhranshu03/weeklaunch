import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Tag } from "lucide-react";
import { DealCode } from "@/components/DealCode";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { JsonLd } from "@/components/JsonLd";
import { ProductLogo } from "@/components/ProductRow";
import { dealLabel } from "@/lib/deals";
import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deals and discount codes from indie makers",
  description:
    "Coupon codes and discounts on new products from indie makers, for IndieShip visitors. Copy a code and save on AI tools, productivity apps, developer tools and more.",
  alternates: { canonical: "/deals" },
};

export default function DealsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${SITE_URL}/deals`,
          name: "Deals on IndieShip",
        }}
      />
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>
          <Deals />
        </BrowseShell>
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

async function Deals() {
  const deals = (await getAllProducts())
    .filter((p) => p.deal)
    .sort(
      (a, b) =>
        (b.deal?.percent ?? 0) - (a.deal?.percent ?? 0) ||
        b.upvotes - a.upvotes,
    );
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-emerald-500/10 to-white px-5 py-9 text-center sm:px-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <Tag className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Deals
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
          Discounts from indie makers, just for IndieShip visitors. Copy a code
          and use it on the product&apos;s site.
        </p>
      </section>

      {deals.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Tag className="size-6 text-emerald-600" />
          <p className="mt-3 font-semibold text-slate-900">No deals yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Makers can add a discount code when they launch, or later from My
            launches. It shows here and on their launch card.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Launch with a deal <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {deals.map((p) => (
            <li
              key={p.slug}
              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <span className="[&>*]:!size-10 [&>*]:!rounded-lg [&>*]:!text-sm">
                  <ProductLogo logo={p.logo} name={p.name} size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="block truncate font-semibold text-slate-900 after:absolute after:inset-0 after:rounded-xl group-hover:text-brand-700"
                  >
                    {p.name}
                  </Link>
                  <p className="line-clamp-1 text-sm text-slate-600">
                    {p.deal!.text || p.tagline}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-bold text-emerald-600">
                  {dealLabel(p.deal!).replace(" OFF", "")}
                </span>
              </div>
              {p.deal!.code && (
                <div className="mt-3">
                  <DealCode code={p.deal!.code} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
