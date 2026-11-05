"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { createDirectoryOrder } from "@/lib/actions/directory";
import { directoryPackages } from "@/lib/directories";

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

// Package cards on the page set ?package=… in the link; pick it up here
function packageFromHash() {
  const m = window.location.hash.match(/package-(30|50|100)/);
  return m?.[1];
}

export function DirectoryOrderForm({
  prefill,
}: {
  // Details from the maker's latest launch, to save typing
  prefill?: {
    name: string;
    website: string;
    tagline: string;
    description: string;
  };
}) {
  const [pkg, setPkg] = useState("50");
  const [form, setForm] = useState({
    productName: prefill?.name ?? "",
    website: prefill?.website ?? "",
    tagline: prefill?.tagline ?? "",
    description: prefill?.description ?? "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const read = () => {
      const p = packageFromHash();
      if (p) setPkg(p);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const chosen = directoryPackages.find((p) => p.id === pkg)!;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const res = await createDirectoryOrder({ package: pkg, ...form });
          if (res.ok) window.location.assign(res.checkoutUrl);
          else setError(res.error);
        });
      }}
      className="space-y-5"
    >
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          Package
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {directoryPackages.map((p) => {
            const on = p.id === pkg;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPkg(p.id)}
                className={`flex items-center justify-between rounded-xl p-3 text-left transition ${
                  on
                    ? "badge-pop bg-brand-500 text-white"
                    : "border-[1.5px] border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {p.count} directories
                  </span>
                  <span
                    className={`block text-xs ${on ? "text-white/75" : "text-slate-500"}`}
                  >
                    {p.name} · ${p.price}
                  </span>
                </span>
                {on && <Check className="size-4" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            Product name
          </span>
          <input
            className={`${input} mt-1.5`}
            value={form.productName}
            onChange={(e) => set("productName", e.target.value)}
            maxLength={60}
            placeholder="e.g. StudyFlow"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Website</span>
          <input
            className={`${input} mt-1.5`}
            type="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://yourproduct.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Tagline</span>
        <input
          className={`${input} mt-1.5`}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          maxLength={120}
          placeholder="What it does, in one short line"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">
          Description
        </span>
        <textarea
          className={`${input} mt-1.5 h-28 resize-none py-3`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={1000}
          placeholder="Who it's for, what problem it solves and what makes it different. We write every listing from this."
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">
          Anything else?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <input
          className={`${input} mt-1.5`}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={500}
          placeholder="Categories, keywords or directories to skip"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-pop flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 text-sm font-bold text-slate-900 hover:bg-amber-200 disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Pay ${chosen.price} for {chosen.count} directories
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-slate-500">
        Secure checkout by card or UPI. You&apos;ll get an email receipt right
        away.
      </p>
    </form>
  );
}
