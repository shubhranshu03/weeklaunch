import type { Metadata } from "next";
import Link from "next/link";
import { LaunchChecklist } from "@/components/tools/LaunchChecklist";
import { ToolLayout } from "@/components/ToolLayout";
import { tools } from "@/lib/tools";

const tool = tools.find((t) => t.slug === "launch-checklist")!;

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: `/tools/${tool.slug}` },
};

const faqs = [
  {
    q: "How long before launch should I start this checklist?",
    a: "Start 2–4 weeks before your launch day. That leaves time to prepare your tagline, screenshots, landing page and the people you'll tell.",
  },
  {
    q: "Is my progress saved?",
    a: "Yes. Your ticks are saved in your browser on this device, so you can close the page and come back later. Nothing is sent to our servers.",
  },
  {
    q: "What is the best day to launch a product?",
    a: "Early in the week is usually best because people are planning and browsing. On WeekLaunch every launch goes live on Monday and stays on the board all week.",
  },
  {
    q: "Do I need a demo video to launch?",
    a: "It's not required, but a short 30–60 second video showing the product in action helps visitors understand it quickly and usually improves sign-ups.",
  },
  {
    q: "Where should I launch my product?",
    a: "Launch on a few directories spread over several weeks rather than everywhere on one day. WeekLaunch gives every launch a full week on the board and a permanent product page.",
  },
];

export default function LaunchChecklistPage() {
  return (
    <ToolLayout
      tool={tool}
      intro="40 steps for before, during and after your product launch. Tick them off as you go — your progress is saved in your browser."
      steps={[
        "Start with the Before launch section 2–4 weeks ahead.",
        "Tick each step when it's done; the progress bar updates as you go.",
        "On launch day, work through the Launch day list from top to bottom.",
        "Use Copy as text to share the list with your team or paste it into your notes.",
      ]}
      faqs={faqs}
      guide={
        <>
          <h2>Why use a product launch checklist?</h2>
          <p>
            A launch day moves fast. Without a list, it&apos;s easy to forget
            the small things — a broken sign-up form, a missing share image, or
            not replying to early comments. A checklist lets you prepare calmly
            and spend launch day talking to people instead of fixing surprises.
          </p>
          <h2>The three stages of a good launch</h2>
          <ul>
            <li>
              <strong>Before launch:</strong> get your story, visuals and
              landing page ready, and line up the people you&apos;ll tell.
            </li>
            <li>
              <strong>Launch day:</strong> be present, reply fast, share updates
              and collect feedback.
            </li>
            <li>
              <strong>After launch:</strong> thank people, ship fixes, and keep
              the momentum with steady listings and updates.
            </li>
          </ul>
          <h2>Make your launch page work for you</h2>
          <p>
            Your tagline and share image show up everywhere your launch is
            linked. Write a clear one-liner with the{" "}
            <Link
              href="/tools/tagline-generator"
              className="font-medium text-brand-700 underline"
            >
              tagline generator
            </Link>{" "}
            and check how your page looks on Google and social media with the{" "}
            <Link
              href="/tools/meta-tag-generator"
              className="font-medium text-brand-700 underline"
            >
              meta tag generator
            </Link>
            . When you&apos;re ready,{" "}
            <Link
              href="/submit"
              className="font-medium text-brand-700 underline"
            >
              submit your product to WeekLaunch
            </Link>
            .
          </p>
        </>
      }
    >
      <LaunchChecklist />
    </ToolLayout>
  );
}
