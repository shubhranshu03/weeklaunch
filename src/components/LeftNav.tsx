"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Compass,
  LayoutGrid,
  Package,
  Search,
  Settings,
  Tag,
  Wrench,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
};

const explore: NavItem[] = [
  { label: "Discover", icon: Compass, href: "/" },
  { label: "All products", icon: LayoutGrid, href: "/products" },
  { label: "Pricing", icon: Tag, href: "/pricing" },
  { label: "Free tools", icon: Wrench, href: "/tools" },
];

const workspace: NavItem[] = [
  { label: "My launches", icon: Package, href: "/dashboard" },
  { label: "Profile", icon: UserRound, href: "/profile" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div>
      <p className="px-3 text-[11px] font-semibold text-slate-400">{title}</p>
      <ul className="mt-2 space-y-0.5">
        {items.map(({ label, icon: Icon, href, badge }) => {
          const active = href === pathname;
          return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-full px-3 py-2 text-sm transition ${
                  active
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`size-4 ${active ? "text-brand-600" : "text-slate-400"}`}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="badge-pop rounded-md bg-emerald-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-900">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LeftNav() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-400 transition hover:border-slate-300"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Find a product</span>
          <kbd className="rounded bg-slate-100 px-1.5 font-mono text-[11px] text-slate-500">
            /
          </kbd>
        </button>
        <button
          type="button"
          className="btn-pop relative flex size-10 items-center justify-center rounded-xl bg-white text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
            3
          </span>
        </button>
      </div>

      <NavGroup title="Browse" items={explore} />
      <NavGroup title="Maker space" items={workspace} />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-5 text-white">
        <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute -bottom-10 right-6 size-20 rounded-full bg-white/10" />
        <p className="relative text-[11px] font-semibold uppercase tracking-wider text-white/70">
          Free resource
        </p>
        <h3 className="relative mt-1.5 font-semibold leading-snug">
          900+ launch directories, ranked by DR
        </h3>
        <p className="relative mt-1 text-xs text-white/75">
          Find where to list your SaaS or AI product next.
        </p>
        <Link
          href="#"
          className="btn-pop relative mt-4 inline-flex items-center gap-1 rounded-lg bg-amber-300 px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-200"
        >
          Explore list <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
