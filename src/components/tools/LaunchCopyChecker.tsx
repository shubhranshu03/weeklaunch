"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, RotateCcw, Sparkles } from "lucide-react";

type Copy = { name: string; tagline: string; description: string };

const example: Copy = {
  name: "RocketNotes",
  tagline: "Turn meetings into clear notes for busy teams",
  description:
    "RocketNotes joins your calls and turns them into clean notes and action items. It's built for small teams who lose decisions in long meetings. Share notes in one click and never ask 'what did we agree?' again.",
};

const buzzwords = [
  "revolutionary",
  "game-changing",
  "game changer",
  "cutting-edge",
  "disruptive",
  "next-gen",
  "next generation",
  "world-class",
  "seamless",
  "synergy",
  "best-in-class",
  "leverage",
  "innovative",
  "groundbreaking",
  "state-of-the-art",
  "paradigm",
  "ultimate",
  "robust",
];

type Check = { label: string; ok: boolean; points: number; tip: string };

function analyze(c: Copy) {
  const tagline = c.tagline.trim();
  const desc = c.description.trim();
  const lower = `${tagline} ${desc}`.toLowerCase();
  const found = buzzwords.filter((b) => lower.includes(b));
  const sentences = desc.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const words = desc.split(/\s+/).filter(Boolean).length;
  const avgWords = sentences.length ? words / sentences.length : 0;

  const checks: Check[] = [
    {
      label: "Tagline is 20–60 characters",
      ok: tagline.length >= 20 && tagline.length <= 60,
      points: 15,
      tip: `It's ${tagline.length} characters. Launch directories cut taglines at 60.`,
    },
    {
      label: "Tagline says who it's for",
      ok: /\bfor\b/i.test(tagline),
      points: 10,
      tip: 'Add the audience, like "for freelancers" or "for small teams".',
    },
    {
      label: "Tagline doesn't repeat the product name",
      ok:
        !c.name.trim() ||
        !tagline.toLowerCase().includes(c.name.trim().toLowerCase()),
      points: 5,
      tip: "The name is already shown next to the tagline — use the space to explain.",
    },
    {
      label: "No shouting",
      ok: !/!!|[A-Z]{5,}/.test(`${tagline} ${desc}`),
      points: 5,
      tip: "Skip ALL CAPS words and double exclamation marks — they look like spam.",
    },
    {
      label: "Description is 120–500 characters",
      ok: desc.length >= 120 && desc.length <= 500,
      points: 15,
      tip: `It's ${desc.length} characters. Aim for 2–4 short sentences.`,
    },
    {
      label: "Description has 2–6 sentences",
      ok: sentences.length >= 2 && sentences.length <= 6,
      points: 10,
      tip: "Split it into a few short sentences: what it does, who it's for, why it's different.",
    },
    {
      label: "Sentences are easy to read",
      ok: avgWords > 0 && avgWords <= 22,
      points: 10,
      tip: `Sentences average ${Math.round(avgWords)} words. Keep them under about 20.`,
    },
    {
      label: "Talks to the reader",
      ok: /\b(you|your|teams?|people|makers|founders|users)\b/i.test(desc),
      points: 10,
      tip: 'Use "you" or name the people it helps so readers see themselves in it.',
    },
    {
      label: "No buzzwords",
      ok: found.length === 0,
      points: 20,
      tip: found.length
        ? `Replace ${found.map((f) => `"${f}"`).join(", ")} with a concrete benefit.`
        : "Plain words are clearer than hype.",
    },
  ];

  const score = checks.reduce((n, ch) => n + (ch.ok ? ch.points : 0), 0);
  return { checks, score };
}

const input =
  "w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

export function LaunchCopyChecker() {
  const [c, setC] = useState<Copy>({ name: "", tagline: "", description: "" });
  const empty = !c.tagline.trim() && !c.description.trim();
  const { checks, score } = analyze(c);

  const grade =
    score >= 85
      ? {
          label: "Ready to launch",
          icon: CircleCheck,
          tone: "bg-emerald-100 text-emerald-800",
        }
      : score >= 65
        ? {
            label: "Almost there",
            icon: CircleAlert,
            tone: "bg-amber-100 text-amber-800",
          }
        : {
            label: "Needs work",
            icon: CircleAlert,
            tone: "bg-rose-100 text-rose-800",
          };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setC(example)}
            className="btn-pop flex h-9 items-center gap-1.5 rounded-lg bg-amber-300 px-3 text-xs font-bold text-slate-900 hover:bg-amber-200"
          >
            <Sparkles className="size-3.5" />
            Try an example
          </button>
          <button
            type="button"
            onClick={() => setC({ name: "", tagline: "", description: "" })}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </button>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            Product name
          </span>
          <input
            className={`${input} mt-1.5 h-11`}
            value={c.name}
            onChange={(e) => setC((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. RocketNotes"
          />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-900">
              Tagline
            </span>
            <span className="text-xs text-slate-400">
              {c.tagline.length}/60
            </span>
          </span>
          <input
            className={`${input} mt-1.5 h-11`}
            value={c.tagline}
            onChange={(e) => setC((s) => ({ ...s, tagline: e.target.value }))}
            placeholder="What it does, in one short line"
          />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-900">
              Description
            </span>
            <span className="text-xs text-slate-400">
              {c.description.length}/500
            </span>
          </span>
          <textarea
            className={`${input} mt-1.5 h-40 resize-none py-3`}
            value={c.description}
            onChange={(e) =>
              setC((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="Who it's for, what problem it solves and what makes it different."
          />
        </label>
      </div>

      <div
        className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
        aria-live="polite"
      >
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <span className="badge-pop flex size-14 items-center justify-center rounded-2xl bg-amber-300 text-2xl font-bold text-slate-900">
              ?
            </span>
            <p className="mt-4 font-semibold text-slate-900">
              Your score shows here
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Paste your tagline and description, or try the example.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <p className="text-5xl font-bold tabular-nums tracking-tight text-slate-900">
                {score}
                <span className="text-xl font-semibold text-slate-400">
                  /100
                </span>
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${grade.tone}`}
              >
                <grade.icon className="size-4" />
                {grade.label}
              </span>
            </div>
            <div
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Copy score"
            >
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
                style={{ width: `${score}%` }}
              />
            </div>
            <ul className="mt-5 divide-y divide-slate-100">
              {checks.map((ch) => (
                <li key={ch.label} className="flex gap-3 py-3">
                  {ch.ok ? (
                    <CircleCheck
                      className="mt-0.5 size-5 shrink-0 text-emerald-600"
                      aria-label="Pass"
                    />
                  ) : (
                    <CircleAlert
                      className="mt-0.5 size-5 shrink-0 text-amber-600"
                      aria-label="Needs a fix"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-sm font-semibold ${ch.ok ? "text-slate-900" : "text-slate-900"}`}
                      >
                        {ch.label}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {ch.ok ? `+${ch.points}` : `0/${ch.points}`}
                      </span>
                    </span>
                    {!ch.ok && (
                      <span className="block text-sm text-slate-500">
                        {ch.tip}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
