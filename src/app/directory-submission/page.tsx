import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Ban,
  Bot,
  Check,
  MousePointerClick,
  RotateCcw,
  ShieldCheck,
  X,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  Send,
  TrendingUp,
} from "lucide-react";
import { DirectoryOrderForm } from "@/components/DirectoryOrderForm";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { getCurrentUser } from "@/lib/auth";
import {
  directoryFaqs,
  directoryPackages,
  directoryTiers,
} from "@/lib/directories";
import { getMakerLaunches } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Directory submission service — 30, 50 or 100+ sites from $49",
  description:
    "We submit your SaaS or AI product to 30, 50 or 100+ launch and software directories for you, strongest sites first, to grow your backlinks and domain rating. From $49.",
  alternates: { canonical: "/directory-submission" },
};

const steps = [
  {
    icon: ClipboardList,
    title: "Tell us about your product",
    text: "Name, website, tagline and a short description. Takes 2 minutes.",
  },
  {
    icon: Send,
    title: "We submit it for you",
    text: "We write each listing and submit to every directory in your package, strongest first.",
  },
  {
    icon: FileCheck2,
    title: "Get your report",
    text: "A list of every directory with a link to your live listing.",
  },
];

const trust = [
  { icon: ShieldCheck, text: "Submitted by hand, never by bots" },
  { icon: Ban, text: "No spam sites or link farms" },
  { icon: FileCheck2, text: "Report with every live link" },
  { icon: RotateCcw, text: "Full refund before we start" },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Raise your domain rating",
    text: "Links from trusted directories are one of the strongest signals Google uses. More of them means a higher DR, and a higher DR makes every page on your site easier to rank.",
  },
  {
    icon: Bot,
    title: "Show up in AI answers",
    text: "ChatGPT, Claude, Perplexity and Google's AI read these directories when people ask for tools. Being listed on many of them makes you far more likely to be recommended.",
  },
  {
    icon: MousePointerClick,
    title: "Get real visitors",
    text: "People browse directories looking for new tools to try. Every listing is a small, steady source of visitors and signups that keeps working for years.",
  },
];

// Doing it yourself vs. ordering a package
const comparison: [string, string, string][] = [
  ["Your time", "Days of copy-pasting into forms", "2 minutes"],
  [
    "Finding the right sites",
    "Hours of research, many dead sites",
    "Our list, strongest first",
  ],
  ["Writing each listing", "Rewrite it for every site", "Written for you"],
  ["Keeping track", "A messy spreadsheet", "A clean report of live links"],
  ["Cost", "Your time, which is worth more", "From $49, once"],
];

const sampleReport = [
  ["Product Hunt", "Live"],
  ["G2", "Live"],
  ["AlternativeTo", "Live"],
  ["BetaList", "In review"],
  ["SaaSHub", "Live"],
];

const audience = [
  "You just launched and nobody has heard of you yet",
  "Your site has a low domain rating and doesn't rank on Google",
  "You want ChatGPT and other AI tools to recommend your product",
  "You'd rather build your product than fill in 100 forms",
];

const total = directoryTiers.reduce((n, t) => n + t.directories.length, 0);

export default function DirectorySubmissionPage() {
  const url = `${SITE_URL}/directory-submission`;
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${url}#service`,
              name: "Directory submission service",
              serviceType: "Directory submission",
              description: metadata.description,
              url,
              provider: { "@id": `${SITE_URL}/#organization` },
              offers: directoryPackages.map((p) => ({
                "@type": "Offer",
                name: `${p.name}: ${p.count} directories`,
                price: p.price,
                priceCurrency: "USD",
                url: `${url}#package-${p.id}`,
              })),
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: directoryFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-16 right-40 size-32 rounded-full bg-white/10" />
        <div className="relative max-w-2xl">
          <span className="badge-pop inline-flex items-center gap-1.5 rounded-md bg-amber-300 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-900">
            <TrendingUp className="size-3.5" />
            Done for you
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Get listed on 100+ directories.
            <br />
            We do the submitting.
          </h1>
          <p className="mt-3 text-white/80 sm:text-lg">
            Grow your backlinks and domain rating without spending days filling
            in forms. We submit your product to the strongest launch and
            software directories first.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="#order"
              className="btn-pop flex h-11 items-center gap-2 rounded-xl bg-amber-300 px-5 text-sm font-bold text-slate-900 hover:bg-amber-200"
            >
              Get started from $49 <ArrowRight className="size-4" />
            </a>
            <a
              href="#directories"
              className="flex h-11 items-center rounded-xl px-4 text-sm font-semibold ring-1 ring-white/40 hover:bg-white/10"
            >
              See the directories
            </a>
          </div>
        </div>
      </section>

      {/* Reasons to trust the service */}
      <ul className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {trust.map((t) => (
          <li
            key={t.text}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700"
          >
            <t.icon className="size-4 shrink-0 text-emerald-600" />
            {t.text}
          </li>
        ))}
      </ul>

      {/* Why it works */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Why directory listings work
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {benefits.map((b) => (
          <article
            key={b.title}
            className="rounded-3xl border border-slate-200 bg-white p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <b.icon className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">{b.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {b.text}
            </p>
          </article>
        ))}
      </div>

      {/* Packages */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Packages
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {directoryPackages.map((p) => (
          <article
            key={p.id}
            className={`relative flex flex-col rounded-3xl p-6 ${
              p.popular
                ? "badge-pop bg-gradient-to-br from-brand-500 to-indigo-600 text-white"
                : "border border-slate-200 bg-white"
            }`}
          >
            {p.popular && (
              <span className="badge-pop absolute -top-3 right-5 rounded-md bg-amber-300 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-900">
                Most popular
              </span>
            )}
            <h3 className="font-semibold">
              {p.name} · {p.count} directories
            </h3>
            <p
              className={`mt-1 text-sm ${p.popular ? "text-white/75" : "text-slate-500"}`}
            >
              {p.blurb}
            </p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight">
                ${p.price}
              </span>
              <span
                className={`text-sm ${p.popular ? "text-white/70" : "text-slate-500"}`}
              >
                one-time
              </span>
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                      p.popular
                        ? "bg-white text-brand-600"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span
                    className={p.popular ? "text-white/90" : "text-slate-600"}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={`#package-${p.id}`}
              className={`btn-pop mt-6 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold ${
                p.popular
                  ? "bg-amber-300 text-slate-900 hover:bg-amber-200"
                  : "bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              Choose {p.name} <ArrowRight className="size-4" />
            </a>
          </article>
        ))}
      </div>

      {/* How it works */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        How it works
      </h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="rounded-3xl border border-slate-200 bg-white p-5"
          >
            <span className="badge-pop flex size-10 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
              <s.icon className="size-5" />
            </span>
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Step {i + 1}
            </p>
            <h3 className="font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{s.text}</p>
          </li>
        ))}
      </ol>

      {/* Doing it yourself vs. ordering */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Do it yourself, or let us do it
      </h2>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 sm:text-sm">
          <span className="px-3 py-3 sm:px-5" />
          <span className="px-3 py-3 sm:px-5">On your own</span>
          <span className="px-3 py-3 text-brand-700 sm:px-5">
            With WeekLaunch
          </span>
        </div>
        {comparison.map(([row, diy, us]) => (
          <div
            key={row}
            className="grid grid-cols-[1fr_1fr_1fr] border-b border-slate-100 text-xs last:border-0 sm:text-sm"
          >
            <span className="px-3 py-3 font-semibold text-slate-900 sm:px-5">
              {row}
            </span>
            <span className="flex gap-1.5 px-3 py-3 text-slate-500 sm:px-5">
              <X className="mt-0.5 size-3.5 shrink-0 text-rose-500" />
              {diy}
            </span>
            <span className="flex gap-1.5 px-3 py-3 font-medium text-slate-800 sm:px-5">
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-emerald-600"
                strokeWidth={3}
              />
              {us}
            </span>
          </div>
        ))}
      </div>

      {/* What the report looks like, plus who it's for */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">What you get</h2>
          <p className="mt-1 text-sm text-slate-500">
            A report of every directory and the link to your listing, so you can
            see exactly where you are.
          </p>
          <div
            aria-hidden
            className="mt-4 overflow-hidden rounded-2xl border border-slate-200 text-sm"
          >
            <div className="flex justify-between bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
              <span>Directory</span>
              <span>Status</span>
            </div>
            {sampleReport.map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5"
              >
                <span className="font-medium text-slate-800">{name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    status === "Live"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-400">
              Example report
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">This is for you if…</h2>
          <ul className="mt-4 space-y-3">
            {audience.map((a) => (
              <li key={a} className="flex gap-2.5 text-sm text-slate-600">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {a}
              </li>
            ))}
          </ul>
          <a
            href="#order"
            className="btn-pop mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Start from $49 <ArrowRight className="size-4" />
          </a>
        </section>
      </div>

      {/* Directories, strongest first */}
      <section id="directories" className="scroll-mt-24">
        <h2 className="mb-1 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Where we submit
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          A sample of {total} of the 100+ directories, from the highest
          authority down.
        </p>
        <div className="space-y-4">
          {directoryTiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {tier.note}
                </span>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {tier.directories.map((d) => (
                  <li
                    key={d.domain}
                    className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- each directory's own site icon */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${d.domain}&sz=64`}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                      className="size-6 shrink-0 rounded-md bg-white"
                    />
                    <span className="truncate text-sm font-medium text-slate-800">
                      {d.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Order */}
      <section
        id="order"
        className="relative mt-10 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8"
      >
        {/* Package links scroll here and pick the package */}
        {directoryPackages.map((p) => (
          <span
            key={p.id}
            id={`package-${p.id}`}
            className="absolute -top-24"
            aria-hidden
          />
        ))}
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Order your submissions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Pay once. We start within 2 working days.
        </p>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            }
          >
            <Order />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Questions
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {directoryFaqs.map((f) => (
          <details key={f.q} className="group px-5 py-4 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.a}</p>
          </details>
        ))}
      </div>

      {/* Last nudge */}
      <section className="relative mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-6 text-center text-white sm:p-10">
        <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10" />
        <h2 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">
          Spend your time building. We&apos;ll handle the listings.
        </h2>
        <p className="relative mx-auto mt-2 max-w-lg text-white/80">
          Pick a package, tell us about your product in 2 minutes, and get a
          report of every live link.
        </p>
        <a
          href="#order"
          className="btn-pop relative mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-amber-300 px-6 text-sm font-bold text-slate-900 hover:bg-amber-200"
        >
          Get listed from $49 <ArrowRight className="size-4" />
        </a>
      </section>
    </SiteShell>
  );
}

async function Order() {
  const user = await getCurrentUser();
  if (!user)
    return (
      <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-6 py-10 text-center">
        <p className="font-semibold text-slate-900">Sign in to order</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          One click with Google. Your order and report stay in My launches.
        </p>
        <Link
          href="/signin?next=/directory-submission%23order"
          className="btn-pop mt-5 flex h-11 items-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
        >
          Continue with Google
        </Link>
      </div>
    );

  // Fill the form from the maker's latest launch
  const [latest] = await getMakerLaunches(user.id);
  return (
    <DirectoryOrderForm
      prefill={
        latest && {
          name: latest.product.name,
          website: latest.product.website,
          tagline: latest.product.tagline,
          description: latest.product.description,
        }
      }
    />
  );
}
