"use client";

import { useState } from "react";
import { Check, Copy, Globe, Shuffle } from "lucide-react";

type Style = "all" | "suffix" | "prefix" | "blend" | "compound";
type Idea = { name: string; style: Exclude<Style, "all"> };

const styles: { id: Style; label: string }[] = [
  { id: "all", label: "All" },
  { id: "suffix", label: "Word + ending" },
  { id: "prefix", label: "Action + word" },
  { id: "blend", label: "Blends" },
  { id: "compound", label: "Two words" },
];

const suffixes = [
  "ly",
  "ify",
  "io",
  "hq",
  "lab",
  "base",
  "flow",
  "kit",
  "hub",
  "stack",
  "wise",
  "nest",
  "pilot",
  "loop",
];
const prefixes = ["get", "try", "use", "go", "hey", "join"];
const extras = ["spark", "pad", "dock", "bee", "box", "craft", "mint", "path"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Words from the input: lowercase letters only, 3+ characters
function parseKeywords(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[\s,]+/)
        .map((w) => w.replace(/[^a-z]/g, ""))
        .filter((w) => w.length >= 3),
    ),
  ).slice(0, 5);
}

function joinSuffix(word: string, suffix: string) {
  // Avoid doubled letters like "notesss" or "flowwlow"
  const base = word.endsWith(suffix[0]) ? word.slice(0, -1) : word;
  if (suffix === "ly" && base.endsWith("y")) return base.slice(0, -1) + "ly";
  if (suffix === "ify" && /[aeiou]$/.test(base))
    return base.slice(0, -1) + "ify";
  return base + suffix;
}

function generate(keywords: string[]): Idea[] {
  const ideas: Idea[] = [];
  const add = (name: string, style: Idea["style"]) => {
    if (name.length >= 3 && name.length <= 14)
      ideas.push({ name: cap(name), style });
  };

  for (const k of keywords) {
    suffixes.forEach((s) => add(joinSuffix(k, s), "suffix"));
    prefixes.forEach((p) => add(p + k, "prefix"));
    extras.forEach((e) => add(k + e, "compound"));
  }
  for (const a of keywords) {
    for (const b of keywords) {
      if (a === b) continue;
      add(a + b, "compound");
      // First part of one word + last part of the other
      add(
        a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2)),
        "blend",
      );
      add(a.slice(0, 3) + b, "blend");
    }
  }
  const seen = new Set<string>();
  return ideas.filter((i) =>
    seen.has(i.name) ? false : (seen.add(i.name), true),
  );
}

// Small seeded shuffle so the same seed always gives the same order
function shuffle<T>(items: T[], seed: number) {
  const out = [...items];
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function CopyName({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${name}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(name);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          // Clipboard blocked; the name is still selectable
        }
      }}
      className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4" />
      )}
    </button>
  );
}

export function StartupNameGenerator() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<Style>("all");
  const [seed, setSeed] = useState(1);

  const keywords = parseKeywords(text);
  const usingExample = keywords.length === 0;
  const words = usingExample ? ["notes", "meet"] : keywords;

  const all = generate(words);
  const filtered = style === "all" ? all : all.filter((i) => i.style === style);
  const ideas = shuffle(filtered, seed).slice(0, 24);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            Keywords about your product
          </span>
          <span className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. notes, meeting, team"
              className="h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="btn-pop flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
            >
              <Shuffle className="size-4" />
              More ideas
            </button>
          </span>
          <span className="mt-1.5 block text-xs text-slate-400">
            Use 1–5 simple words, separated by commas.
          </span>
        </label>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {styles.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={style === s.id}
              onClick={() => setStyle(s.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                style === s.id
                  ? "badge-pop bg-brand-500 text-white"
                  : "border-[1.5px] border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold text-slate-900">
            {ideas.length} name ideas
          </h2>
          {usingExample && (
            <span className="text-xs text-slate-400">
              Example for &ldquo;notes, meet&rdquo; — add your keywords
            </span>
          )}
        </div>
        {ideas.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No names in this style yet — try another style or add a second
            keyword for blends.
          </p>
        ) : (
          <ul
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
            aria-live="polite"
          >
            {ideas.map((i) => {
              const domain = `${i.name.toLowerCase()}.com`;
              return (
                <li
                  key={i.name}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 py-2.5 pl-4 pr-2 transition hover:border-slate-300"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-bold tracking-tight text-slate-900">
                      {i.name}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {domain}
                    </span>
                  </span>
                  <CopyName name={i.name} />
                  <a
                    href={`https://www.namecheap.com/domains/registration/results/?domain=${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Check if ${domain} is available (opens in a new tab)`}
                    className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    <Globe className="size-3.5" />
                    Check
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
