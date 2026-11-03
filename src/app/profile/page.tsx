import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Globe,
  MapPin,
  MessageSquare,
  Rocket,
  Settings,
  Triangle,
} from "lucide-react";
import { siX } from "simple-icons";
import { ProductRow } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { getProduct } from "@/lib/data";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

// Sample profile until accounts are connected
const profile = {
  name: "Ashu M.",
  handle: "ashubuilds",
  bio: "Indie maker building tools for students and small teams. Shipping something new every month.",
  location: "India",
  website: "https://example.com",
  joined: "October 2026",
};

const launches = ["studyflow", "promptpal", "tasktide"].map((slug) =>
  getProduct(slug)!,
);

export default function ProfilePage() {
  const upvotes = launches.reduce((n, p) => n + p.upvotes, 0);
  const comments = launches.reduce((n, p) => n + p.comments, 0);

  const stats = [
    { icon: Rocket, label: "Launches", value: launches.length },
    { icon: Triangle, label: "Upvotes", value: upvotes },
    { icon: MessageSquare, label: "Comments", value: comments },
  ];

  return (
    <SiteShell>
      <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Preview — this is a sample profile until your account is connected.
      </p>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="relative h-24 bg-gradient-to-br from-brand-500 to-indigo-600 sm:h-32">
          <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/15" />
        </div>
        <div className="px-4 pb-5 sm:px-7 sm:pb-6">
          <div className="relative -mt-10 flex items-end justify-between gap-3 sm:-mt-12">
            <span className="badge-pop flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-3xl font-bold text-slate-900 ring-4 ring-white sm:size-24 sm:text-4xl">
              {profile.name[0]}
            </span>
            <Link
              href="/settings"
              className="btn-pop flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900 sm:h-10 sm:px-4"
            >
              <Settings className="size-4" />
              Edit profile
            </Link>
          </div>

          <h1 className="mt-3 text-xl sm:mt-4 sm:text-2xl font-semibold tracking-tight text-slate-900">
            {profile.name}
          </h1>
          <p className="text-sm text-slate-500">@{profile.handle}</p>
          <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-[15px]">
            {profile.bio}
          </p>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 sm:gap-x-5">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {profile.location}
            </li>
            <li>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline"
              >
                <Globe className="size-4" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </li>
            <li>
              <a
                href={`https://x.com/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-slate-900"
              >
                <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
                  <path d={siX.path} fill="currentColor" />
                </svg>
                @{profile.handle}
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              Joined {profile.joined}
            </li>
          </ul>

          <dl className="mt-5 grid grid-cols-3 gap-2 sm:mt-6">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
                <dt className="flex min-w-0 items-center gap-1 text-[11px] text-slate-500 sm:gap-1.5 sm:text-xs">
                  <s.icon className="size-3 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Launches
      </h2>
      <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {launches.map((p, i) => (
          <ProductRow key={p.slug} product={p} rank={i + 4} />
        ))}
      </ol>
    </SiteShell>
  );
}
