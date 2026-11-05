"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { reviewLaunch } from "@/lib/actions/account";

// Approve or reject a launch on the admin page
export function ReviewButtons({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const decide = (decision: "approved" | "rejected") =>
    startTransition(async () => {
      const res = await reviewLaunch(productId, decision);
      if (res.ok) router.refresh();
      else setError(res.error);
    });

  return (
    <span className="flex flex-col items-end gap-1">
      <span className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("rejected")}
          className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-white px-3 text-xs font-semibold text-rose-700 disabled:opacity-60"
        >
          <X className="size-3.5" />
          Reject
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("approved")}
          className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-emerald-300 px-3 text-xs font-bold text-slate-900 disabled:opacity-60"
        >
          <Check className="size-3.5" />
          Approve
        </button>
      </span>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </span>
  );
}
