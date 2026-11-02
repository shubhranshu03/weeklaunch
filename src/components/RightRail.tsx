import Link from "next/link";
import { ArrowRight, Megaphone, Triangle, Users } from "lucide-react";
import { lastWeekBest } from "@/lib/data";
import { ProductLogo } from "./ProductRow";

const chips = ["bg-brand-500", "bg-sky-500", "bg-pink-500"];

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function RightRail() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex h-10 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <Users className="size-3.5 text-brand-500" />
            52K visitors
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            68 live
          </span>
        </div>
        <Link
          href="#"
          aria-label="WeekLaunch on X"
          className="btn-pop flex size-10 items-center justify-center rounded-xl bg-white text-slate-900"
        >
          <XIcon className="size-4" />
        </Link>
      </div>

      <Link
        href="/pricing#ads"
        className="group flex flex-col items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-6 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50"
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
          <Megaphone className="size-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">
          Promote your product
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Your ad on every page · $49/month
        </p>
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <Link
          href="/products"
          className="group flex items-center justify-between px-1"
        >
          <span className="text-sm font-semibold text-slate-900">
            Hall of fame · W44
          </span>
          <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </Link>
        <ul className="mt-3 space-y-1">
          {lastWeekBest.map((p, i) => (
            <li key={p.name}>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-50"
              >
                <div className="relative">
                  <ProductLogo logo={p.logo} name={p.name} size="sm" />
                  <span
                    className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${chips[i]}`}
                  >
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{p.tagline}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
                  <Triangle className="size-2.5 fill-current" />
                  {p.upvotes}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
