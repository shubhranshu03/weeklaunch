"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { weekNumber } from "@/lib/weeks";
import { EAR_AD_PRICE } from "@/lib/data";
import { LogoMark } from "../Logo";
import { EditionToggle } from "./EditionToggle";

const sections = [
  { label: "This week", href: "/" },
  { label: "All products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Directory submission", href: "/directory-submission" },
  { label: "Free tools", href: "/tools" },
  { label: "My launches", href: "/dashboard" },
];

// Extra links in the phone menu
const account = [
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

const noSubscribe = () => () => {};

// Today's date in the reader's own time zone; blank while the page loads
function useToday() {
  return useSyncExternalStore(
    noSubscribe,
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    () => null,
  );
}

// This week's number is the issue number
function useIssue() {
  return useSyncExternalStore(
    noSubscribe,
    () => weekNumber(new Date()),
    () => null,
  );
}

// A small boxed ad in the top corner beside the nameplate, like a newspaper's
// "ears". Wide screens only, so the title keeps the room on phones.
function EarAd({ side }: { side: "left" | "right" }) {
  return (
    <Link
      href="/pricing#ads"
      aria-label={`Advertisement: book the ${side} ear ad spot`}
      className={`group hidden border-2 border-ink p-0.5 xl:block ${
        side === "left" ? "-rotate-1" : "rotate-1"
      }`}
    >
      <span className="block border border-ink px-3 py-3 text-center">
        <span className="block font-sans text-[9px] uppercase tracking-[0.24em] text-ink-soft">
          Advertisement
        </span>
        <span className="mt-1 block font-display text-lg font-black leading-tight text-ink group-hover:text-press">
          Your ad in this corner
        </span>
        <span className="mt-0.5 block font-serif text-xs italic text-ink-soft">
          First thing readers see. ${EAR_AD_PRICE}/week.
        </span>
      </span>
    </Link>
  );
}

// The newspaper masthead: date line, nameplate and section links.
// `compact` is the smaller nameplate used on every page but the home page.
// The address isn't known while Next builds the shell of a product or maker page,
// so it's read inside Suspense. Without this those pages fail when the cache is cleared.
export function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <Suspense fallback={<MastheadView compact={compact} pathname={null} />}>
      <MastheadAtPath compact={compact} />
    </Suspense>
  );
}

function MastheadAtPath({ compact }: { compact: boolean }) {
  return <MastheadView compact={compact} pathname={usePathname()} />;
}

function MastheadView({
  compact,
  pathname,
}: {
  compact: boolean;
  pathname: string | null;
}) {
  const today = useToday();
  const issue = useIssue();
  const { ready, user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="text-ink">
      {/* Date line */}
      <div className="flex items-center justify-between gap-3 border-b border-ink/80 py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="-ml-1 flex size-8 items-center justify-center rounded-sm text-ink hover:bg-paper-dark md:hidden"
          aria-label="Open sections"
        >
          <Menu className="size-4" />
        </button>
        <span className="hidden min-h-4 md:inline">{today}</span>
        <span className="hidden min-h-4 sm:inline">
          {issue !== null && `No. ${issue} · Free edition`}
        </span>
        <div className="flex items-center gap-2 normal-case tracking-normal">
          <EditionToggle />
          {user ? (
            <Link
              href="/profile"
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              {user.name.split(" ")[0] || "Profile"}
            </Link>
          ) : (
            <Link
              href={`/signin?next=${encodeURIComponent(pathname ?? "/")}`}
              className={`font-semibold text-ink underline-offset-4 hover:underline ${
                ready ? "" : "opacity-0"
              }`}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/submit"
            className="ink-pop rounded-sm bg-press px-3 py-1 text-xs font-bold text-white"
          >
            Launch yours
          </Link>
        </div>
      </div>

      {/* Nameplate, with a paid "ear" ad on each side on the home page */}
      <div
        className={`border-b-[3px] border-double border-ink ${
          compact
            ? "py-3 text-center sm:py-4"
            : "grid items-center gap-6 py-5 text-center sm:py-7 xl:grid-cols-[200px_minmax(0,1fr)_200px]"
        }`}
      >
        {!compact && <EarAd side="left" />}
        <div>
          <Link
            href="/"
            aria-label="WeekLaunch home"
            className="inline-flex items-center gap-3 sm:gap-5"
          >
            <LogoMark
              className={`shrink-0 ${compact ? "size-7 sm:size-9" : "hidden size-12 sm:block"}`}
            />
            <span
              className={`font-display font-black leading-none tracking-tight ${
                compact
                  ? "text-3xl sm:text-5xl"
                  : "text-[2.6rem] sm:text-7xl lg:text-8xl"
              }`}
            >
              The WeekLaunch
            </span>
          </Link>
          {!compact && (
            <p className="mt-3 font-serif text-sm italic text-ink-soft sm:text-base">
              New products from indie makers, with a vote every week. A new edition
              every Monday.
            </p>
          )}
        </div>
        {!compact && <EarAd side="right" />}
      </div>

      {/* Section links */}
      <nav
        aria-label="Sections"
        className="hidden justify-center gap-7 border-b border-ink/80 py-2.5 font-sans text-[13px] font-medium md:flex"
      >
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={s.href === pathname ? "page" : undefined}
            className={`underline-offset-[6px] hover:underline ${
              s.href === pathname ? "text-press underline" : "text-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto border-r-2 border-ink bg-paper p-5">
            <div className="mb-4 flex items-center justify-between border-b-[3px] border-double border-ink pb-3">
              <span className="font-display text-2xl font-black">Sections</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-sm hover:bg-paper-dark"
                aria-label="Close sections"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="divide-y divide-rule font-serif text-lg">
              {[...sections, ...account].map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="block py-2.5 hover:text-press"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
