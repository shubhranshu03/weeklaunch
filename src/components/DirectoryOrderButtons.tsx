"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Play } from "lucide-react";
import { setDirectoryOrderStatus } from "@/lib/actions/directory";

// Admin buttons to move a directory order along
export function DirectoryOrderButtons({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const move = (next: "in_progress" | "done") =>
    startTransition(async () => {
      const res = await setDirectoryOrderStatus(orderId, next);
      if (res.ok) router.refresh();
    });

  return (
    <span className="flex gap-2">
      {status === "paid" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => move("in_progress")}
          className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 disabled:opacity-60"
        >
          <Play className="size-3.5" />
          Start
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => move("done")}
        className="btn-pop flex h-9 items-center gap-1 rounded-lg bg-emerald-300 px-3 text-xs font-bold text-slate-900 disabled:opacity-60"
      >
        <Check className="size-3.5" />
        Mark done
      </button>
    </span>
  );
}
