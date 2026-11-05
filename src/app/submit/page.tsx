import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { Suspense } from "react";
import { CalendarDays, Clock, Gift, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/GoogleIcon";
import { SiteShell } from "@/components/SiteShell";
import { SubmitForm } from "@/components/SubmitForm";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { FREE_QUEUE_WEEKS } from "@/lib/data";
import { paymentsConfigured } from "@/lib/dodo";
import {
  getBoardWeeks,
  nextFreeWeek,
  premiumLeft,
  weekLoad,
} from "@/lib/products";
import { weekKey } from "@/lib/weeks";

export const metadata: Metadata = {
  title: "Submit your product — launch free or go Premium",
  description:
    "Launch your product on WeekLaunch in about 3 minutes. Add your details, pick a launch week and go live on Monday. Free launches available.",
  alternates: { canonical: "/submit" },
};

const highlights = [
  { icon: CalendarDays, text: "Live every Monday" },
  { icon: Clock, text: "Takes about 3 minutes" },
  { icon: ShieldCheck, text: "Reviewed within 24 hours" },
  { icon: Gift, text: "Free option available" },
];

export default function SubmitPage() {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: `${SITE_URL}/submit`,
          name: "Submit your product to WeekLaunch",
          description:
            "Launch your product on a weekly board for free, or go Premium to pick your week and get pinned at the top.",
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-16 right-40 size-32 rounded-full bg-white/10" />
        <div className="relative">
          <span className="badge-pop inline-block rounded-md bg-amber-300 px-2 py-0.5 text-xs font-bold text-slate-900">
            New launch
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Launch your product
          </h1>
          <p className="mt-1 max-w-lg text-white/80">
            Get in front of makers and early adopters. Fill in the details, pick
            your week and go live on Monday.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {highlights.map((h) => (
              <li
                key={h.text}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25"
              >
                <h.icon className="size-3.5" />
                {h.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Form />
      </Suspense>
    </SiteShell>
  );
}

async function Form() {
  if (!(await getCurrentUser()))
    return (
      <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Sign in to launch
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          It takes one click with Google, and your launches stay linked to your
          profile.
        </p>
        <Link
          href="/signin?next=/submit"
          className="btn-pop mt-5 flex h-11 items-center gap-2.5 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          <GoogleIcon className="size-5" />
          Continue with Google
        </Link>
      </div>
    );
  const weeks = await getBoardWeeks();
  const now = weeks.findIndex((w) => w.current);
  const upcoming = weeks.slice(now + 1, now + 1 + FREE_QUEUE_WEEKS);
  const freeWeek = (await nextFreeWeek()) ?? upcoming[upcoming.length - 1];
  const weeksShown = upcoming.some((w) => w.number === freeWeek.number)
    ? upcoming
    : [...upcoming, freeWeek];
  const load = await weekLoad(weeksShown);
  const premiumSpots = Object.fromEntries(
    upcoming.map((w) => [w.number, premiumLeft(load[weekKey(w)])]),
  );
  return (
    <SubmitForm
      upcoming={upcoming}
      premiumSpots={premiumSpots}
      boostTaken={Object.fromEntries(
        weeksShown.map((w) => [w.number, load[weekKey(w)].boosted]),
      )}
      freeWeek={freeWeek}
      paymentsReady={paymentsConfigured}
    />
  );
}
