"use client";

import { useState, useTransition } from "react";
import { submitWithoutBoost } from "@/lib/actions/launches";

export function SubmitWithoutBoost({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError("");
            const res = await submitWithoutBoost(productId);
            if (!res.ok) setError(res.error);
          })
        }
        className="btn-pop flex h-9 items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 disabled:opacity-70"
      >
        Submit free, no Boost
      </button>
      {error && (
        <span role="alert" className="text-xs text-rose-600">
          {error}
        </span>
      )}
    </span>
  );
}
