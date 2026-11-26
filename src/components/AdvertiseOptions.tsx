"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Megaphone,
  PanelRight,
  Rows3,
  Send,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { requestGrowthServices } from "@/lib/actions/growth";
import { growthServices, type GrowthService } from "@/lib/growth";

const icons: Record<GrowthService["id"], { icon: LucideIcon; tint: string }> = {
  sidebar: { icon: PanelRight, tint: "bg-sky-500/10 text-sky-600" },
  center: { icon: Rows3, tint: "bg-brand-500/10 text-brand-600" },
  blog: { icon: FileText, tint: "bg-emerald-500/10 text-emerald-600" },
  directories: { icon: Send, tint: "bg-amber-500/10 text-amber-600" },
  social: { icon: Megaphone, tint: "bg-pink-500/10 text-pink-600" },
};

// The Advertise option on /submit: pick ways to promote, see the total, send the request
export function AdvertiseOptions({
  productName,
  website,
  payable = [],
}: {
  productName: string;
  website: string;
  // Services that can be paid by card right away
  payable?: string[];
}) {
  const [picked, setPicked] = useState<string[]>(["directories"]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, start] = useTransition();

  const chosen = growthServices.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((n, s) => n + s.price, 0);
  const byCard =
    chosen.length > 0 && chosen.every((s) => payable.includes(s.id));
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  if (sent)
    return (
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Request sent
        </h2>
        <p className="mt-2 max-w-md text-slate-500">
          We&apos;ll email you a payment link for {chosen.length}{" "}
          {chosen.length === 1 ? "service" : "services"} (${total}) within 24
          hours, then get started on {productName || "your product"}.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Go to my launches
        </Link>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-3">
        {growthServices.map((s) => {
          const on = picked.includes(s.id);
          const { icon: Icon, tint } = icons[s.id];
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className={`group relative flex w-full flex-col rounded-xl border bg-white p-4 text-left transition-shadow hover:shadow-lg sm:p-5 ${
                on
                  ? "border-slate-900 ring-1 ring-slate-900"
                  : "border-slate-200"
              }`}
            >
              <span className="flex items-start gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tint}`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {s.name}
                    </span>
                    {s.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <ShieldCheck className="size-3.5" />
                        {s.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-slate-600">
                    {s.blurb}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-lg font-bold tabular-nums text-slate-900">
                    ${s.price}
                  </span>
                  <span className="block text-xs text-slate-500">{s.unit}</span>
                </span>
              </span>
              <span className="mt-3 flex flex-wrap items-center gap-2 sm:pl-[3.25rem]">
                {s.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <Check className="size-3 text-emerald-600" />
                    {f}
                  </span>
                ))}
                <span className="ml-auto">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full border-2 ${
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {on && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <aside>
        <div className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Your order
            </p>
            <p className="mt-2 truncate font-semibold text-slate-900">
              {productName || "Your product"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {website || "Add your website on the listing page"}
            </p>
            {chosen.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Pick one or more options.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {chosen.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span className="text-slate-600">{s.name}</span>
                    <span className="font-medium tabular-nums text-slate-900">
                      ${s.price}
                      <span className="text-xs font-normal text-slate-500">
                        {s.unit === "one-time" ? "" : ` ${s.unit}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
              <span>Total</span>
              <span className="tabular-nums">${total}</span>
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-900">
                Anything we should know?
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                placeholder="Dates for ads, links to use, who you're for…"
                className="mt-1.5 h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-brand-400"
              />
            </label>
          </section>
          <button
            type="button"
            disabled={sending || chosen.length === 0}
            onClick={() => {
              setError("");
              start(async () => {
                const res = await requestGrowthServices({
                  services: picked,
                  productName,
                  website,
                  notes,
                });
                if (res.ok && res.checkoutUrl) {
                  window.location.assign(res.checkoutUrl);
                } else if (res.ok) {
                  setSent(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else setError(res.error);
              });
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-[15px] font-semibold text-white shadow-[0_0_0_2px_var(--color-brand-200)] transition hover:bg-slate-700 disabled:opacity-60"
          >
            {chosen.length === 0
              ? "Pick an option"
              : byCard
                ? `Pay $${total}`
                : `Request for $${total}`}
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <p className="text-center text-xs text-slate-500">
            {byCard
              ? "Secure card checkout. We email you within one working day to get started."
              : "No payment now. We email you a secure payment link within 24 hours."}
          </p>
        </div>
      </aside>
    </div>
  );
}
