"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { updateLaunch, type LaunchEdit } from "@/lib/actions/launches";
import { productCategories } from "@/lib/data";
import { uploadImage } from "@/lib/upload";
import { PremiumExtras } from "./SubmitForm";

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

const MAX_SHOTS = 5;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

// Everything a maker can change about a launch after submitting it
export function EditLaunchForm({
  productId,
  userId,
  slug,
  premium,
  approved,
  initial,
}: {
  productId: string;
  userId: string;
  slug: string;
  premium: boolean;
  // Approved launches go back to review if the website changes
  approved: boolean;
  initial: LaunchEdit;
}) {
  const router = useRouter();
  const [form, setForm] = useState<LaunchEdit>({
    ...initial,
    highlights: initial.highlights.length ? initial.highlights : ["", "", ""],
    faqs: initial.faqs.length ? initial.faqs : [{ q: "", a: "" }],
  });
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof LaunchEdit>(key: K, value: LaunchEdit[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  const upload = async (file: File, kind: string) => {
    setUploading((n) => n + 1);
    try {
      return await uploadImage(file, userId, kind);
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const toggleCategory = (c: string) =>
    set(
      "categories",
      form.categories.includes(c)
        ? form.categories.filter((x) => x !== c)
        : form.categories.length < 3
          ? [...form.categories, c]
          : form.categories,
    );

  const websiteChanged = form.website.trim() !== initial.website;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await updateLaunch(productId, form);
          if (!res.ok) {
            setMessage({ ok: false, text: res.error });
            return;
          }
          setMessage({
            ok: true,
            text:
              approved && res.inReview
                ? "Saved. Your new website will be checked before your launch shows again."
                : "Saved. Your launch page is updated.",
          });
          router.refresh();
        });
      }}
    >
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name">
            <input
              className={input}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={40}
            />
          </Field>
          <Field label="Website">
            <input
              className={input}
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
        </div>
        {approved && websiteChanged && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Changing the website sends your launch back for a quick review.
          </p>
        )}
        <Field label="Tagline" hint={`${form.tagline.length}/60`}>
          <input
            className={input}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            maxLength={60}
          />
        </Field>
        <Field label="Description" hint={`${form.description.length}/1000`}>
          <textarea
            className={`${input} h-36 resize-none py-3`}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={1000}
          />
        </Field>
        <div>
          <span className="text-sm font-semibold text-slate-900">
            Categories{" "}
            <span className="font-normal text-slate-400">(up to 3)</span>
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
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
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
        </div>
      </section>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Logo and screenshots</h2>
        <div className="flex flex-wrap items-center gap-4">
          {form.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- maker-uploaded logo
            <img
              src={form.logo}
              alt="Logo"
              className="size-16 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ImagePlus className="size-6" />
            </span>
          )}
          <label className="btn-pop flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900">
            <ImagePlus className="size-3.5" />
            {form.logo ? "Change logo" : "Upload logo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  set("logo", await upload(file, "logo"));
                } catch (err) {
                  setMessage({ ok: false, text: (err as Error).message });
                }
              }}
            />
          </label>
          {form.logo && (
            <button
              type="button"
              onClick={() => set("logo", null)}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              Remove
            </button>
          )}
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
                  className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- maker-uploaded screenshot */}
                  <img
                    src={src}
                    alt={`Screenshot ${i + 1}`}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                    {i > 0 ? (
                      <button
                        type="button"
                        aria-label="Move left"
                        onClick={() => {
                          const shots = [...form.shots];
                          [shots[i - 1], shots[i]] = [shots[i], shots[i - 1]];
                          set("shots", shots);
                        }}
                        className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      aria-label="Remove screenshot"
                      onClick={() =>
                        set(
                          "shots",
                          form.shots.filter((_, j) => j !== i),
                        )
                      }
                      className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 shadow"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {form.shots.length < MAX_SHOTS && (
            <label className="btn-pop mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900">
              <ImagePlus className="size-3.5" />
              Add screenshots
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []).slice(
                    0,
                    MAX_SHOTS - form.shots.length,
                  );
                  e.target.value = "";
                  for (const file of files) {
                    try {
                      const url = await upload(file, "shot");
                      setForm((f) => ({
                        ...f,
                        shots: [...f.shots, url].slice(0, MAX_SHOTS),
                      }));
                    } catch (err) {
                      setMessage({ ok: false, text: (err as Error).message });
                    }
                  }
                }}
              />
            </label>
          )}
        </div>
      </section>

      {premium ? (
        <PremiumExtras
          name={form.name}
          highlights={form.highlights}
          faqs={form.faqs}
          onHighlights={(v) => set("highlights", v)}
          onFaqs={(v) => set("faqs", v)}
        />
      ) : (
        <p className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-500">
          Want &ldquo;Why choose&rdquo; points and your own FAQ on your page?
          They come with Premium. Upgrade from{" "}
          <Link
            href="/dashboard"
            className="font-semibold text-brand-700 hover:underline"
          >
            My launches
          </Link>
          .
        </p>
      )}

      <div className="badge-pop sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 pl-4">
        <p
          className={`text-xs ${
            message?.ok === false
              ? "text-rose-600"
              : message?.ok
                ? "text-emerald-700"
                : "text-slate-500"
          }`}
        >
          {message?.text ??
            (uploading > 0
              ? "Uploading images…"
              : "Remember to save your changes.")}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/products/${slug}`}
            className="flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            View page <ArrowUpRight className="size-4" />
          </Link>
          <button
            type="submit"
            disabled={pending || uploading > 0}
            className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
