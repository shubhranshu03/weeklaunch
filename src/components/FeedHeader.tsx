"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Rocket, X } from "lucide-react";
import { Logo } from "./Logo";

const pageLinks = [
  { label: "Discover", href: "/" },
  { label: "All products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
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
  const drawerOnly = sidebars ? "lg:hidden" : "md:hidden";

  return (
    <>
      <div className="flex h-10 items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`btn-pop flex size-10 items-center justify-center rounded-xl bg-white ${drawerOnly}`}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
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
        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            aria-label="Launch product"
            className="btn-pop flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-3 text-sm font-semibold text-white hover:bg-brand-600 min-[400px]:pl-3.5 min-[400px]:pr-4"
          >
            <Rocket className="size-4" />
            {/* Icon only on narrow phones so the bar fits */}
            <span className="hidden min-[400px]:inline">
              Launch<span className="hidden sm:inline"> product</span>
            </span>
          </Link>
          <Link
            href="/signin"
            aria-label="Account"
            className="btn-pop flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-rose-400 text-sm font-bold text-slate-900"
          >
            A
          </Link>
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
