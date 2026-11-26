import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AppWindow,
  ArrowRight,
  Apple,
  Globe,
  Laptop,
  Puzzle,
  Smartphone,
} from "lucide-react";
import { AiLogos } from "@/components/home/AiLogos";
import { JsonLd } from "@/components/JsonLd";
import { Masthead } from "@/components/paper/Masthead";
import { Footer } from "@/components/Footer";
import { SubmitForm } from "@/components/SubmitForm";
import { getCurrentUser } from "@/lib/auth";
import { PREMIUM_DAYS_AHEAD } from "@/lib/data";
import { daysAround, dayKey } from "@/lib/days";
import { growthProductIds, paymentsConfigured } from "@/lib/dodo";
import { freeLaunchUsed } from "@/lib/limits";
import {
  boostTakenFor,
  dayLoad,
  nextFreeDay,
  premiumLeft,
} from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Launch your product — paste your link, we draft the listing",
  description:
    "Launch on IndieShip in about 3 minutes. Paste your link, we read your site and draft your listing, you pick a free or Premium launch and check every field before it goes live.",
  alternates: { canonical: "/submit" },
};

const worksFor = [
  { icon: Globe, label: "Web apps" },
  { icon: Laptop, label: "Mac apps" },
  { icon: Apple, label: "iOS apps" },
  { icon: Smartphone, label: "Android apps" },
  { icon: Puzzle, label: "Chrome extensions" },
  { icon: AppWindow, label: "Windows apps" },
];

const howItWorks = [
  {
    title: "Paste your link",
    text: "We open your site and draft the listing for you.",
  },
  {
    title: "Choose how to launch",
    text: "Free from the queue, or Premium today with a featured spot.",
  },
  {
    title: "Check and claim",
    text: "Change anything you like. The preview updates as you type.",
  },
];

type Search = Promise<{ url?: string | string[] }>;

export default function SubmitPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: `${SITE_URL}/submit`,
          name: "Launch your product on IndieShip",
          description:
            "Paste your link and IndieShip drafts your listing. Launch free from the queue, or go Premium to launch today and be featured for a week.",
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <Masthead />
      <Suspense fallback={<Landing />}>
        <Step searchParams={searchParams} />
      </Suspense>
      <Footer cta={false} />
    </div>
  );
}

const cleanUrl = (raw: string | string[] | undefined) => {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 300) ?? "";
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

// No link yet: the paste-your-link page. With a link: sign in, then the form.
async function Step({ searchParams }: { searchParams: Search }) {
  const url = cleanUrl((await searchParams).url);
  if (!url) return <Landing />;

  const user = await getCurrentUser();
  if (!user)
    redirect(`/signin?next=${encodeURIComponent(`/submit?url=${url}`)}`);

  // Premium launches today or picks any of the next 30 days
  const upcoming = daysAround(new Date(), 0, PREMIUM_DAYS_AHEAD);
  const freeDay = (await nextFreeDay()) ?? upcoming[upcoming.length - 1];
  const shown = upcoming.some((w) => w.number === freeDay.number)
    ? upcoming
    : [...upcoming, freeDay];
  const load = await dayLoad(shown);
  return (
    <div className="mx-auto w-full max-w-[1020px] flex-1 px-4 pb-20 pt-6 sm:px-6">
      <div>
        <SubmitForm
          upcoming={upcoming}
          premiumSpots={Object.fromEntries(
            upcoming.map((w) => [w.number, premiumLeft(load[dayKey(w)])]),
          )}
          boostTaken={await boostTakenFor(shown)}
          freeWeek={freeDay}
          paymentsReady={paymentsConfigured}
          freeUsed={await freeLaunchUsed(user.id)}
          siteUrl={SITE_URL}
          initialUrl={url}
          growthPayable={
            process.env.DODO_PAYMENTS_API_KEY
              ? Object.entries(growthProductIds())
                  .filter(([, id]) => id)
                  .map(([service]) => service)
              : []
          }
        />
      </div>
    </div>
  );
}

function Landing() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50/40 to-transparent px-4 pb-14 pt-14 text-center sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Launch on IndieShip
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
          Drop your link.
          <br />
          We build the listing.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-slate-600">
          We read your site and write a listing that people and AI assistants
          can find. Nothing goes live until you&apos;ve checked every field.
        </p>

        <form
          action="/submit"
          className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-[0_0_0_1.5px_var(--color-brand-300),0_10px_30px_-12px_rgb(124_92_255/0.45)]"
        >
          <label htmlFor="launch-url" className="sr-only">
            Your product link
          </label>
          <input
            id="launch-url"
            name="url"
            required
            inputMode="url"
            autoComplete="url"
            placeholder="Website, App Store or Google Play link"
            className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Draft my listing <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          Works for
          {worksFor.map((w) => (
            <w.icon
              key={w.label}
              className="size-4 text-slate-400"
              aria-label={w.label}
            />
          ))}
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { big: "Free", small: "your first launch" },
            { big: "Daily", small: "Product of the Day awards" },
          ].map((c) => (
            <div
              key={c.big}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left"
            >
              <p className="text-2xl font-bold text-slate-900">{c.big}</p>
              <p className="text-sm text-slate-500">{c.small}</p>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
            <AiLogos />
            <p className="text-sm text-slate-500">
              Pages AI assistants can read
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <ol className="grid gap-6 sm:grid-cols-3">
          {howItWorks.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold text-slate-900">
                  {s.title}
                </span>
                <span className="block text-sm text-slate-500">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
