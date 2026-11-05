"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { payForLaunch } from "@/lib/actions/launches";

// Opens the Dodo Payments checkout for a launch
export function PayButton({
  productId,
  premium,
  boost = false,
  className,
  children,
}: {
  productId: string;
  premium: boolean;
  boost?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError("");
            const res = await payForLaunch(productId, { premium, boost });
            if (res.ok) window.location.assign(res.checkoutUrl);
            else setError(res.error);
          })
        }
        className={`${className} disabled:opacity-70`}
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        {children}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </span>
  );
}
