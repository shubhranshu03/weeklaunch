import type { Metadata } from "next";
import { CalendarDays, Clock, Gift, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { SubmitForm } from "@/components/SubmitForm";

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
      <SubmitForm />
    </SiteShell>
  );
}
