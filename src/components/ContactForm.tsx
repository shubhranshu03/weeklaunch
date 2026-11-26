"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { sendContactMessage } from "@/lib/actions/contact";
import { contactTopics } from "@/lib/contact";

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const topicRef = useRef<HTMLSelectElement>(null);
  // Ad and other buttons link here with ?topic=Advertising
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic");
    if (t && contactTopics.includes(t) && topicRef.current)
      topicRef.current.value = t;
  }, []);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-emerald-50 px-6 py-10 text-center">
        <CheckCircle2 className="size-8 text-emerald-600" />
        <p className="mt-3 font-semibold text-slate-900">Thanks for writing!</p>
        <p className="mt-1 text-sm text-slate-500">
          We got your message and will reply to your email within 2 working
          days.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const field = (k: string) => String(data.get(k) ?? "");
        setError("");
        startTransition(async () => {
          const res = await sendContactMessage({
            name: field("name"),
            email: field("email"),
            topic: field("topic"),
            message: field("message"),
            company: field("company"),
          });
          if (res.ok) setSent(true);
          else setError(res.error);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Name</span>
          <input
            className={`${input} mt-1.5 h-11`}
            name="name"
            autoComplete="name"
            maxLength={80}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Email</span>
          <input
            className={`${input} mt-1.5 h-11`}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={200}
            required
          />
        </label>
      </div>
      {/* Spam trap: hidden from people, bots fill it in */}
      <label
        aria-hidden
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Topic</span>
        <select className={`${input} mt-1.5 h-11`} name="topic" ref={topicRef}>
          {contactTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Message</span>
        <textarea
          className={`${input} mt-1.5 h-36 resize-none py-3`}
          name="message"
          required
          minLength={10}
          maxLength={4000}
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-pop flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send message"}
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </button>
    </form>
  );
}
