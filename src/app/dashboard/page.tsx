import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  Crown,
  Eye,
  MessageSquare,
  MousePointerClick,
  PencilLine,
  Plus,
  Triangle,
} from "lucide-react";
import { ProductLogo } from "@/components/ProductRow";
import { SiteShell } from "@/components/SiteShell";
import { getProduct } from "@/lib/data";

export const metadata: Metadata = {
  title: "My launches — WeekLaunch",
};

// Sample numbers until launches come from a database
const stats = [
  { label: "Upvotes", value: "331", change: "+48 this week", icon: Triangle },
  {
    label: "Page views",
    value: "4,920",
    change: "+1,204 this week",
    icon: Eye,
  },
  {
    label: "Website clicks",
    value: "612",
    change: "+157 this week",
    icon: MousePointerClick,
  },
  {
    label: "Comments",
    value: "42",
    change: "+9 this week",
    icon: MessageSquare,
  },
];

const myLaunches = [
  { slug: "studyflow", status: "live" as const, week: 45 },
  { slug: "promptpal", status: "past" as const, week: 44 },
  { slug: "tasktide", status: "scheduled" as const, week: 47 },
];

const statusStyle = {
  live: {
    label: "Live now",
    icon: CircleCheck,
    className: "bg-emerald-100 text-emerald-800",
  },
  scheduled: {
    label: "Scheduled",
    icon: CalendarClock,
    className: "bg-sky-100 text-sky-800",
  },
  past: {
    label: "Launched",
    icon: CircleCheck,
    className: "bg-slate-100 text-slate-700",
  },
};

export default function DashboardPage() {
  return (
    <SiteShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            My launches
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            How your products are doing on WeekLaunch.
          </p>
        </div>
        <Link
          href="/submit"
          className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="size-4" />
          New launch
        </Link>
      </div>

      <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Preview — these are sample numbers until your account is connected.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <s.icon className="size-3.5" />
              {s.label}
            </dt>
            <dd className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {s.value}
            </dd>
            <dd className="mt-0.5 text-xs text-slate-500">{s.change}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Your products
      </h2>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {myLaunches.map((l) => {
          const p = getProduct(l.slug)!;
          const st = statusStyle[l.status];
          return (
            <li
              key={l.slug}
              className="flex flex-wrap items-center gap-3 p-4 sm:gap-4"
            >
              <ProductLogo logo={p.logo} name={p.name} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${st.className}`}
                  >
                    <st.icon className="size-3" />
                    {st.label}
                  </span>
                  Week {l.week}
                  <span className="flex items-center gap-1">
                    <Triangle className="size-2.5 fill-current" />
                    {l.status === "scheduled" ? 0 : p.upvotes}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/submit"
                  className="btn-pop flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900"
                >
                  <PencilLine className="size-3.5" />
                  Edit
                </Link>
                <Link
                  href={`/products/${p.slug}`}
                  className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-amber-300 px-3 text-xs font-bold text-slate-900 hover:bg-amber-200"
                >
                  View <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <Link
        href="/pricing"
        className="group mt-4 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-5 text-white"
      >
        <span className="badge-pop flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
          <Crown className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            Upgrade TaskTide to Premium
          </span>
          <span className="block text-sm text-white/75">
            Get pinned at the top of Week 47 for $29.
          </span>
        </span>
        <ArrowUpRight className="size-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </SiteShell>
  );
}
