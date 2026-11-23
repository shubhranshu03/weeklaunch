"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { setMessageHandled } from "@/lib/actions/contact";

// Admin: mark a contact message done, or open it again
export function MessageButton({
  id,
  handled,
}: {
  id: string;
  handled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await setMessageHandled(id, !handled);
          if (res.ok) router.refresh();
        })
      }
      className={`btn-pop flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold text-slate-900 disabled:opacity-60 ${
        handled ? "bg-white" : "bg-emerald-300"
      }`}
    >
      {handled ? (
        <RotateCcw className="size-3.5" />
      ) : (
        <Check className="size-3.5" />
      )}
      {handled ? "Reopen" : "Mark done"}
    </button>
  );
}
