"use client";

import Link from "next/link";
import { useState } from "react";
import { siGithub, siGoogle } from "simple-icons";
import { ArrowRight, Eye, EyeOff, Info } from "lucide-react";
import { LogoMark } from "./Logo";

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

function BrandButton({ name, path }: { name: string; path: string }) {
  return (
    <button
      type="button"
      className="btn-pop flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-sm font-semibold text-slate-900"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path d={path} fill="currentColor" />
      </svg>
      Continue with {name}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const signup = mode === "signup";

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

        <div className="mt-6 space-y-2.5">
          <BrandButton name="Google" path={siGoogle.path} />
          <BrandButton name="GitHub" path={siGithub.path} />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or with email
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          {signup && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Name</span>
              <input
                className={`${input} mt-1.5`}
                name="name"
                autoComplete="name"
                required
                placeholder="Your name"
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">Email</span>
            <input
              className={`${input} mt-1.5`}
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Password
              </span>
              {!signup && (
                <Link
                  href="#"
                  className="text-xs font-medium text-brand-700 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </span>
            <span className="relative mt-1.5 block">
              <input
                className={`${input} pr-11`}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={8}
                placeholder={signup ? "At least 8 characters" : "Your password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </span>
          </label>

          {submitted && (
            <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <Info className="size-4 shrink-0" />
              Accounts aren&apos;t connected yet — this form is a preview of the
              sign-in screen.
            </p>
          )}

          <button
            type="submit"
            className="btn-pop flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-bold text-white hover:bg-brand-600"
          >
            {signup ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        {signup && (
          <p className="mt-4 text-center text-xs text-slate-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-900">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-900">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        {signup ? "Already have an account?" : "New to WeekLaunch?"}{" "}
        <Link
          href={signup ? "/signin" : "/signup"}
          className="font-semibold text-brand-700 hover:underline"
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
