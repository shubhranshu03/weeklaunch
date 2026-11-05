"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Rocket, X } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { Logo } from "./Logo";

const pageLinks = [
  { label: "Discover", href: "/" },
  { label: "All products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Free tools", href: "/tools" },
];

export function FeedHeader({
  nav,
  sidebars = true,
}: {
  nav: React.ReactNode;
  // Without sidebars the menu lives in the header on every screen size
  sidebars?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const drawerOnly = sidebars ? "lg:hidden" : "md:hidden";

  return (
    <>
      {/* One floating bar that stays on screen while scrolling */}
      <div className="sticky top-3 z-40 flex h-14 items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-2 shadow-[0_4px_16px_-6px_rgb(15_23_42/0.12)] backdrop-blur-md sm:gap-3 sm:px-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 ${drawerOnly}`}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Logo />
          {!sidebars && (
            <nav className="ml-6 hidden items-center gap-1 md:flex">
              {pageLinks.map((l) => {
                const active = l.href === pathname;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      active
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/submit"
            aria-label="Launch product"
            className="flex h-10 items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 px-3 text-sm font-semibold text-white shadow-[0_4px_12px_-4px_rgb(90_50_219/0.6)] transition hover:brightness-110 min-[400px]:pl-3.5 min-[400px]:pr-4"
          >
            <Rocket className="size-4" />
            {/* Icon only on narrow phones so the bar fits */}
            <span className="hidden min-[400px]:inline">
              Launch<span className="hidden sm:inline"> product</span>
            </span>
          </Link>
          {user ? (
            <Link
              href="/profile"
              aria-label="Your profile"
              className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-sm font-bold text-slate-900 ring-2 ring-white outline-1 outline-slate-200 transition hover:outline-brand-400"
            >
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- Google or uploaded profile photo
                <img
                  src={user.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="size-full object-cover"
                />
              ) : (
                user.name[0]?.toUpperCase()
              )}
            </Link>
          ) : (
            <Link
              href={`/signin?next=${encodeURIComponent(pathname)}`}
              className={`flex h-10 items-center rounded-full px-3.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 ${
                ready ? "" : "opacity-0"
              }`}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className={`fixed inset-0 z-50 ${drawerOnly}`}>
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[85vw] overflow-y-auto bg-background p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
