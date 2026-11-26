"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Info, Loader2 } from "lucide-react";
// Only send people back to pages on this site (shared with the sign-in callback)
import { safeNext } from "@/lib/safeNext";
import { supabaseBrowser } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import { GoogleIcon } from "./GoogleIcon";
import { LogoMark } from "./Logo";

export const MIN_PASSWORD = 8;

// Plain-language versions of Supabase's sign-in errors
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match. Try again, or reset your password.";
  if (m.includes("email not confirmed"))
    return "Confirm your email first: open the link we sent you, then sign in.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "There's already an account with this email. Sign in instead.";
  if (m.includes("password should be") || m.includes("weak password"))
    return `Pick a stronger password: at least ${MIN_PASSWORD} characters.`;
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many tries. Wait a minute and try again.";
  if (m.includes("signups not allowed") || m.includes("provider is disabled"))
    return "Email sign-in isn't switched on yet. Use Google for now.";
  return "Something went wrong. Please try again.";
}

export const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-brand-100";

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        minLength={MIN_PASSWORD}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${field} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-900"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
    >
      <Info className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
    >
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const params = useSearchParams();
  const router = useRouter();
  const next = safeNext(params.get("next"));
  const signup = mode === "signup";

  const [google, setGoogle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(
    params.get("error") ? "Sign-in didn't finish. Please try again." : "",
  );

  const callback = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const withGoogle = async () => {
    if (!supabaseConfigured) return setError("Sign-in isn't set up yet.");
    setGoogle(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback() },
    });
    // On success the browser is already on its way to Google
    if (error) {
      setGoogle(false);
      setError("Couldn't reach Google. Please try again.");
    }
  };

  const withEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseConfigured) return setError("Sign-in isn't set up yet.");
    if (password.length < MIN_PASSWORD)
      return setError(
        `Your password needs at least ${MIN_PASSWORD} characters.`,
      );
    setBusy(true);
    setError("");
    setNotice("");
    const supabase = supabaseBrowser();

    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: callback(),
        },
      });
      setBusy(false);
      if (error) return setError(friendly(error.message));
      // Supabase hides whether the email is taken: a known email comes back with no identities
      if (data.user && data.user.identities?.length === 0)
        return setError(friendly("already registered"));
      if (!data.session) {
        setPassword("");
        return setNotice(
          `Almost done. We sent a link to ${email.trim()}: open it to confirm your email, and you're in.`,
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setBusy(false);
        return setError(friendly(error.message));
      }
    }

    // Signed in: go back to where they came from, with the new session
    router.replace(next);
    router.refresh();
  };

  const swap = `${signup ? "/signin" : "/signup"}${
    next !== "/" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-11" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {signup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {signup
              ? "Launch products, upvote and join the conversation."
              : "Sign in to manage your launches."}
          </p>
        </div>

        <button
          type="button"
          onClick={withGoogle}
          disabled={google || busy}
          className="btn-pop mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-sm font-semibold text-slate-900 disabled:opacity-70"
        >
          {google ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={withEmail} className="flex flex-col gap-4">
          {signup && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Your name
              </label>
              <input
                id="name"
                required
                maxLength={50}
                autoComplete="name"
                placeholder="Riya Kapoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>
          )}
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
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              {!signup && (
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? `At least ${MIN_PASSWORD} characters` : ""}
            />
            {signup && (
              <p className="mt-1.5 text-xs text-slate-500">
                Make a new password for IndieShip. Don&apos;t use your Gmail
                password.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={busy || google}
            className="btn-pop flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {signup ? "Create account" : "Sign in"}
          </button>
        </form>

        {error && <FormError>{error}</FormError>}
        {notice && <FormNotice>{notice}</FormNotice>}

        <p className="mt-5 text-center text-sm text-slate-600">
          {signup ? "Already have an account?" : "New to IndieShip?"}{" "}
          <Link
            href={swap}
            className="font-semibold text-brand-700 hover:underline"
          >
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>

        <p className="mt-3 text-center text-xs text-slate-500">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-900">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-slate-900">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
