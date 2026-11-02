import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { AskAI } from "./AskAI";
import { Logo } from "./Logo";

// Footer links that already have a page; the rest are placeholders
const hrefs: Record<string, string> = {
  "This week": "/",
  "All products": "/products",
  Categories: "/products",
  Pricing: "/pricing",
  Advertise: "/pricing#ads",
  "Past weeks": "/",
  "Submit a product": "/submit",
  "Launch badges": "/badges",
  "Help center": "/contact",
  About: "/about",
  Contact: "/contact",
  Terms: "/terms",
  Privacy: "/privacy",
};

const columns = [
  {
    title: "Product",
    links: ["This week", "Past weeks", "All products", "Categories"],
  },
  {
    title: "Makers",
    links: ["Submit a product", "Launch badges", "Pricing", "Advertise"],
  },
  {
    title: "Resources",
    links: ["Launch directories", "Launch checklist", "Blog", "Help center"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Terms", "Privacy"],
  },
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1 .9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* Call to action */}
        <div className="relative -mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute -bottom-16 right-32 size-32 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to launch?
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Join next Monday&apos;s board. Free to list, live in minutes.
              </p>
            </div>
            <Link
              href="/submit"
              className="btn-pop flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-amber-300 px-5 text-sm font-bold text-slate-900 hover:bg-amber-200 sm:self-auto"
            >
              <Rocket className="size-4" />
              Launch your product
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              The weekly launchpad for indie makers and startups. A fresh board
              every Monday.
            </p>
            <form className="mt-5 flex max-w-xs gap-2">
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email for the weekly newsletter"
                className="h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-slate-900 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="btn-pop flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600"
              >
                <ArrowRight className="size-4" />
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Top launches every Monday. No spam.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:contents">
            {columns.map((c) => (
              <div key={c.title}>
                <h3 className="text-sm font-semibold text-slate-900">
                  {c.title}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <Link
                        href={hrefs[l] ?? "#"}
                        className="text-sm text-slate-500 transition hover:text-brand-600"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Ask AI */}
        <div className="pb-8">
          <AskAI />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 py-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © 2026 WeekLaunch. Made for makers, every week.
          </p>
          <div className="flex items-center gap-2">
            {[
              { label: "X", icon: <XIcon /> },
              { label: "LinkedIn", icon: <LinkedInIcon /> },
              { label: "GitHub", icon: <GitHubIcon /> },
            ].map((s) => (
              <Link
                key={s.label}
                href="#"
                aria-label={`WeekLaunch on ${s.label}`}
                className="btn-pop flex size-9 items-center justify-center rounded-lg bg-white text-slate-900"
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
