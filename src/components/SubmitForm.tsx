"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  AppWindow,
  Apple,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronUp,
  Crown,
  Globe,
  ImagePlus,
  Laptop,
  Link2,
  Loader2,
  Lock,
  Megaphone,
  Pin,
  Puzzle,
  Rocket,
  Rows3,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { autofillFromSite, type AutofillFields } from "@/lib/actions/autofill";
import { createLaunch } from "@/lib/actions/launches";
import {
  BOOST_PRICE,
  PREMIUM_CAPACITY,
  PREMIUM_PRICE,
  productCategories,
} from "@/lib/data";
import { platformLabel, webApp, type PlatformInfo } from "@/lib/platforms";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/lib/useAuth";
import { dayLabel, type Day } from "@/lib/days";
import {
  cleanDeal,
  dealLabel,
  emptyDeal,
  hasDeal,
  type Deal,
} from "@/lib/deals";
import { AdvertiseOptions } from "./AdvertiseOptions";
import { DealFields } from "./DealFields";
import { BadgeStep } from "./BadgeStep";
import { PlatformFields, platformIncomplete } from "./PlatformFields";
import { ShareKit } from "./ShareKit";

// Two pages: the listing (drafted from the maker's site), then how to launch
type Phase = "listing" | "launch";

type Form = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  categories: string[];
  logo: string | null;
  shots: string[];
  plan: "free" | "premium";
  day: number;
  boost: boolean;
  // Premium only: shown on the product page and to search engines
  highlights: string[];
  faqs: { q: string; a: string }[];
  app: PlatformInfo;
  deal: Deal;
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
  day: 0,
  boost: false,
  highlights: ["", "", ""],
  faqs: [{ q: "", a: "" }],
  app: webApp,
  deal: emptyDeal,
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
      ["One free product per account", true],
      ["Waits in the free queue (about a week)", true],
      ["Your own product page", true],
      ["Upvotes, comments and reviews", true],
      ["Backlink after you add our badge", true],
      ["Launch today or pick your day", false],
      ["Featured at the top for 7 days", false],
      ["PREMIUM tag and Visit button", false],
      ["Blue verified tick on your profile", false],
      ["Mention in the Monday newsletter", false],
    ],
  },
  {
    id: "premium",
    title: "Premium launch",
    price: PREMIUM_PRICE,
    blurb: "Live today, featured for a week",
    icon: Crown,
    features: [
      ["Goes live right away, no review wait", true],
      ["Your own product page", true],
      ["Upvotes, comments and reviews", true],
      ["Dofollow backlink, no badge needed", true],
      ["Launch today or pick your day", true],
      ["Featured at the top for 7 days", true],
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
    text: "Featured above free launches for 7 days.",
  },
  {
    icon: CalendarCheck,
    title: "Your timing",
    text: "Go live today, or the day you're ready. No queue.",
  },
  {
    icon: Link2,
    title: "Lasting traffic",
    text: "A dofollow backlink plus a newsletter mention.",
  },
];

const input =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

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
        <span
          data-error
          className="mt-1 block text-xs font-medium text-rose-600"
        >
          {error}
        </span>
      )}
    </label>
  );
}

// One numbered card of the listing page
function Section({
  n,
  title,
  text,
  children,
}: {
  n: number;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {n}
        </span>
        <span>
          <span className="block font-semibold text-slate-900">{title}</span>
          <span className="block text-sm text-slate-500">{text}</span>
        </span>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

// How much the description tells people and AI assistants
function DescriptionStrength({ text }: { text: string }) {
  const n = text.trim().length;
  const level =
    n < 120
      ? {
          label: "Weak",
          width: "30%",
          bar: "bg-orange-500",
          ink: "text-orange-600",
        }
      : n < 300
        ? {
            label: "Good",
            width: "65%",
            bar: "bg-amber-400",
            ink: "text-amber-600",
          }
        : {
            label: "Strong",
            width: "100%",
            bar: "bg-emerald-500",
            ink: "text-emerald-600",
          };
  return (
    <div className="-mt-2">
      <div className="flex items-center gap-3">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <span
            className={`block h-full rounded-full transition-all ${level.bar}`}
            style={{ width: n === 0 ? "0%" : level.width }}
          />
        </span>
        <span className={`text-xs font-medium ${level.ink}`}>
          {level.label}
        </span>
      </div>
      {level.label !== "Strong" && (
        <p className={`mt-1 text-xs ${level.ink}`}>
          Say what problem it solves and how it works. That helps people and AI
          assistants understand your product.
        </p>
      )}
    </div>
  );
}

const previewIcon = {
  web: Globe,
  mac: Laptop,
  ios: Apple,
  android: Smartphone,
  chrome: Puzzle,
  windows: AppWindow,
} as const;

// The launch card as it will look in the feed, updated as the maker types
function PreviewCard({ form }: { form: Form }) {
  const Icon =
    previewIcon[form.app.platform as keyof typeof previewIcon] ?? null;
  const name = form.name.trim() || "Your product";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center">
          {form.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- the maker's logo
            <img
              src={form.logo}
              alt=""
              className="size-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="ml-3 min-w-0 flex-1">
            <p className="flex items-center gap-1.5">
              <span className="truncate font-semibold text-slate-900">
                {name}
              </span>
              {Icon && <Icon className="size-3.5 shrink-0 text-slate-400" />}
            </p>
            <p className="line-clamp-2 text-sm leading-snug text-slate-600">
              {form.tagline.trim() || "Your tagline shows here"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="flex flex-col items-center rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
            <Bell className="size-4" />
            <span className="text-sm font-medium">0</span>
          </span>
          <span className="flex flex-col items-center rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
            <ChevronUp className="size-4" />
            <span className="text-sm font-medium">0</span>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {form.categories.slice(0, 2).map((c) => (
          <span
            key={c}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            {c}
          </span>
        ))}
        <span className="flex-1" />
        {hasDeal(form.deal) && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            <Tag className="size-3.5" />
            {dealLabel(form.deal)}
          </span>
        )}
        {form.plan === "premium" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
            <Sparkles className="size-3.5" />
            Featured
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          Rate
        </span>
      </div>
    </article>
  );
}

function errorsFor(step: number, f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = "Add your product name.";
    if (!/^https?:\/\/\S+\.\S+/.test(f.website.trim()))
      e.website = "Add a full link, like https://yourproduct.com";
    if (platformIncomplete(f.app)) e.app = "Fill in the Mac app details.";
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
  freeUsed: freeUsedBefore,
  siteUrl,
  initialUrl = "",
  growthPayable = [],
}: {
  // The days a Premium launch can pick (today and the next 30)
  upcoming: Day[];
  // Premium spots still open, by day number
  premiumSpots: Record<number, number>;
  // Days whose one Boost is already sold, by day number
  boostTaken: Record<number, boolean>;
  // Where a free launch goes: a week out, or later if those days are full
  freeWeek: Day;
  paymentsReady: boolean;
  // Each account gets one free product
  freeUsed: boolean;
  // The live address, for share links
  siteUrl: string;
  // The link pasted on the /submit page; we read the site and draft the listing
  initialUrl?: string;
  // Promotion services that can be paid by card (they have a Dodo product)
  growthPayable?: string[];
}) {
  const freeWeek = freeWeekInfo.number;
  // Every day a launch can land on, including a free day further out
  const allWeeks = upcoming.some((w) => w.number === freeWeek)
    ? upcoming
    : [...upcoming, freeWeekInfo];
  const firstOpen =
    upcoming.find((w) => premiumSpots[w.number] > 0)?.number ?? freeWeek;
  const fresh = (): Form =>
    paymentsReady
      ? { ...empty, day: firstOpen }
      : { ...empty, plan: "free", day: freeWeek };

  const { user } = useAuth();
  const [freeUsed, setFreeUsed] = useState(freeUsedBefore);
  const [phase, setPhase] = useState<Phase>("listing");
  // A launch, or paid promotion (ads and done-for-you services)
  const [kind, setKind] = useState<"launch" | "advertise">("launch");
  const [form, setForm] = useState<Form>(() => ({
    ...fresh(),
    website: initialUrl,
  }));
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  const [showErrors, setShowErrors] = useState(false);
  // Premium sees two weeks of days first, then can open the rest
  const [allWeeksOpen, setAllWeeksOpen] = useState(false);
  // The saved launch, once submitted, for the share kit
  const [done, setDone] = useState<{
    id: string;
    slug: string;
    day: number;
  } | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [submitting, startSubmit] = useTransition();
  const [filling, startFill] = useTransition();
  const [fillNote, setFillNote] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  // Each day has one Boost; it's switched off for days where it's sold
  const boostSold = !!boostTaken[form.day];
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
      const yearOf = allWeeks.find((w) => w.number === form.day)!.year;
      const res = await createLaunch({
        name: form.name,
        website: form.website,
        tagline: form.tagline,
        description: form.description,
        categories: form.categories,
        logo: form.logo,
        shots: form.shots,
        plan: form.plan,
        day: { year: yearOf, number: form.day },
        boost,
        highlights: form.highlights,
        faqs: form.faqs,
        app: form.app,
        deal: form.deal,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.checkoutUrl) window.location.assign(res.checkoutUrl);
      else {
        if (form.plan === "free") setFreeUsed(true);
        setDone({ id: res.id, slug: res.slug, day: res.day });
      }
    });
  };

  // Fills only what the maker hasn't typed yet, then says what it filled
  const applyAutofill = (a: AutofillFields) => {
    // The latest form, so anything typed while the site loaded is kept
    const f = formRef.current;
    const next = { ...f };
    const filled: string[] = [];
    if (!f.name.trim() && a.name) {
      next.name = a.name;
      filled.push("name");
    }
    if (!f.tagline.trim() && a.tagline.length >= 10) {
      next.tagline = a.tagline;
      filled.push("tagline");
    }
    if (!f.description.trim() && a.description.length >= 40) {
      next.description = a.description.slice(0, 1000);
      filled.push("description");
    }
    const cats = a.categories.filter((c) =>
      productCategories.some((p) => p.name === c),
    );
    if (f.categories.length === 0 && cats.length) {
      next.categories = cats;
      filled.push("categories");
    }
    if (!f.logo && a.logo) {
      next.logo = a.logo;
      filled.push("logo");
    }
    if (f.shots.length === 0 && a.shots.length) {
      next.shots = a.shots;
      filled.push("cover image");
    }
    if (f.app.platform === "web" && a.app) {
      next.app = a.app;
      filled.push("Mac app details");
    }
    setForm(next);
    return filled;
  };

  const autofill = () => {
    setFillNote(null);
    if (!/^https?:\/\/\S+\.\S+/.test(form.website.trim())) {
      setFillNote({
        ok: false,
        text: "Add your full website link first, like https://yourproduct.com",
      });
      return;
    }
    startFill(async () => {
      const res = await autofillFromSite(form.website);
      if (!res.ok) {
        setFillNote({ ok: false, text: res.error });
        return;
      }
      const filled = applyAutofill(res.fields);
      setFillNote(
        filled.length
          ? {
              ok: true,
              text: `We filled in ${filled.length} ${filled.length === 1 ? "field" : "fields"} from your site (${filled.join(", ")}). Check anything that looks off.`,
            }
          : {
              ok: false,
              text: "We opened your site but there was nothing new to fill in.",
            },
      );
    });
  };

  const listingErrors = (f: Form) => {
    const deal = cleanDeal(f.deal);
    return {
      ...errorsFor(0, f),
      ...errorsFor(1, f),
      ...(!deal.ok && { deal: deal.error }),
    };
  };
  const errors = showErrors && phase === "listing" ? listingErrors(form) : {};
  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const next = () => {
    if (phase === "launch") {
      submit();
      return;
    }
    if (Object.keys(listingErrors(form)).length > 0) {
      setShowErrors(true);
      // Bring the first problem into view
      requestAnimationFrame(() =>
        document
          .querySelector("[data-error]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      return;
    }
    setShowErrors(false);
    setPhase("launch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Draft the listing from the pasted link once, when the form opens
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !initialUrl) return;
    started.current = true;
    autofill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once for the pasted link
  }, []);

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

  const week = allWeeks.find((w) => w.number === form.day)!;
  // Day chips for Premium: two weeks first (plus the chosen day), then all 30
  const pickerWeeks = upcoming.filter(
    (w, i) => allWeeksOpen || i < 14 || w.number === form.day,
  );
  const total =
    (form.plan === "premium" ? PREMIUM_PRICE : 0) + (boost ? BOOST_PRICE : 0);

  if (done && form.plan === "free") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 sm:px-8">
        <div className="text-center">
          <span className="badge-pop inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-300 text-slate-900">
            <CheckCircle2 className="size-7" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
            One last step: add our badge
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-500">
            {form.name} is saved for {dayLabel(done.day)}. Free launches show
            the IndieShip badge on their site. Once it&apos;s found, we review
            your launch and your link becomes a dofollow backlink.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl">
          <BadgeStep
            productId={done.id}
            slug={done.slug}
            website={form.website.trim()}
            next="/dashboard?badge=verified"
          />
          <p className="mt-5 text-center text-sm text-slate-500">
            Need more time?{" "}
            <Link
              href="/dashboard"
              className="font-semibold text-brand-700 hover:underline"
            >
              Do it later from your dashboard
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
          We&apos;ll review it within 24 hours. It goes live on{" "}
          {dayLabel(done.day)}.{" "}
          {form.plan === "premium" &&
            "Your Premium launch is featured at the top for 7 days."}
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
              setPhase("listing");
              setDone(null);
            }}
            className="btn-pop flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-900"
          >
            {freeUsed ? "Launch another with Premium" : "Submit another"}
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
              day={done.day}
              free={form.plan === "free"}
              siteUrl={siteUrl}
            />
          </div>
        </div>
      </div>
    );
  }

  const listing = phase === "listing";
  const title = form.name.trim() || "your product";
  // Built once per render, not as components, so they keep their place in the page
  const errorNote = error ? (
    <p
      role="alert"
      className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
    >
      {error}
    </p>
  ) : null;
  const submitButton = (
    <button
      type="submit"
      form="launch-form"
      disabled={submitting || uploading > 0}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-[15px] font-semibold text-white shadow-[0_0_0_2px_var(--color-brand-200)] transition hover:bg-slate-700 disabled:opacity-70"
    >
      {listing
        ? uploading > 0
          ? "Uploading…"
          : "Save and continue"
        : total > 0
          ? `Pay $${total} & launch`
          : "Launch for free"}
      {submitting || uploading > 0 ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowRight className="size-4" />
      )}
    </button>
  );

  return (
    <div>
      {listing ? (
        <Link
          href="/submit"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Start over
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            setPhase("listing");
            window.scrollTo({ top: 0 });
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to your listing
        </button>
      )}
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {kind === "advertise" ? (
          <>How do you want to promote {title}?</>
        ) : listing ? (
          <>Tell us about {title}</>
        ) : (
          <>How do you want to launch {title}?</>
        )}
      </h1>

      {/* What kind of listing: a launch, or paid promotion */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(
          [
            {
              id: "launch",
              icon: Rocket,
              name: "Standard launch",
              tag: "Free or Premium",
              text: "A permanent listing that people and AI assistants can find.",
            },
            {
              id: "advertise",
              icon: Megaphone,
              name: "Advertise",
              tag: "Paid only",
              text: "Ads, a blog post, directory submission and a founder post.",
            },
          ] as const
        ).map((k) => {
          const on = kind === k.id;
          const paid = k.id === "advertise";
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setKind(k.id);
                setShowErrors(false);
              }}
              className={`flex items-start gap-4 rounded-2xl p-4 text-left transition sm:p-5 ${
                on
                  ? "border-2 border-slate-900 bg-white"
                  : paid
                    ? "border border-brand-300/60 bg-brand-500/5 hover:border-brand-400"
                    : "border border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  on
                    ? "bg-slate-900 text-white"
                    : "bg-brand-500/10 text-brand-600"
                }`}
              >
                <k.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{k.name}</span>
                  {paid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">
                      <Crown className="size-3" />
                      {k.tag}
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {k.tag}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  {k.text}
                </span>
              </span>
              {on ? (
                <CheckCircle2 className="size-5 shrink-0 fill-slate-900 text-white" />
              ) : (
                <span
                  className={`size-5 shrink-0 rounded-full border-2 ${
                    paid ? "border-brand-300" : "border-slate-300"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {kind === "advertise" ? (
        <div className="mt-8">
          <AdvertiseOptions
            productName={form.name.trim()}
            website={form.website.trim()}
            payable={growthPayable}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form
            id="launch-form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
            className="min-w-0"
          >
            {listing && filling && (
              <p className="mb-6 flex items-center gap-2 rounded-xl border border-brand-300/60 bg-brand-500/10 px-4 py-3 text-sm text-brand-700">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Reading your site and drafting your listing…
              </p>
            )}
            {listing && !filling && fillNote && (
              <p
                role="status"
                className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                  fillNote.ok
                    ? "border-brand-300/60 bg-brand-500/10 text-brand-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <Sparkles className="size-4 shrink-0" />
                {fillNote.text}
              </p>
            )}
            <div
              className={
                listing
                  ? "space-y-6"
                  : "space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              }
            >
              {phase === "listing" && (
                <>
                  <Section
                    n={1}
                    title="Basic info"
                    text="Tell people what your product is and make a great first impression."
                  >
                    <Field label="Product name" error={errors.name}>
                      <input
                        className={input}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. StudyFlow"
                        maxLength={40}
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
                    <DescriptionStrength text={form.description} />
                    <div>
                      <Field
                        label="Website"
                        hint="Autofill reads it again"
                        error={errors.website}
                      >
                        <span className="flex flex-col gap-2 sm:flex-row">
                          <input
                            className={input}
                            type="url"
                            value={form.website}
                            onChange={(e) => set("website", e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                autofill();
                              }
                            }}
                            placeholder="https://yourproduct.com"
                          />
                          <button
                            type="button"
                            onClick={autofill}
                            disabled={filling}
                            className="btn-pop flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
                          >
                            {filling ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Wand2 className="size-4" />
                            )}
                            {filling ? "Reading your site…" : "Autofill"}
                          </button>
                        </span>
                      </Field>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">
                        Logo
                      </span>
                      <label className="mt-1.5 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-300 p-4 transition hover:border-brand-400 hover:bg-brand-50/40">
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
                          {form.shots.length}/{MAX_SHOTS} · first one is the
                          cover
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
                          className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/40"
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
                  </Section>
                  <Section
                    n={2}
                    title="Classification"
                    text="Help people and AI assistants find your product: what it is and where it runs."
                  >
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
                                  : "border border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                      {errors.categories && (
                        <p
                          data-error
                          className="mt-1 text-xs font-medium text-rose-600"
                        >
                          {errors.categories}
                        </p>
                      )}
                    </div>
                    <PlatformFields
                      value={form.app}
                      onChange={(v) => set("app", v)}
                      showErrors={!!errors.app}
                    />
                  </Section>
                  <Section
                    n={3}
                    title="Additional info"
                    text="Optional details that help your product stand out."
                  >
                    <DealFields
                      value={form.deal}
                      onChange={(d) => set("deal", d)}
                      error={errors.deal}
                    />
                  </Section>
                </>
              )}

              {phase === "launch" && (
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
                            disabled={premium ? !paymentsReady : freeUsed}
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                plan: p.id,
                                day:
                                  p.id === "free"
                                    ? freeWeek
                                    : premiumSpots[f.day] > 0
                                      ? f.day
                                      : firstOpen,
                              }))
                            }
                            className={`relative flex flex-col rounded-2xl p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              on
                                ? "badge-pop bg-brand-50"
                                : "border border-slate-200 hover:border-slate-300"
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
                                  {!premium && freeUsed
                                    ? "You've used your one free product"
                                    : p.blurb}
                                </span>
                              </span>
                              <span
                                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                  on
                                    ? "border-brand-500 bg-brand-500 text-white"
                                    : "border-slate-300"
                                }`}
                              >
                                {on && (
                                  <Check className="size-3" strokeWidth={3} />
                                )}
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
                                      <Check
                                        className="size-2.5"
                                        strokeWidth={3}
                                      />
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
                    {freeUsed && (
                      <p className="mt-2 text-xs font-medium text-slate-700">
                        Your free product is used. Launch this one with Premium
                        for ${PREMIUM_PRICE}.
                      </p>
                    )}
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
                      Launch day
                    </span>
                    {form.plan === "premium" ? (
                      <>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {pickerWeeks.map((w, i) => {
                            const left = premiumSpots[w.number] ?? 0;
                            const soldOut = left === 0;
                            const on = form.day === w.number;
                            return (
                              <button
                                key={w.number}
                                type="button"
                                disabled={soldOut}
                                aria-pressed={on}
                                onClick={() => set("day", w.number)}
                                className={`rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed ${
                                  on
                                    ? "badge-pop bg-brand-500 text-white"
                                    : soldOut
                                      ? "border border-slate-200 bg-slate-50 text-slate-400"
                                      : "border border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <span className="flex items-center justify-between gap-1 text-sm font-semibold">
                                  {i === 0
                                    ? "Today"
                                    : i === 1
                                      ? "Tomorrow"
                                      : w.label}
                                  {on && (
                                    <Check className="size-4" strokeWidth={3} />
                                  )}
                                </span>
                                <span
                                  className={`block text-[11px] font-semibold ${
                                    on
                                      ? "text-white/80"
                                      : soldOut
                                        ? "text-rose-600"
                                        : "text-emerald-700"
                                  }`}
                                >
                                  {soldOut
                                    ? "Sold out"
                                    : i < 2
                                      ? `${w.label} · ${left} left`
                                      : `${left} of ${PREMIUM_CAPACITY} left`}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {upcoming.length > 14 && !allWeeksOpen && (
                          <button
                            type="button"
                            onClick={() => setAllWeeksOpen(true)}
                            className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
                          >
                            Show {upcoming.length - 14} more days (up to{" "}
                            {upcoming[upcoming.length - 1].label})
                          </button>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                          Paid launches go live as soon as payment goes through.
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                        Free launches wait in the queue. Yours goes live on{" "}
                        <strong className="text-slate-900">
                          {freeWeekInfo.label}
                        </strong>{" "}
                        after a quick review. Go Premium to launch today.
                      </p>
                    )}
                  </div>

                  <label
                    className={`flex items-start gap-3 rounded-2xl p-4 transition ${
                      boostSold
                        ? "cursor-not-allowed border border-dashed border-slate-200 bg-slate-50 opacity-70"
                        : boost
                          ? "cursor-pointer badge-pop bg-brand-50"
                          : "border border-dashed border-slate-300 hover:border-brand-400"
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
                          Add an in-feed ad for a week
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          +${BOOST_PRICE}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {boostSold
                          ? `Booked for part of the week from ${week.label}: one runs at a time. Pick another day to add it.`
                          : `A sponsor card for your product in the home page feed for 7 days from ${week.label}.`}
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

              {phase === "launch" && (
                <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
                  {[
                    ["Product", form.name],
                    ["Website", form.website],
                    ["Tagline", form.tagline],
                    ["Categories", form.categories.join(", ")],
                    ["Platform", platformLabel(form.app.platform)],
                    [
                      "Plan",
                      form.plan === "premium"
                        ? "Premium launch · $29"
                        : "Free launch",
                    ],
                    ["Launch day", week.label],
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

              {phase === "launch" && (
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
                        {form.plan === "premium"
                          ? "Premium launch"
                          : "Free launch"}{" "}
                        · {week.label}
                      </span>
                      <span className="font-medium tabular-nums text-slate-900">
                        ${form.plan === "premium" ? PREMIUM_PRICE : 0}
                      </span>
                    </li>
                    {boost && (
                      <li className="flex justify-between gap-3">
                        <span className="text-slate-600">
                          In-feed ad · 7 days from {week.label}
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

            {/* Phones: the button sits under the form; wide screens show it by the preview */}
            <div className={`mt-6 ${listing ? "lg:hidden" : ""}`}>
              {submitButton}
              {errorNote}
            </div>
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Live preview
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Updates as you type
                </p>
              </div>
              <PreviewCard form={form} />
              {listing ? (
                <>
                  {submitButton}
                  {errorNote}
                  <p className="text-center text-xs text-slate-500">
                    Next you choose how you want to launch.
                  </p>
                </>
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Launching {week.label}. Need help?{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-brand-700 underline"
                  >
                    Contact us
                  </Link>
                  .
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
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
    <section className="space-y-5 rounded-2xl border border-amber-300 bg-amber-50/50 p-4 sm:p-5">
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
