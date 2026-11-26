"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { categoryHref } from "@/lib/categories";
import { productCategories } from "@/lib/data";
import { toolHref, tools } from "@/lib/tools";
import { useAuth } from "@/lib/useAuth";
import { LogoMark } from "../Logo";
import { EditionToggle } from "./EditionToggle";
import { browsePlatforms } from "../home/BrowseNav";

// Plain links in the bar
const links = [
  { label: "Hall of Fame", href: "/hall-of-fame" },
  { label: "Pricing", href: "/pricing" },
];

// Links in the account menu (and the phone menu)
const account = [
  { label: "My launches", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

// The top bar on every page: logo, search, Browse and Grow menus, account and Launch.
// Its inner width follows the middle column of the home page at every size.
// The address isn't known while Next builds the shell of a product or maker page,
// so it's read inside Suspense. Without this those pages fail when the cache is cleared.
// `compact` is kept for older call sites; the bar is the same everywhere.
export function Masthead({ compact = false }: { compact?: boolean }) {
  void compact;
  return (
    <Suspense fallback={<MastheadView pathname={null} />}>
      <MastheadAtPath />
    </Suspense>
  );
}

function MastheadAtPath() {
  return <MastheadView pathname={usePathname()} />;
}

// A dropdown that closes on outside click, Escape and picking a link
function Dropdown({
  label,
  children,
  align = "left",
  width = "w-[440px]",
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium text-slate-800 hover:bg-slate-100"
      >
        {label}
        <ChevronDown
          className={`size-4 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
          className={`absolute top-full z-50 mt-2 ${width} rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-16px_rgb(15_23_42/0.25)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const menuHead =
  "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-brand-600";
const menuLink =
  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900";

function MastheadView({ pathname }: { pathname: string | null }) {
  const { ready, user } = useAuth();
  const [open, setOpen] = useState(false);
  const next = encodeURIComponent(pathname ?? "/");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center gap-3 px-4 min-[1440px]:max-w-[min(1248px,calc(100vw-424px))] min-[1440px]:px-0">
        <Link
          href="/"
          aria-label="IndieShip home"
          className="flex shrink-0 items-center gap-2"
        >
          <LogoMark className="size-8" />
          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">
            IndieShip
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 xl:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <form
          action="/products"
          role="search"
          className="ml-2 hidden h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-brand-400 lg:flex lg:max-w-[380px]"
        >
          <Search className="size-4 shrink-0 text-slate-400" />
          <label htmlFor="bar-search" className="sr-only">
            Search products
          </label>
          <input
            id="bar-search"
            name="q"
            placeholder="Search products…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>

        <nav
          aria-label="Sections"
          className="ml-auto hidden items-center gap-0.5 lg:flex"
        >
          <Dropdown label="Browse">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={menuHead}>Platforms</p>
                {browsePlatforms.map((p) => (
                  <Link key={p.id} href={p.href} className={menuLink}>
                    <p.icon className="size-4 text-slate-400" />
                    {p.label}
                  </Link>
                ))}
                <Link href="/platforms" className={`${menuLink} font-semibold`}>
                  All platforms
                </Link>
              </div>
              <div>
                <p className={menuHead}>Categories</p>
                {productCategories.map((c) => (
                  <Link
                    key={c.name}
                    href={categoryHref(c.name)}
                    className={menuLink}
                  >
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className={`${menuLink} font-semibold`}
                >
                  All categories
                </Link>
              </div>
            </div>
          </Dropdown>
          <Dropdown label="Grow" width="w-[300px]">
            <p className={menuHead}>Free tools</p>
            {tools.map((t) => (
              <Link key={t.slug} href={toolHref(t)} className={menuLink}>
                {t.name}
              </Link>
            ))}
            <p className={`${menuHead} mt-3`}>Services</p>
            <Link href="/directory-submission" className={menuLink}>
              Submit to 100+ directories
            </Link>
          </Dropdown>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden whitespace-nowrap rounded-lg px-2.5 py-2 text-[15px] font-medium text-slate-800 hover:bg-slate-100 2xl:block"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-1">
          <Link
            href="/pricing#ads"
            className="whitespace-nowrap rounded-lg px-2 py-2 text-[15px] font-medium text-brand-600 hover:bg-brand-50"
          >
            Advertise
          </Link>
          <EditionToggle />
          {user ? (
            <div className="hidden sm:block">
              <Dropdown
                align="right"
                width="w-[200px]"
                label={
                  <span className="flex items-center gap-2">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element -- profile photo from storage
                      <img
                        src={user.avatar}
                        alt=""
                        className="size-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="max-w-[110px] truncate text-sm">
                      {user.name.split(" ")[0] || "Profile"}
                    </span>
                  </span>
                }
              >
                {account.map((a) => (
                  <Link key={a.href} href={a.href} className={menuLink}>
                    {a.label}
                  </Link>
                ))}
              </Dropdown>
            </div>
          ) : (
            <>
              <Link
                href={`/signin?next=${next}`}
                className={`hidden h-9 items-center whitespace-nowrap rounded-lg border border-slate-300 px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:inline-flex ${
                  ready ? "" : "opacity-0"
                }`}
              >
                Log in
              </Link>
              <Link
                href={`/signin?next=${next}`}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-700 ${
                  ready ? "" : "opacity-0"
                }`}
              >
                <span className="sm:hidden">Sign in</span>
                <span className="hidden sm:inline">Sign up</span>
              </Link>
            </>
          )}
          {user && (
            <Link
              href="/submit"
              className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Launch
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 2xl:hidden">
          <div
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <div
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
            className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <LogoMark className="size-7" />
                IndieShip
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <form action="/products" role="search" className="mb-3 lg:hidden">
              <label htmlFor="menu-search" className="sr-only">
                Search products
              </label>
              <input
                id="menu-search"
                name="q"
                placeholder="Search products…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400"
              />
            </form>
            <Link href="/" className={menuLink}>
              Today
            </Link>
            <Link href="/products" className={menuLink}>
              All products
            </Link>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={menuLink}>
                {l.label}
              </Link>
            ))}
            <Link href="/directory-submission" className={menuLink}>
              Directory submission
            </Link>
            <Link href="/tools" className={menuLink}>
              Free tools
            </Link>
            <p className={`${menuHead} mt-4`}>Platforms</p>
            {browsePlatforms.map((p) => (
              <Link key={p.id} href={p.href} className={menuLink}>
                <p.icon className="size-4 text-slate-400" />
                {p.label}
              </Link>
            ))}
            <p className={`${menuHead} mt-4`}>Categories</p>
            {productCategories.map((c) => (
              <Link
                key={c.name}
                href={categoryHref(c.name)}
                className={menuLink}
              >
                {c.name}
              </Link>
            ))}
            <p className={`${menuHead} mt-4`}>Account</p>
            {account.map((a) => (
              <Link key={a.href} href={a.href} className={menuLink}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
