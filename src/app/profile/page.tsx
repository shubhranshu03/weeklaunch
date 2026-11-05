import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Globe,
  MapPin,
  MessageSquare,
  Rocket,
  Settings,
  Triangle,
} from "lucide-react";
import { siX } from "simple-icons";
import { Suspense } from "react";
import { ProductRow } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { requireUser } from "@/lib/auth";
import { getMakerLaunches } from "@/lib/products";

export const metadata: Metadata = {
  title: "My profile",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <ProfileDetail />
      </Suspense>
    </SiteShell>
  );
}

async function ProfileDetail() {
  const { id, profile } = await requireUser("/profile");
  const launches = (await getMakerLaunches(id))
    .filter((l) => l.status === "approved")
    .map((l) => l.product);
  const upvotes = launches.reduce((n, p) => n + p.upvotes, 0);
  const comments = launches.reduce((n, p) => n + p.comments, 0);
  const name = profile.name || profile.handle;
  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    { icon: Rocket, label: "Launches", value: launches.length },
    { icon: Triangle, label: "Upvotes", value: upvotes },
    { icon: MessageSquare, label: "Comments", value: comments },
  ];

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="relative h-24 bg-gradient-to-br from-brand-500 to-indigo-600 sm:h-32">
          <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/15" />
        </div>
        <div className="px-4 pb-5 sm:px-7 sm:pb-6">
          <div className="relative -mt-10 flex items-end justify-between gap-3 sm:-mt-12">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- Google or uploaded profile photo
              <img
                src={profile.avatar_url}
                alt=""
                referrerPolicy="no-referrer"
                className="badge-pop size-20 shrink-0 rounded-full bg-white object-cover ring-4 ring-white sm:size-24"
              />
            ) : (
              <span className="badge-pop flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-3xl font-bold text-slate-900 ring-4 ring-white sm:size-24 sm:text-4xl">
                {name[0]?.toUpperCase()}
              </span>
            )}
            <Link
              href="/settings"
              className="btn-pop flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-slate-900 sm:h-10 sm:px-4"
            >
              <Settings className="size-4" />
              Edit profile
            </Link>
          </div>

          <h1 className="mt-3 flex items-center gap-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:mt-4 sm:text-2xl">
            {name}
            {profile.verified && (
              <BadgeCheck
                className="size-5 shrink-0 fill-sky-500 text-white sm:size-6"
                aria-label="Verified maker"
              />
            )}
          </h1>
          <p className="text-sm text-slate-500">
            @{profile.handle}
            {profile.verified && " · Verified Premium maker"}
          </p>
          {profile.bio && (
            <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-[15px]">
              {profile.bio}
            </p>
          )}

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 sm:gap-x-5">
            {profile.location && (
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {profile.location}
              </li>
            )}
            {profile.website && (
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
            )}
            {profile.x_handle && (
              <li>
                <a
                  href={`https://x.com/${profile.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-slate-900"
                >
                  <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
                    <path d={siX.path} fill="currentColor" />
                  </svg>
                  @{profile.x_handle}
                </a>
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              Joined {joined}
            </li>
          </ul>

          <dl className="mt-5 grid grid-cols-3 gap-2 sm:mt-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="min-w-0 rounded-2xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3"
              >
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
      {launches.length > 0 ? (
        <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {launches.map((p, i) => (
            <ProductRow key={p.slug} product={p} rank={i + 4} />
          ))}
        </ol>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-sm text-slate-500">No live launches yet.</p>
          <Link
            href="/submit"
            className="btn-pop mt-4 inline-flex h-10 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Launch your first product
          </Link>
        </div>
      )}
    </>
  );
}
