"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import {
  FormError,
  FormNotice,
  MIN_PASSWORD,
  PasswordInput,
  field,
} from "./AuthForm";
import { LogoMark } from "./Logo";

function Card({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-11" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{blurb}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

const submit =
  "btn-pop flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70";

// Step 1: email a reset link
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) return setError("Sign-in isn't set up yet.");
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );
    setBusy(false);
    if (error)
      return setError(
        error.message.toLowerCase().includes("rate limit")
          ? "Too many tries. Wait a minute and try again."
          : "Couldn't send the email. Please try again.",
      );
    setSent(true);
  };

  return (
    <Card
      title="Reset your password"
      blurb="Enter your email and we'll send you a link to pick a new password."
    >
      <form onSubmit={send} className="mt-7 flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>
        <button type="submit" disabled={busy} className={submit}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </button>
      </form>
      {error && <FormError>{error}</FormError>}
      {sent && (
        <FormNotice>
          If there&apos;s an account for {email.trim()}, a reset link is on its
          way. Check your inbox and spam folder.
        </FormNotice>
      )}
      <p className="mt-5 text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link
          href="/signin"
          className="font-semibold text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}

// Step 2: the email link signs them in here; pick a new password
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // null while checking whether the reset link signed them in
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setLinked(!!data.user));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD)
      return setError(`Your password needs at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return setError(
        error.message.toLowerCase().includes("different from the old")
          ? "Pick a password you haven't used before."
          : "Couldn't save your password. Please try again.",
      );
    }
    router.replace("/dashboard");
    router.refresh();
  };

  if (linked === false)
    return (
      <Card
        title="This link has expired"
        blurb="Reset links work once and only for a short time. Ask for a new one."
      >
        <Link href="/forgot-password" className={`${submit} mt-7`}>
          Send a new link
        </Link>
      </Card>
    );

  return (
    <Card
      title="Pick a new password"
      blurb={`Use at least ${MIN_PASSWORD} characters.`}
    >
      <form onSubmit={save} className="mt-7 flex flex-col gap-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            New password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Type it again
          </label>
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={busy || linked === null}
          className={submit}
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          Save new password
        </button>
      </form>
      {error && <FormError>{error}</FormError>}
    </Card>
  );
}
