"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Tone = "simple" | "bold" | "friendly";

type Inputs = { name: string; does: string; audience: string; benefit: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clean = (s: string) => s.trim().replace(/[.!]+$/, "");

// Tagline templates; each one reads naturally when "does" starts with a verb
const templates: Record<Tone, ((i: Inputs) => string)[]> = {
  simple: [
    (i) => `${cap(i.does)} for ${i.audience}`,
    (i) => `${cap(i.does)} in seconds`,
    (i) => `The easiest way to ${i.does}`,
    (i) => `${cap(i.does)}. ${cap(i.benefit)}.`,
    (i) => `Helps ${i.audience} ${i.does}`,
  ],
  bold: [
    (i) => `${cap(i.does)}. Without the busywork.`,
    (i) => `Stop wasting time. ${cap(i.does)}.`,
    (i) => `${cap(i.benefit)} — ${i.does} on autopilot`,
    (i) => `The fastest way for ${i.audience} to ${i.does}`,
    (i) => `${i.name}: ${i.does}, done right`,
  ],
  friendly: [
    (i) => `${cap(i.does)}, the easy way`,
    (i) => `Your new favorite way to ${i.does}`,
    (i) => `${cap(i.benefit)} with ${i.name}`,
    (i) => `Made for ${i.audience} who want to ${i.does}`,
    (i) => `${cap(i.does)} — and actually enjoy it`,
  ],
};

const tones: { id: Tone; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "bold", label: "Bold" },
  { id: "friendly", label: "Friendly" },
];

const LIMIT = 60;

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked; the text is still selectable
        }
      }}
      aria-label={`Copy: ${text}`}
      className="btn-pop flex h-8 shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-900"
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function TaglineGenerator() {
  const [form, setForm] = useState<Inputs>({
    name: "",
    does: "",
    audience: "",
    benefit: "",
  });
  const [tone, setTone] = useState<Tone>("simple");

  const values: Inputs = {
    name: clean(form.name) || "YourApp",
    does:
      clean(form.does).replace(/^./, (c) => c.toLowerCase()) ||
      "turn meetings into clear notes",
    audience: clean(form.audience) || "busy teams",
    benefit:
      clean(form.benefit).replace(/^./, (c) => c.toLowerCase()) ||
      "save hours every week",
  };
  const usingExample = !form.does.trim();
  const ideas = templates[tone].map((t) => t(values));

  const fields: { key: keyof Inputs; label: string; placeholder: string }[] = [
    { key: "name", label: "Product name", placeholder: "e.g. RocketNotes" },
    {
      key: "does",
      label: "What it does (start with a verb)",
      placeholder: "e.g. turn meetings into clear notes",
    },
    { key: "audience", label: "Who it's for", placeholder: "e.g. busy teams" },
    {
      key: "benefit",
      label: "Main benefit",
      placeholder: "e.g. save hours every week",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="space-y-4">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="text-sm font-semibold text-slate-900">
                {f.label}
              </span>
              <input
                className={`${input} mt-1.5`}
                value={form[f.key]}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                maxLength={60}
              />
            </label>
          ))}
          <div>
            <span className="text-sm font-semibold text-slate-900">Tone</span>
            <div className="mt-1.5 flex gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={tone === t.id}
                  onClick={() => setTone(t.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    tone === t.id
                      ? "badge-pop bg-brand-500 text-white"
                      : "border-[1.5px] border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Your taglines</h2>
          {usingExample && (
            <span className="text-xs text-slate-400">
              Showing an example — fill in the form
            </span>
          )}
        </div>
        <ul className="mt-4 space-y-2.5" aria-live="polite">
          {ideas.map((idea) => {
            const fits = idea.length <= LIMIT;
            return (
              <li
                key={idea}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{idea}</p>
                  <p
                    className={`mt-0.5 text-xs font-medium ${
                      fits ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {idea.length} characters ·{" "}
                    {fits
                      ? "fits launch directories"
                      : `over ${LIMIT} — shorten it`}
                  </p>
                </div>
                <CopyButton text={idea} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
