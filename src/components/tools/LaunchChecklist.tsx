"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { checklist, checklistCount } from "@/lib/checklist";

const STORAGE_KEY = "weeklaunch-checklist";

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function LaunchChecklist() {
  const [done, setDone] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Restore saved progress after the first render
  useEffect(() => {
    const t = setTimeout(() => setDone(load()), 0);
    return () => clearTimeout(t);
  }, []);

  const save = (next: string[]) => {
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be blocked; ticks still work for this visit
    }
  };

  const toggle = (id: string) =>
    save(done.includes(id) ? done.filter((d) => d !== id) : [...done, id]);

  const percent = Math.round((done.length / checklistCount) * 100);

  const copyText = async () => {
    const text = checklist
      .map(
        (s) =>
          `${s.title.toUpperCase()}\n` +
          s.items
            .map((i) => `[${done.includes(i.id) ? "x" : " "}] ${i.text}`)
            .join("\n"),
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked; nothing else to do
    }
  };

  return (
    <div className="space-y-4">
      <div className="badge-pop sticky top-3 z-10 rounded-2xl bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            {done.length} of {checklistCount} done
            <span className="ml-2 font-normal text-slate-500">{percent}%</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyText}
              className="btn-pop flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy as text"}
            </button>
            <button
              type="button"
              onClick={() => save([])}
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {checklist.map((section) => {
        const count = section.items.filter((i) => done.includes(i.id)).length;
        return (
          <section
            key={section.id}
            aria-labelledby={`cl-${section.id}`}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id={`cl-${section.id}`}
                className="text-lg font-semibold text-slate-900"
              >
                {section.title}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {section.when}
                </span>
              </h2>
              <span className="shrink-0 text-xs font-semibold text-slate-500">
                {count}/{section.items.length}
              </span>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {section.items.map((item) => {
                const on = done.includes(item.id);
                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer gap-3 py-3">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(item.id)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 ${
                          on
                            ? "border-slate-900 bg-brand-500 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {on && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[15px] font-medium ${
                            on
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {item.text}
                        </span>
                        <span className="block text-sm text-slate-500">
                          {item.tip}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
