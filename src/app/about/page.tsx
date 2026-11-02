import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Scale, Users } from "lucide-react";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About — WeekLaunch",
  description:
    "WeekLaunch is a weekly launch board that gives indie makers and small teams a fair shot at getting seen.",
};

const values = [
  {
    icon: CalendarDays,
    title: "A fresh start every week",
    text: "The board resets every Monday, so new makers aren't buried under last month's winners.",
  },
  {
    icon: Scale,
    title: "Fair by design",
    text: "Every launch is reviewed by a person. Upvotes decide the ranking — no hidden deals.",
  },
  {
    icon: Users,
    title: "Made for makers",
    text: "Real feedback, a permanent product page and a backlink that keeps working after launch day.",
  },
];

export default function AboutPage() {
  return (
    <InfoPage
      title="About WeekLaunch"
      intro="A weekly launch board that gives indie makers and small teams a fair shot at getting seen."
    >
      <div className="not-prose grid gap-3 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl bg-slate-50 p-4">
            <span className="badge-pop flex size-9 items-center justify-center rounded-xl bg-amber-300 text-slate-900">
              <v.icon className="size-4" />
            </span>
            <p className="mt-3 font-semibold text-slate-900">{v.title}</p>
            <p className="mt-1 text-sm text-slate-500">{v.text}</p>
          </div>
        ))}
      </div>
      <section>
        <h2>Why we built it</h2>
        <p>
          Big launch sites move fast, and a product from a solo maker can
          disappear in an hour. WeekLaunch gives every launch a whole week on
          the board, then keeps its product page live for good — so the work you
          put into launching keeps paying off.
        </p>
      </section>
      <section>
        <h2>How it works</h2>
        <ul>
          <li>Submit your product and pick a launch week.</li>
          <li>Go live on Monday at 00:00 UTC.</li>
          <li>Collect upvotes, comments and visitors all week.</li>
          <li>Keep your product page and badge forever.</li>
        </ul>
      </section>
      <p>
        Ready to go?{" "}
        <Link href="/submit" className="font-semibold text-brand-700 underline">
          Launch your product
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand-700 underline"
        >
          say hello
        </Link>
        .
      </p>
    </InfoPage>
  );
}
