"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ImagePlus, Info, Loader2, LogOut, Trash2 } from "lucide-react";
import { deleteAccount, updateProfile } from "@/lib/actions/account";
import type { Profile } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { setSessionUser } from "@/lib/useAuth";

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

export function SettingsForm({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: profile.name,
    handle: profile.handle,
    bio: profile.bio,
    website: profile.website,
    x_handle: profile.x_handle,
    location: profile.location,
    avatar_url: profile.avatar_url,
    notify: profile.notify,
  });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await updateProfile(form);
          if (res.ok) {
            setSessionUser({
              name: form.name || form.handle,
              handle: form.handle,
              avatar: form.avatar_url,
            });
            router.refresh();
          }
          setMessage(
            res.ok
              ? { ok: true, text: "Saved." }
              : { ok: false, text: res.error },
          );
        });
      }}
    >
      <Card title="Profile" note="This is what other makers see.">
        <div className="flex items-center gap-4">
          {form.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google or uploaded profile photo
            <img
              src={form.avatar_url}
              alt="Profile photo"
              referrerPolicy="no-referrer"
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-2xl font-bold text-slate-900">
              {(form.name || form.handle)[0]?.toUpperCase()}
            </span>
          )}
          <label className="btn-pop flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900">
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
            Change photo
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setUploading(true);
                try {
                  set(
                    "avatar_url",
                    await uploadImage(file, profile.id, "avatar"),
                  );
                } catch (err) {
                  setMessage({ ok: false, text: (err as Error).message });
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={input}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={50}
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
                value={form.handle}
                onChange={(e) => set("handle", e.target.value.toLowerCase())}
                maxLength={20}
                autoCapitalize="none"
              />
            </span>
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            className={`${input} h-24 resize-none py-3`}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="What are you building?"
            maxLength={160}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website">
            <input
              className={input}
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://you.com"
            />
          </Field>
          <Field label="X (Twitter) username">
            <input
              className={input}
              value={form.x_handle}
              onChange={(e) => set("x_handle", e.target.value)}
              maxLength={30}
              autoCapitalize="none"
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className={input}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={50}
          />
        </Field>
      </Card>

      <Card title="Account" note="You sign in with Google.">
        <Field label="Email">
          <input
            className={`${input} bg-slate-50 text-slate-500`}
            type="email"
            value={email}
            readOnly
          />
        </Field>
        <button
          type="button"
          onClick={signOut}
          className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </Card>

      <Card title="Email notifications">
        <Toggle
          label="Launch updates"
          hint="When your launch goes live or gets approved."
          on={form.notify.launch}
          onChange={(v) => set("notify", { ...form.notify, launch: v })}
        />
        <Toggle
          label="New comments"
          hint="When someone comments on your product."
          on={form.notify.comments}
          onChange={(v) => set("notify", { ...form.notify, comments: v })}
        />
        <Toggle
          label="The Monday Launch newsletter"
          hint="Last week's top products, every Monday."
          on={form.notify.newsletter}
          onChange={(v) => set("notify", { ...form.notify, newsletter: v })}
        />
      </Card>

      <div className="badge-pop sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 pl-4">
        <p
          className={`flex items-center gap-2 text-xs ${
            message?.ok === false ? "text-rose-600" : "text-slate-500"
          }`}
        >
          {message ? (
            <>
              {message.ok ? (
                <Check className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <Info className="size-4 shrink-0" />
              )}
              {message.text}
            </>
          ) : (
            "Remember to save your changes."
          )}
        </p>
        <button
          type="submit"
          disabled={pending || uploading}
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
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteAccount();
                  if (!res.ok) {
                    setMessage({ ok: false, text: res.error });
                    return;
                  }
                  await supabaseBrowser().auth.signOut();
                  router.push("/");
                  router.refresh();
                })
              }
              className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-70"
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
