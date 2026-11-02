"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const input =
  "w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

const topics = [
  "General question",
  "Launch help",
  "Advertising",
  "Partnership",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-emerald-50 px-6 py-10 text-center">
        <CheckCircle2 className="size-8 text-emerald-600" />
        <p className="mt-3 font-semibold text-slate-900">Thanks for writing!</p>
        <p className="mt-1 text-sm text-slate-500">
          This form is a preview — messages will be delivered once email is
          connected.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">Name</span>
          <input
            className={`${input} mt-1.5 h-11`}
            name="name"
            autoComplete="name"
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
            required
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-slate-900">Topic</span>
        <select className={`${input} mt-1.5 h-11`} name="topic">
          {topics.map((t) => (
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
        />
      </label>
      <button
        type="submit"
        className="btn-pop flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white hover:bg-brand-600"
      >
        Send message <Send className="size-4" />
      </button>
    </form>
  );
}
