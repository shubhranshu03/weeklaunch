import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { toolIcons } from "@/components/ToolLayout";
import { SITE_URL } from "@/lib/site";
import { toolHref, tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free tools for founders and indie makers",
  description:
    "Free tools for founders: startup name generator, tagline generator, launch copy checker, launch date planner, launch checklist and meta tag generator.",
  alternates: { canonical: "/tools" },
};

const faqs = [
  {
    q: "Are these tools really free?",
    a: "Yes. Every tool is 100% free with no sign-up, no trial and no limits. You don't need a WeekLaunch account to use them.",
  },
  {
    q: "Do you save what I type into the tools?",
    a: "No. The tools run in your browser, so what you type isn't sent to our servers. The launch checklist only saves your ticks on your own device so you can come back later.",
  },
  {
    q: "Which tool should I use first?",
    a: "Start with the launch checklist to plan everything, write your one-liner with the tagline generator, then check your page title and share image with the meta tag generator.",
  },
  {
    q: "Can I use these tools for products I don't launch on WeekLaunch?",
    a: "Of course. They work for any product, website or side project, wherever you plan to launch.",
  },
  {
    q: "Do the tools work on my phone?",
    a: "Yes. Every tool works on phones, tablets and desktop browsers.",
  },
  {
    q: "Will you add more free tools?",
    a: "Yes, we add new tools for founders over time. If there's a tool you'd like to see, tell us on the contact page.",
  },
];

export default function ToolsPage() {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
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
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
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

      <section aria-labelledby="tools-faq" className="mt-10">
        <h2
          id="tools-faq"
          className="mb-3 text-xl font-semibold text-slate-900"
        >
          Frequently asked questions
        </h2>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {f.a}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Ready to launch?{" "}
          <Link
            href="/submit"
            className="font-semibold text-brand-700 underline"
          >
            Submit your product for free
          </Link>
          .
        </p>
      </section>
    </SiteShell>
  );
}
