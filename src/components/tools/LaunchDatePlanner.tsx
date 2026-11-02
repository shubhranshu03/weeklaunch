"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Check, CircleAlert, Copy } from "lucide-react";

// Tasks placed relative to launch day (offset in days)
const plan: { offset: number; title: string; tasks: string[] }[] = [
  {
    offset: -28,
    title: "Get your story ready",
    tasks: [
      "Write your tagline and short description",
      "Make a square logo",
      "Pick the main problem you solve",
    ],
  },
  {
    offset: -21,
    title: "Visuals and landing page",
    tasks: [
      "Take 3–5 clear screenshots",
      "Record a 30–60 second demo video",
      "Polish your landing page",
    ],
  },
  {
    offset: -14,
    title: "Technical checks",
    tasks: [
      "Add page title, description and share image",
      "Install analytics",
      "Test sign-up and payment on phone and desktop",
      "Submit to WeekLaunch and book your week",
    ],
  },
  {
    offset: -7,
    title: "Line up your people",
    tasks: [
      "Prepare a launch-day offer",
      "Write your first comment",
      "Draft posts for X and LinkedIn",
      "List friends and early users to message",
    ],
  },
  {
    offset: -1,
    title: "Final check",
    tasks: [
      "Check every link and form once more",
      "Schedule your social posts",
      "Get a good night's sleep",
    ],
  },
  {
    offset: 0,
    title: "Launch day",
    tasks: [
      "Confirm your launch is live",
      "Post your first comment",
      "Share and message your list",
      "Reply to every comment fast",
    ],
  },
  {
    offset: 1,
    title: "Day after",
    tasks: [
      "Thank everyone publicly",
      "Reply to late comments",
      "Write down all feedback",
    ],
  },
  {
    offset: 7,
    title: "One week later",
    tasks: [
      "Review your analytics",
      "Ship the top 3 fixes",
      "Add the launch badge to your site",
    ],
  },
  {
    offset: 14,
    title: "Two weeks later",
    tasks: [
      "Write a launch recap post",
      "Ask happy users for a review",
      "Plan your next update launch",
    ],
  },
];

function parseDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function nextMonday(from: Date) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const add = ((8 - d.getDay()) % 7 || 7) + 28;
  return addDays(d, add);
}

function relative(offset: number) {
  if (offset === 0) return "Launch day";
  const n = Math.abs(offset);
  const unit =
    n % 7 === 0
      ? `${n / 7} week${n === 7 ? "" : "s"}`
      : `${n} day${n === 1 ? "" : "s"}`;
  return offset < 0 ? `${unit} before` : `${unit} after`;
}

function toIcs(launch: Date) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WeekLaunch//Launch Date Planner//EN",
  ];
  plan.forEach((step, i) => {
    const day = addDays(launch, step.offset);
    const start = isoDay(day).replace(/-/g, "");
    const end = isoDay(addDays(day, 1)).replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:weeklaunch-${start}-${i}@weeklaunch`,
      `DTSTAMP:${start}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:Launch plan: ${step.title}`,
      `DESCRIPTION:${step.tasks.map((t) => `- ${t}`).join("\\n")}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function LaunchDatePlanner() {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);

  // Default to the Monday about 4 weeks from today, set after the first render
  useEffect(() => {
    const t = setTimeout(() => setValue(isoDay(nextMonday(new Date()))), 0);
    return () => clearTimeout(t);
  }, []);

  const launch = value ? parseDay(value) : null;
  const notMonday = launch !== null && launch.getDay() !== 1;

  const copyText = async () => {
    if (!launch) return;
    const text = plan
      .map(
        (s) =>
          `${fmt(addDays(launch, s.offset))} — ${s.title}\n` +
          s.tasks.map((t) => `  [ ] ${t}`).join("\n"),
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked; the plan is still on the page
    }
  };

  const downloadIcs = () => {
    if (!launch) return;
    const url = URL.createObjectURL(
      new Blob([toIcs(launch)], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-plan-${value}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Your launch day
            </span>
            <input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1.5 block h-11 rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyText}
              disabled={!launch}
              className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-900 disabled:opacity-50"
            >
              {copied ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Copied" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={downloadIcs}
              disabled={!launch}
              className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <CalendarPlus className="size-4" />
              Add to calendar
            </button>
          </div>
        </div>
        {notMonday && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <CircleAlert className="size-4 shrink-0" />
            Tip: WeekLaunch launches go live on Mondays and stay on the board
            all week. Pick a Monday to get the full week.
          </p>
        )}
      </div>

      {launch && (
        <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-0.5 before:bg-slate-200">
          {plan.map((step) => {
            const day = addDays(launch, step.offset);
            const isLaunch = step.offset === 0;
            return (
              <li key={step.offset} className="relative flex gap-4">
                <span
                  aria-hidden
                  className={`relative z-[1] mt-4 flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-slate-900 text-xs font-bold ${
                    isLaunch
                      ? "bg-amber-300 text-slate-900"
                      : step.offset < 0
                        ? "bg-brand-500 text-white"
                        : "bg-white text-slate-700"
                  }`}
                >
                  {day.getDate()}
                </span>
                <div
                  className={`min-w-0 flex-1 rounded-2xl p-4 ${
                    isLaunch
                      ? "badge-pop bg-brand-50"
                      : "border border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {fmt(day)} · {relative(step.offset)}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {step.tasks.map((t) => (
                      <li key={t} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
