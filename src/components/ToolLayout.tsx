import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  ClipboardCheck,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Rocket,
  Sparkles,
  SquareCode,
  type LucideIcon,
} from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { toolHref, tools, type Tool } from "@/lib/tools";
import { JsonLd } from "./JsonLd";
import { SiteShell } from "./SiteShell";

export const toolIcons: Record<Tool["icon"], LucideIcon> = {
  checklist: ListChecks,
  tagline: Sparkles,
  meta: SquareCode,
  badge: BadgeCheck,
  name: Lightbulb,
  checker: ClipboardCheck,
  planner: CalendarRange,
};

export type Faq = { q: string; a: string };

// Shared page frame for every free tool: breadcrumbs, tool, guide, FAQ, related tools
export function ToolLayout({
  tool,
  intro,
  steps,
  guide,
  faqs,
  children,
}: {
  tool: Tool;
  intro: string;
  steps: string[];
  guide: React.ReactNode;
  faqs: Faq[];
  children: React.ReactNode;
}) {
  const Icon = toolIcons[tool.icon];
  const url = `${SITE_URL}/tools/${tool.slug}`;
  const related = tools.filter((t) => t.slug !== tool.slug);

  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: tool.name,
              description: tool.seoDescription,
              url,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              publisher: { "@type": "Organization", name: "WeekLaunch" },
            },
            {
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
                  name: "Free tools",
                  item: `${SITE_URL}/tools`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: tool.name,
                  item: url,
                },
              ],
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

      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <li>
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5 text-slate-300" aria-hidden />
          <li>
            <Link href="/tools" className="hover:text-slate-900">
              Free tools
            </Link>
          </li>
          <ChevronRight className="size-3.5 text-slate-300" aria-hidden />
          <li aria-current="page" className="font-medium text-slate-900">
            {tool.name}
          </li>
        </ol>
      </nav>

      <header className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-pop flex size-11 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
            <Icon className="size-5" />
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Free · No sign-up
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">{intro}</p>
      </header>

      <section aria-label={tool.name} className="mt-6">
        {children}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">
              How to use the {tool.name.toLowerCase()}
            </h2>
            <ol className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-[15px] text-slate-600">
                  <span className="badge-pop flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 first:[&_h2]:mt-0 [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-slate-600 [&_ul]:mt-2 [&_ul]:space-y-1 [&_ul]:text-[15px] [&_ul]:text-slate-600">
            {guide}
          </article>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-900">
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
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15" />
            <Rocket className="relative size-6 text-amber-300" />
            <p className="relative mt-3 font-semibold leading-snug">
              Ready to launch? Get your product in front of makers every Monday.
            </p>
            <Link
              href="/submit"
              className="btn-pop relative mt-4 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-amber-300 text-sm font-bold text-slate-900 hover:bg-amber-200"
            >
              Launch for free <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">
              More free tools
            </p>
            <ul className="mt-3 space-y-1">
              {related.map((t) => {
                const RIcon = toolIcons[t.icon];
                return (
                  <li key={t.slug}>
                    <Link
                      href={toolHref(t)}
                      className="flex items-center gap-3 rounded-xl p-2 text-sm transition hover:bg-slate-50"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <RIcon className="size-4" />
                      </span>
                      <span className="font-medium text-slate-700">
                        {t.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
