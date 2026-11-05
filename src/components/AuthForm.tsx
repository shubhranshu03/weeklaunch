"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import { GoogleIcon } from "./GoogleIcon";
import { LogoMark } from "./Logo";

// Only send people back to pages on this site
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get("error") ? "Sign-in didn't finish. Please try again." : "",
  );
  const signup = mode === "signup";

  const signIn = async () => {
    if (!supabaseConfigured) {
      setError("Sign-in isn't set up yet.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // On success the browser is already on its way to Google
    if (error) {
      setLoading(false);
      setError("Couldn't reach Google. Please try again.");
    }
  };

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
          onClick={signIn}
          disabled={loading}
          className="btn-pop mt-7 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-sm font-semibold text-slate-900 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-5" />
          )}
          Continue with Google
        </button>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            <Info className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <p className="mt-5 text-center text-xs text-slate-500">
          {signup
            ? "New here? Your account is created the first time you continue with Google."
            : "No account yet? Continuing with Google creates one for you."}{" "}
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
