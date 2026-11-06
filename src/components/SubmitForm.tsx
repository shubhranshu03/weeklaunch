"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ArrowRight,
  Check,
  CheckCircle2,
  Crown,
  CalendarCheck,
  ImagePlus,
  Link2,
  Lock,
  Pin,
  Rocket,
  Rows3,
  ArrowUpRight,
  ChevronLeft,
  Triangle,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { createLaunch } from "@/lib/actions/launches";
import {
  BOOST_PRICE,
  PREMIUM_CAPACITY,
  PREMIUM_PRICE,
  WEEK_CAPACITY,
  productCategories,
} from "@/lib/data";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/lib/useAuth";
import { weekLabel, type Week } from "@/lib/weeks";
import { ShareKit } from "./ShareKit";

const steps = ["Basics", "Details", "Launch", "Review"];

type Form = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  shots: string[];
  plan: "free" | "premium";
  week: number;
  boost: boolean;
  // Premium only: shown on the product page and to search engines
  highlights: string[];
  faqs: { q: string; a: string }[];
};

const MAX_EXTRAS = 5;

const empty: Form = {
  name: "",
  website: "",
  tagline: "",
  description: "",
  categories: [],
  logo: null,
  shots: [],
  plan: "premium",
  week: 0,
  boost: false,
  highlights: ["", "", ""],
  faqs: [{ q: "", a: "" }],
};

const MAX_SHOTS = 5;

const plans = [
  {
    id: "free",
    title: "Free launch",
    price: 0,
    blurb: "A good way to get started",
    icon: Rocket,
    features: [
      ["Listed on a weekly launch board", true],
      ["Your own product page", true],
      ["Upvotes and comments", true],
      ["Backlink after you add our badge", true],
      ["Choose your launch week", false],
      ["Pinned at the top all week", false],
      ["PREMIUM tag and Visit button", false],
      ["Blue verified tick on your profile", false],
      ["Mention in the Monday newsletter", false],
    ],
  },
  {
    id: "premium",
    title: "Premium launch",
    price: PREMIUM_PRICE,
    blurb: "Get seen first, on your schedule",
    icon: Crown,
    features: [
      ["Listed on a weekly launch board", true],
      ["Your own product page", true],
      ["Upvotes and comments", true],
      ["Dofollow backlink, no badge needed", true],
      ["Choose your launch week", true],
      ["Pinned at the top all week", true],
      ["PREMIUM tag and Visit button", true],
      ["Blue verified tick on your profile", true],
      ["Mention in the Monday newsletter", true],
    ],
  },
] as const;

const reasons = [
  {
    icon: Pin,
    title: "Seen first",
    text: "Pinned above free launches for your whole week.",
  },
  {
    icon: CalendarCheck,
    title: "Your timing",
    text: "Launch the week you're ready, with no queue.",
  },
  {
    icon: Link2,
    title: "Lasting traffic",
    text: "A dofollow backlink plus a newsletter mention.",
  },
];

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

function errorsFor(step: number, f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = "Add your product name.";
    if (!/^https?:\/\/\S+\.\S+/.test(f.website.trim()))
      e.website = "Add a full link, like https://yourproduct.com";
    if (f.tagline.trim().length < 10)
      e.tagline = "Write a tagline of at least 10 characters.";
  }
  if (step === 1) {
    if (f.description.trim().length < 40)
      e.description = "Tell people a bit more (at least 40 characters).";
    if (f.categories.length === 0) e.categories = "Pick at least one category.";
  }
  return e;
}

export function SubmitForm({
  upcoming,
  premiumSpots,
  boostTaken,
  freeWeek: freeWeekInfo,
  paymentsReady,
  siteUrl,
}: {
  // The next few launch weeks; the last one is the free queue week
  upcoming: Week[];
  // Premium spots still open, by week number
  premiumSpots: Record<number, number>;
  // Weeks whose one Boost is already sold, by week number
  boostTaken: Record<number, boolean>;
  // Where a free launch goes: 3 weeks out, or later if those weeks are full
  freeWeek: Week;
  paymentsReady: boolean;
  // The live address, for share links
  siteUrl: string;
}) {
  const freeWeek = freeWeekInfo.number;
  // Every week a launch can land in, including a free week further out
  const allWeeks = upcoming.some((w) => w.number === freeWeek)
    ? upcoming
    : [...upcoming, freeWeekInfo];
  const firstOpen =
    upcoming.find((w) => premiumSpots[w.number] > 0)?.number ?? freeWeek;
  const fresh = (): Form =>
    paymentsReady
      ? { ...empty, week: firstOpen }
      : { ...empty, plan: "free", week: freeWeek };

  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(fresh);
  const [showErrors, setShowErrors] = useState(false);
  // The saved launch, once submitted, for the share kit
  const [done, setDone] = useState<{
    id: string;
    slug: string;
    week: number;
  } | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [submitting, startSubmit] = useTransition();
  // Each week has one Boost; it's switched off for weeks where it's sold
  const boostSold = !!boostTaken[form.week];
  const boost = form.boost && !boostSold;

  const upload = async (file: File, kind: string) => {
    if (!user) throw new Error("Please sign in again.");
    setUploading((n) => n + 1);
    try {
      return await uploadImage(file, user.id, kind);
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const submit = () => {
    setError("");
    startSubmit(async () => {
      const yearOf = allWeeks.find((w) => w.number === form.week)!.year;
      const res = await createLaunch({
        name: form.name,
        website: form.website,
        tagline: form.tagline,
        description: form.description,
        categories: form.categories,
        logo: form.logo,
        shots: form.shots,
        plan: form.plan,
        week: { year: yearOf, number: form.week },
        boost,
        highlights: form.highlights,
        faqs: form.faqs,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.checkoutUrl) window.location.assign(res.checkoutUrl);
      else setDone({ id: res.id, slug: res.slug, week: res.week });
    });
  };

  const errors = showErrors ? errorsFor(step, form) : {};
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const next = () => {
    if (Object.keys(errorsFor(step, form)).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step === steps.length - 1) submit();
    else setStep(step + 1);
  };

  const toggleCategory = (c: string) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : f.categories.length < 3
          ? [...f.categories, c]
          : f.categories,
    }));

  const addShots = async (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, MAX_SHOTS - form.shots.length);
    setError("");
    for (const file of picked) {
      try {
        const url = await upload(file, "shot");
        setForm((f) => ({
          ...f,
          shots: [...f.shots, url].slice(0, MAX_SHOTS),
        }));
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };
  const moveShot = (i: number) =>
    setForm((f) => {
      const shots = [...f.shots];
      [shots[i - 1], shots[i]] = [shots[i], shots[i - 1]];
      return { ...f, shots };
    });
  const removeShot = (i: number) =>
    setForm((f) => ({ ...f, shots: f.shots.filter((_, j) => j !== i) }));

  const week = allWeeks.find((w) => w.number === form.week)!;
  const total =
    (form.plan === "premium" ? PREMIUM_PRICE : 0) + (boost ? BOOST_PRICE : 0);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
        <span className="badge-pop flex size-14 items-center justify-center rounded-2xl bg-emerald-300 text-slate-900">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          {form.name} is in the queue!
        </h2>
        <p className="mt-2 max-w-md text-slate-500">
          We&apos;ll review it within 24 hours. It goes live on Monday of Week{" "}
          {done.week} ({weekLabel(done.week)}).{" "}
          {form.plan === "premium" &&
            "Your Premium launch is pinned at the top."}
        </p>
        <div className="mt-6 flex gap-2">
          <Link
            href="/dashboard"
            className="btn-pop flex h-10 items-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Go to my launches
          </Link>
          <button
            type="button"
            onClick={() => {
              setForm(fresh());
              setStep(0);
              setDone(null);
            }}
            className="btn-pop flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-900"
          >
            Submit another
          </button>
        </div>

        <div className="mt-10 w-full max-w-2xl border-t border-slate-100 pt-8">
          <h3 className="text-lg font-semibold text-slate-900">
            Tell people you&apos;re launching
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Share your card now, so your supporters are ready to upvote on
            launch day.
          </p>
          <div className="mt-5">
            <ShareKit
              productId={done.id}
              slug={done.slug}
              name={form.name}
              tagline={form.tagline}
              website={form.website}
              week={done.week}
              free={form.plan === "free"}
              siteUrl={siteUrl}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        {/* Step indicator */}
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  i < step
                    ? "bg-emerald-300 text-slate-900"
                    : i === step
                      ? "badge-pop bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  i === step ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <span className="h-px flex-1 bg-slate-200" />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-7 space-y-5">
          {step === 0 && (
            <>
              <Field label="Product name" error={errors.name}>
                <input
                  className={input}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. StudyFlow"
                  maxLength={40}
                />
              </Field>
              <Field label="Website" error={errors.website}>
                <input
                  className={input}
                  type="url"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://yourproduct.com"
                />
              </Field>
              <Field
                label="Tagline"
                hint={`${form.tagline.length}/60`}
                error={errors.tagline}
              >
                <input
                  className={input}
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="What it does, in one short line"
                  maxLength={60}
                />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <span className="text-sm font-semibold text-slate-900">
                  Logo
                </span>
                <label className="mt-1.5 flex cursor-pointer items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-slate-300 p-4 transition hover:border-brand-400 hover:bg-brand-50/40">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      className="size-14 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <ImagePlus className="size-6" />
                    </span>
                  )}
                  <span className="text-sm">
                    <span className="font-semibold text-brand-700">
                      Upload a logo
                    </span>
                    <span className="block text-xs text-slate-400">
                      Square PNG or JPG, at least 240×240
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setError("");
                      try {
                        set("logo", await upload(file, "logo"));
                      } catch (err) {
                        setError((err as Error).message);
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <span className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Screenshots
                  </span>
                  <span className="text-xs text-slate-400">
                    {form.shots.length}/{MAX_SHOTS} · first one is the cover
                  </span>
                </span>
                {form.shots.length > 0 && (
                  <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {form.shots.map((src, i) => (
                      <li
                        key={src}
                        className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file */}
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className="size-full object-cover"
                        />
                        {i === 0 && (
                          <span className="badge-pop absolute left-1.5 top-1.5 rounded-md bg-amber-300 px-1.5 py-px text-[10px] font-bold uppercase text-slate-900">
                            Cover
                          </span>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 flex gap-1">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveShot(i)}
                              aria-label={`Move screenshot ${i + 1} left`}
                              className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                            >
                              <ChevronLeft className="size-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeShot(i)}
                            aria-label={`Remove screenshot ${i + 1}`}
                            className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow-sm hover:bg-white"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {form.shots.length < MAX_SHOTS && (
                  <label
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addShots(e.dataTransfer.files);
                    }}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
                  >
                    <ImagePlus className="size-6 text-slate-400" />
                    <span className="mt-2 text-sm font-semibold text-brand-700">
                      Drop images here or click to upload
                    </span>
                    <span className="text-xs text-slate-400">
                      Up to {MAX_SHOTS} images · 1270×760 works best
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        addShots(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <Field
                label="Description"
                hint={`${form.description.length}/500`}
                error={errors.description}
              >
                <textarea
                  className={`${input} h-32 resize-none py-3`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Who is it for, what problem does it solve, and what makes it different?"
                  maxLength={500}
                />
              </Field>
              <div>
                <span className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Categories
                  </span>
                  <span className="text-xs text-slate-400">Up to 3</span>
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productCategories.map((c) => {
                    const on = form.categories.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCategory(c.name)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          on
                            ? "badge-pop bg-brand-500 text-white"
                            : "border-[1.5px] border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                {errors.categories && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {errors.categories}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <span className="text-sm font-semibold text-slate-900">
                  Choose a plan
                </span>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {plans.map((p) => {
                    const on = form.plan === p.id;
                    const premium = p.id === "premium";
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        // Premium needs payments to be set up
                        disabled={premium && !paymentsReady}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            plan: p.id,
                            week:
                              p.id === "free"
                                ? freeWeek
                                : premiumSpots[f.week] > 0
                                  ? f.week
                                  : firstOpen,
                          }))
                        }
                        className={`relative flex flex-col rounded-2xl p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          on
                            ? "badge-pop bg-brand-50"
                            : "border-[1.5px] border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {premium && (
                          <span className="badge-pop absolute -top-2.5 right-3 rounded-md bg-amber-300 px-1.5 py-px text-[10px] font-bold uppercase text-slate-900">
                            Most popular
                          </span>
                        )}
                        <span className="flex items-start justify-between gap-2">
                          <span>
                            <span className="flex items-center gap-2 font-semibold text-slate-900">
                              <p.icon className="size-4 text-brand-600" />
                              {p.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {p.blurb}
                            </span>
                          </span>
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                              on
                                ? "border-slate-900 bg-brand-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {on && <Check className="size-3" strokeWidth={3} />}
                          </span>
                        </span>
                        <span className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-bold tracking-tight text-slate-900">
                            ${p.price}
                          </span>
                          <span className="text-xs text-slate-500">
                            {premium ? "one-time" : "forever"}
                          </span>
                        </span>
                        <span className="mt-3 block space-y-1.5 border-t border-slate-200/70 pt-3">
                          {p.features.map(([text, yes]) => (
                            <span
                              key={text}
                              className={`flex items-start gap-2 text-xs ${
                                yes ? "text-slate-700" : "text-slate-400"
                              }`}
                            >
                              <span
                                className={`mt-px flex size-4 shrink-0 items-center justify-center rounded-full ${
                                  yes
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {yes ? (
                                  <Check className="size-2.5" strokeWidth={3} />
                                ) : (
                                  <X className="size-2.5" strokeWidth={3} />
                                )}
                              </span>
                              <span className={yes ? "" : "line-through"}>
                                {text}
                              </span>
                            </span>
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Why go Premium?
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {reasons.map((r) => (
                    <div key={r.title} className="flex gap-2.5">
                      <span className="badge-pop flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-slate-900">
                        <r.icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {r.title}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {r.text}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold text-slate-900">
                  Launch week
                </span>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {upcoming.map((w) => {
                    const premium = form.plan === "premium";
                    const left = premiumSpots[w.number] ?? 0;
                    const soldOut = premium && left === 0;
                    const locked = !premium && w.number !== freeWeek;
                    const on = form.week === w.number;
                    return (
                      <button
                        key={w.number}
                        type="button"
                        disabled={soldOut || locked}
                        aria-pressed={on}
                        onClick={() => set("week", w.number)}
                        className={`relative rounded-xl p-3 text-left transition disabled:cursor-not-allowed ${
                          on
                            ? "badge-pop bg-brand-500 text-white"
                            : soldOut || locked
                              ? "border-[1.5px] border-slate-200 bg-slate-50 text-slate-400"
                              : "border-[1.5px] border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            Week {w.number}
                          </span>
                          {on && <Check className="size-4" strokeWidth={3} />}
                        </span>
                        <span
                          className={`block text-xs ${on ? "text-white/75" : "text-slate-500"}`}
                        >
                          {w.label}
                        </span>
                        {premium ? (
                          <>
                            <span aria-hidden className="mt-2.5 flex gap-1">
                              {Array.from({ length: PREMIUM_CAPACITY }).map(
                                (_, i) => (
                                  <span
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full ${
                                      i < PREMIUM_CAPACITY - left
                                        ? on
                                          ? "bg-white/35"
                                          : "bg-slate-200"
                                        : on
                                          ? "bg-amber-300"
                                          : "bg-emerald-400"
                                    }`}
                                  />
                                ),
                              )}
                            </span>
                            <span
                              className={`mt-1.5 block text-[11px] font-semibold ${
                                on
                                  ? "text-white"
                                  : soldOut
                                    ? "text-rose-600"
                                    : left <= 2
                                      ? "text-amber-700"
                                      : "text-emerald-700"
                              }`}
                            >
                              {soldOut
                                ? "Sold out"
                                : `${left} of ${PREMIUM_CAPACITY} Premium spots left`}
                            </span>
                          </>
                        ) : (
                          <span
                            className={`mt-2.5 block text-[11px] font-semibold ${
                              on ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {locked ? "Premium only" : "Next free opening"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {form.plan === "free" && (
                  <p className="mt-2 text-xs text-slate-500">
                    Free launches get the next open week: yours is{" "}
                    <strong className="text-slate-700">
                      Week {freeWeekInfo.number} ({freeWeekInfo.label})
                    </strong>
                    . Each week has {WEEK_CAPACITY} spots. Go Premium to choose
                    any week.
                  </p>
                )}
              </div>

              <label
                className={`flex items-start gap-3 rounded-2xl p-4 transition ${
                  boostSold
                    ? "cursor-not-allowed border-[1.5px] border-dashed border-slate-200 bg-slate-50 opacity-70"
                    : boost
                      ? "cursor-pointer badge-pop bg-brand-50"
                      : "border-[1.5px] border-dashed border-slate-300 hover:border-brand-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={boost}
                  disabled={!paymentsReady || boostSold}
                  onChange={(e) => set("boost", e.target.checked)}
                  className="mt-1 size-4 accent-brand-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Rows3 className="size-4 text-brand-600" />
                      Add a center feed ad
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      +${BOOST_PRICE}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {boostSold
                      ? `Sold out for Week ${week.number}: there's one per week. Pick another week to add it.`
                      : `Extra boost: a sponsor card for your product right after the top 3, all through Week ${week.number}.`}
                  </span>
                </span>
              </label>

              {form.plan === "premium" && (
                <PremiumExtras
                  name={form.name}
                  highlights={form.highlights}
                  faqs={form.faqs}
                  onHighlights={(v) => set("highlights", v)}
                  onFaqs={(v) => set("faqs", v)}
                />
              )}
            </>
          )}

          {step === 3 && (
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
              {[
                ["Product", form.name],
                ["Website", form.website],
                ["Tagline", form.tagline],
                ["Categories", form.categories.join(", ")],
                [
                  "Plan",
                  form.plan === "premium"
                    ? "Premium launch · $29"
                    : "Free launch",
                ],
                ["Launch week", `Week ${week.number} · ${week.label}`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 px-4 py-3">
                  <dt className="w-28 shrink-0 text-slate-500">{k}</dt>
                  <dd className="min-w-0 break-words font-medium text-slate-900">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {step === 3 && (
            <section
              aria-label="Order summary"
              className="badge-pop rounded-2xl bg-white p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                Order summary
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex justify-between gap-3">
                  <span className="text-slate-600">
                    {form.plan === "premium" ? "Premium launch" : "Free launch"}{" "}
                    · Week {week.number}
                  </span>
                  <span className="font-medium tabular-nums text-slate-900">
                    ${form.plan === "premium" ? PREMIUM_PRICE : 0}
                  </span>
                </li>
                {boost && (
                  <li className="flex justify-between gap-3">
                    <span className="text-slate-600">
                      Center feed ad · Week {week.number}
                    </span>
                    <span className="font-medium tabular-nums text-slate-900">
                      ${BOOST_PRICE}
                    </span>
                  </li>
                )}
              </ul>
              <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
                <span>Total today</span>
                <span className="tabular-nums">${total}</span>
              </p>
              <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <Lock className="mt-px size-3.5 shrink-0" />
                {total > 0
                  ? "Secure card checkout. Full refund any time before your launch goes live."
                  : "No card needed. You can upgrade to Premium before your week starts."}
              </p>
            </section>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => {
                setShowErrors(false);
                setStep(step - 1);
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={submitting || uploading > 0}
            className={`btn-pop flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold disabled:opacity-70 ${
              step === steps.length - 1
                ? "bg-amber-300 text-slate-900 hover:bg-amber-200"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {step === steps.length - 1
              ? total > 0
                ? `Pay $${total} & submit`
                : "Submit for free"
              : uploading > 0
                ? "Uploading…"
                : "Continue"}
            {submitting || uploading > 0 ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
      </form>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Preview on the board
        </p>
        <BoardPreview form={{ ...form, boost }} upcoming={upcoming} />
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Launching Week {week.number} · {week.label}. Need help?{" "}
          <Link
            href="/contact"
            className="font-medium text-brand-700 underline"
          >
            Contact us
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}

// Mini copy of the home board, showing where the product will appear
function BoardPreview({ form, upcoming }: { form: Form; upcoming: Week[] }) {
  const premium = form.plan === "premium";
  const tags = form.categories.length ? form.categories : ["Category"];

  const yourRow = (
    <li
      className={`flex items-center gap-2.5 px-3 py-4 ${
        premium
          ? "bg-gradient-to-r from-brand-50 via-brand-50/40 to-white"
          : "bg-white"
      }`}
    >
      <span className="flex w-8 shrink-0 justify-center">
        {premium ? (
          <span className="badge-pop rounded-md bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            1st
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-300">—</span>
        )}
      </span>
      {form.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
        <img
          src={form.logo}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-bold text-white">
          {form.name.trim()[0]?.toUpperCase() ?? "?"}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-slate-900">
            {form.name || "Your product"}
          </span>
          {premium && (
            <>
              <BadgeCheck
                className="size-3.5 shrink-0 fill-sky-500 text-white"
                aria-label="Verified maker"
              />
              <span className="badge-pop shrink-0 rounded bg-amber-300 px-1 text-[8px] font-bold uppercase leading-4 text-slate-900">
                Premium
              </span>
            </>
          )}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {form.tagline || "Your tagline shows here"}
        </span>
        <span className="mt-1 flex gap-1">
          {tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500"
            >
              #{t.toLowerCase().replace(/\s+/g, "")}
            </span>
          ))}
        </span>
      </span>
      {premium && (
        <span className="badge-pop flex h-7 shrink-0 items-center gap-0.5 rounded-md bg-amber-300 px-1.5 text-[10px] font-bold text-slate-900">
          Visit <ArrowUpRight className="size-3" />
        </span>
      )}
      <span className="badge-pop flex h-11 w-9 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-white text-xs font-bold text-slate-900">
        <Triangle className="size-2.5 fill-current" />0
      </span>
    </li>
  );

  const ghostRow = (
    <li aria-hidden className="flex items-center gap-2.5 px-3 py-4 opacity-45">
      <span className="w-8 shrink-0 text-center text-xs font-semibold text-slate-300">
        {premium ? "02" : "01"}
      </span>
      <span className="size-10 shrink-0 rounded-full bg-slate-200" />
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block h-2.5 w-20 rounded bg-slate-200" />
        <span className="block h-2 w-32 rounded bg-slate-100" />
      </span>
      <span className="h-11 w-9 shrink-0 rounded-lg border-[1.5px] border-slate-200" />
    </li>
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 p-2 text-xs font-medium">
        {upcoming.map((w) => (
          <span
            key={w.number}
            className={`rounded-md px-2 py-1 ${
              w.number === form.week
                ? "badge-pop bg-brand-500 text-white"
                : "text-slate-400"
            }`}
          >
            W{w.number}
          </span>
        ))}
      </div>
      <ol className="divide-y divide-slate-100">
        {premium ? (
          <>
            {yourRow}
            {ghostRow}
          </>
        ) : (
          <>
            {ghostRow}
            {yourRow}
          </>
        )}
        {form.boost && (
          <li className="p-2.5">
            <span className="block rounded-xl bg-gradient-to-br from-indigo-950 via-brand-700 to-fuchsia-600 p-3 text-white">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70">
                Partner · your ad
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">
                {form.name || "Your product"} — {form.tagline || "your tagline"}
              </span>
            </span>
          </li>
        )}
      </ol>
      <p className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500">
        {premium
          ? "Premium: pinned at the top all week."
          : "Free: ranked by upvotes among other launches."}
      </p>
    </div>
  );
}

// Premium makers explain why to pick them and answer common questions.
// Both show on the product page, and the FAQ is marked up for search and AI answers.
export function PremiumExtras({
  name,
  highlights,
  faqs,
  onHighlights,
  onFaqs,
}: {
  name: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  onHighlights: (v: string[]) => void;
  onFaqs: (v: { q: string; a: string }[]) => void;
}) {
  const product = name.trim() || "your product";
  return (
    <section className="space-y-5 rounded-2xl border-[1.5px] border-amber-300 bg-amber-50/50 p-4 sm:p-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Crown className="size-4 text-amber-600" />
          Make your page stand out
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Premium only. These show on your product page, and help Google and AI
          assistants like ChatGPT understand and recommend {product}.
        </p>
      </div>

      <div>
        <span className="text-sm font-semibold text-slate-900">
          Why choose {product}?
        </span>
        <span className="block text-xs text-slate-400">
          Short points, like &ldquo;Works offline&rdquo; or &ldquo;Free for
          students&rdquo;
        </span>
        <ul className="mt-2 space-y-2">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-2">
              <input
                className={input}
                value={h}
                maxLength={120}
                placeholder={`Reason ${i + 1}`}
                onChange={(e) =>
                  onHighlights(
                    highlights.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
              />
              {highlights.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove reason ${i + 1}`}
                  onClick={() =>
                    onHighlights(highlights.filter((_, j) => j !== i))
                  }
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-rose-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {highlights.length < MAX_EXTRAS && (
          <button
            type="button"
            onClick={() => onHighlights([...highlights, ""])}
            className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
          >
            + Add a reason
          </button>
        )}
      </div>

      <div>
        <span className="text-sm font-semibold text-slate-900">
          Frequently asked questions
        </span>
        <span className="block text-xs text-slate-400">
          What do people usually ask before trying {product}?
        </span>
        <ul className="mt-2 space-y-3">
          {faqs.map((f, i) => (
            <li
              key={i}
              className="space-y-2 rounded-xl bg-white p-3 ring-1 ring-slate-200"
            >
              <div className="flex gap-2">
                <input
                  className={input}
                  value={f.q}
                  maxLength={120}
                  placeholder="Question, e.g. Is there a free plan?"
                  onChange={(e) =>
                    onFaqs(
                      faqs.map((x, j) =>
                        j === i ? { ...x, q: e.target.value } : x,
                      ),
                    )
                  }
                />
                {faqs.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove question ${i + 1}`}
                    onClick={() => onFaqs(faqs.filter((_, j) => j !== i))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <textarea
                className={`${input} h-20 resize-none py-2.5`}
                value={f.a}
                maxLength={500}
                placeholder="Answer"
                onChange={(e) =>
                  onFaqs(
                    faqs.map((x, j) =>
                      j === i ? { ...x, a: e.target.value } : x,
                    ),
                  )
                }
              />
            </li>
          ))}
        </ul>
        {faqs.length < MAX_EXTRAS && (
          <button
            type="button"
            onClick={() => onFaqs([...faqs, { q: "", a: "" }])}
            className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
          >
            + Add a question
          </button>
        )}
      </div>
    </section>
  );
}
