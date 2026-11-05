"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgeCheck, MessageSquare, Send, Trash2 } from "lucide-react";
import { addComment, deleteComment } from "@/lib/actions/community";
import type { CommentItem } from "@/lib/products";
import { useAuth } from "@/lib/useAuth";

const colors = ["#0ea5e9", "#ec4899", "#10b981", "#f59e0b", "#7c5cff"];

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Avatar({
  name,
  src,
  id,
}: {
  name: string;
  src: string | null;
  id: string;
}) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google or uploaded profile photo
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className="size-9 shrink-0 rounded-full object-cover"
      />
    );
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: colors[id.charCodeAt(0) % colors.length] }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}

export function Comments({
  productId,
  maker,
  initial,
  total,
}: {
  productId: string;
  maker: string;
  initial: CommentItem[];
  // Count on the product, which includes older comments from before accounts
  total: number;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [comments, setComments] = useState(initial);
  const [added, setAdded] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const post = () => {
    const body = text.trim();
    if (!body || !user) return;
    setError("");
    startTransition(async () => {
      const res = await addComment(productId, body);
      if (!res.ok) {
        setError(res.error === "signin" ? "Please sign in again." : res.error);
        return;
      }
      setComments((c) => [
        {
          id: res.id,
          body,
          created_at: res.created_at,
          user_id: user.id,
          author: {
            name: user.name,
            handle: user.handle,
            avatar_url: user.avatar,
          },
        },
        ...c,
      ]);
      setAdded((n) => n + 1);
      setText("");
    });
  };

  const remove = (id: string) =>
    startTransition(async () => {
      const res = await deleteComment(productId, id);
      if (res.ok) {
        setComments((c) => c.filter((x) => x.id !== id));
        setAdded((n) => n - 1);
      }
    });

  return (
    <section
      aria-labelledby="comments-title"
      className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2
        id="comments-title"
        className="flex items-center gap-2 font-semibold text-slate-900"
      >
        <MessageSquare className="size-4 text-brand-600" />
        Comments
        <span className="text-sm font-normal text-slate-400">
          {Math.max(total + added, comments.length)}
        </span>
      </h2>

      {user ? (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            post();
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Say something nice to ${maker}…`}
            aria-label="Write a comment"
            maxLength={1000}
            className="h-11 min-w-0 flex-1 rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            aria-label="Post comment"
            className="btn-pop flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
          >
            <Send className="size-4" />
          </button>
        </form>
      ) : (
        <Link
          href={`/signin?next=${encodeURIComponent(pathname)}`}
          className="mt-4 flex h-11 items-center justify-center rounded-xl border-[1.5px] border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-900 hover:text-slate-900"
        >
          Sign in to join the conversation
        </Link>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      {comments.length === 0 ? (
        <p className="mt-5 text-sm text-slate-400">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {comments.map((c) => {
            const name = c.author?.name || c.author?.handle || "Maker";
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar
                  name={name}
                  src={c.author?.avatar_url ?? null}
                  id={c.user_id}
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="flex items-center gap-1 text-sm">
                    {c.author?.handle ? (
                      <Link
                        href={`/makers/${c.author.handle}`}
                        className="font-semibold text-slate-900 hover:text-brand-700 hover:underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {name}
                      </span>
                    )}
                    {c.author?.verified && (
                      <BadgeCheck
                        className="size-3.5 shrink-0 fill-sky-500 text-white"
                        aria-label="Verified maker"
                      />
                    )}
                    <span
                      className="text-xs text-slate-400"
                      suppressHydrationWarning
                    >
                      · {timeAgo(c.created_at)}
                    </span>
                    {user?.id === c.user_id && (
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        disabled={pending}
                        aria-label="Delete comment"
                        className="ml-auto rounded-md p-1 text-slate-400 hover:bg-white hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">
                    {c.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
