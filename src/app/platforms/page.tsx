import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MonitorSmartphone } from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  BrowseShell,
  BrowseShellFallback,
} from "@/components/home/BrowseShell";
import { JsonLd } from "@/components/JsonLd";
import { onPlatform, platformHref, platformPages } from "@/lib/platformPages";
import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Browse by platform: web apps, Mac, iOS, Android and more",
  description:
    "New web apps, Mac and iOS apps, Android apps and Chrome extensions from indie makers, ranked by the community.",
  alternates: { canonical: "/platforms" },
};

export default function PlatformsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: `${SITE_URL}/platforms`,
          name: "Browse by platform on IndieShip",
          hasPart: platformPages.map((p) => ({
            "@type": "CollectionPage",
            name: p.name,
            url: `${SITE_URL}${platformHref(p)}`,
          })),
        }}
      />
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>
          <Platforms />
        </BrowseShell>
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

async function Platforms() {
  const products = await getAllProducts();
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-brand-50/80 to-white px-5 py-9 text-center sm:px-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
          <MonitorSmartphone className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Browse by platform
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
          Find new <strong className="text-slate-900">web apps</strong>,{" "}
          <strong className="text-slate-900">Mac and iOS apps</strong> and{" "}
          <strong className="text-slate-900">Chrome extensions</strong> from
          indie makers, ranked by the community.
        </p>
      </section>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {platformPages.map((p) => (
          <li key={p.slug}>
            <Link
              href={platformHref(p)}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                  {p.name}
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                  {onPlatform(products, p.id).length}
                </span>
              </span>
              <span className="mt-2 text-sm text-slate-500">
                Explore new {p.noun}.
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
