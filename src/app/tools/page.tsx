import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { toolIcons } from "@/components/ToolLayout";
import { SITE_URL } from "@/lib/site";
import { toolHref, tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free tools for founders and indie makers",
  description:
    "Free tools to prepare your product launch: a launch checklist, a tagline generator, a meta tag generator with Google and social previews, and launch badges.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Free tools for founders",
          url: `${SITE_URL}/tools`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: tools.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}${toolHref(t)}`,
              name: t.name,
            })),
          },
        }}
      />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/15" />
        <span className="badge-pop relative inline-block rounded-md bg-amber-300 px-2 py-0.5 text-xs font-bold text-slate-900">
          100% free · No sign-up
        </span>
        <h1 className="relative mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Free tools for founders
        </h1>
        <p className="relative mt-2 max-w-xl text-white/80">
          Everything you need to get your product ready for launch day — from
          your tagline to how your links look when people share them.
        </p>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {tools.map((t) => {
          const Icon = toolIcons[t.icon];
          return (
            <li key={t.slug}>
              <Link
                href={toolHref(t)}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-[0_8px_30px_-12px_rgb(15_23_42/0.18)]"
              >
                <span className="badge-pop flex size-12 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
                  <Icon className="size-6" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                  {t.name}
                </h2>
                <p className="mt-1 flex-1 text-sm text-slate-500">
                  {t.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  Open tool
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </SiteShell>
  );
}
