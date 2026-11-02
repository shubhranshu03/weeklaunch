"use client";

import { useState } from "react";
import { Check, ImagePlus, Info, Trash2 } from "lucide-react";

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {note && <p className="mt-0.5 text-sm text-slate-500">{note}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-[1.5px] border-slate-900 transition ${
          on ? "bg-brand-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [notify, setNotify] = useState({
    launch: true,
    comments: true,
    newsletter: false,
  });
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <Card title="Profile" note="This is what other makers see.">
        <div className="flex items-center gap-4">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
            <img
              src={photo}
              alt="Profile photo preview"
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-2xl font-bold text-slate-900">
              A
            </span>
          )}
          <label className="btn-pop flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900">
            <ImagePlus className="size-3.5" />
            Change photo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={input}
              defaultValue="Ashu M."
              autoComplete="name"
            />
          </Field>
          <Field label="Username">
            <span className="flex">
              <span className="flex items-center rounded-l-xl border-[1.5px] border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                @
              </span>
              <input
                className={`${input} rounded-l-none`}
                defaultValue="ashubuilds"
              />
            </span>
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            className={`${input} h-24 resize-none py-3`}
            defaultValue="Indie maker building tools for students and small teams. Shipping something new every month."
            maxLength={160}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website">
            <input
              className={input}
              type="url"
              defaultValue="https://example.com"
            />
          </Field>
          <Field label="X (Twitter) username">
            <input className={input} defaultValue="ashubuilds" />
          </Field>
        </div>
        <Field label="Location">
          <input className={input} defaultValue="India" />
        </Field>
      </Card>

      <Card title="Account">
        <Field label="Email">
          <input
            className={input}
            type="email"
            defaultValue="you@company.com"
            autoComplete="email"
          />
        </Field>
        <button
          type="button"
          className="btn-pop flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-900"
        >
          Change password
        </button>
      </Card>

      <Card title="Email notifications">
        <Toggle
          label="Launch updates"
          hint="When your launch goes live or gets approved."
          on={notify.launch}
          onChange={(v) => setNotify((n) => ({ ...n, launch: v }))}
        />
        <Toggle
          label="New comments"
          hint="When someone comments on your product."
          on={notify.comments}
          onChange={(v) => setNotify((n) => ({ ...n, comments: v }))}
        />
        <Toggle
          label="The Monday Launch newsletter"
          hint="Last week's top products, every Monday."
          on={notify.newsletter}
          onChange={(v) => setNotify((n) => ({ ...n, newsletter: v }))}
        />
      </Card>

      <div className="badge-pop sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 pl-4">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          {saved ? (
            <>
              <Info className="size-4 shrink-0 text-amber-600" />
              Preview only — changes will save once accounts are connected.
            </>
          ) : (
            "Remember to save your changes."
          )}
        </p>
        <button
          type="submit"
          className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
        >
          <Check className="size-4" />
          Save changes
        </button>
      </div>

      <section className="rounded-3xl border-[1.5px] border-rose-200 bg-rose-50/50 p-5 sm:p-6">
        <h2 className="font-semibold text-rose-700">Delete account</h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Removes your profile, launches and comments for good. This can&apos;t
          be undone.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white"
            >
              <Trash2 className="size-4" />
              Yes, delete my account
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-4 flex h-10 items-center gap-1.5 rounded-xl border-[1.5px] border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="size-4" />
            Delete account
          </button>
        )}
      </section>
    </form>
  );
}
