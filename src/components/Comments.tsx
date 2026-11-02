"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

type Comment = { name: string; color: string; text: string; time: string };

const sample: Comment[] = [
  {
    name: "Sam R.",
    color: "#0ea5e9",
    text: "Congrats on the launch! Tried it this morning and the onboarding is really smooth.",
    time: "2h ago",
  },
  {
    name: "Lena K.",
    color: "#ec4899",
    text: "Is there a team plan coming? Would love to roll this out to my whole team.",
    time: "5h ago",
  },
];

// Comments are kept in the page only until there's a database
export function Comments({ maker }: { maker: string }) {
  const [comments, setComments] = useState(sample);
  const [text, setText] = useState("");

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
          {comments.length}
        </span>
      </h2>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setComments((c) => [
            { name: "You", color: "#7c5cff", text: text.trim(), time: "now" },
            ...c,
          ]);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Say something nice to ${maker}…`}
          aria-label="Write a comment"
          className="h-11 min-w-0 flex-1 rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          aria-label="Post comment"
          className="btn-pop flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600"
        >
          <Send className="size-4" />
        </button>
      </form>

      <ul className="mt-5 space-y-4">
        {comments.map((c, i) => (
          <li key={`${c.name}-${i}`} className="flex gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.name[0]}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm">
                <span className="font-semibold text-slate-900">{c.name}</span>{" "}
                <span className="text-xs text-slate-400">· {c.time}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
